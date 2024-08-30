import { Request, Response } from 'express';
import { confirmSchema, hasConfirmed, hasUuid, saveData } from '../services/confirmService';

/**
 * @swagger
 * /confirm:
 *   patch:
 *     summary: Confirma a leitura de uma medição
 *     description: Endpoint para confirmar uma leitura de medição com base em um UUID. O valor da medição confirmada será salvo no banco de dados.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               measure_uuid:
 *                 type: string
 *                 format: uuid
 *                 description: UUID da medição a ser confirmada.
 *               confirmed_value:
 *                 type: number
 *                 description: Valor confirmado da medição.
 *             required:
 *               - measure_uuid
 *               - confirmed_value
 *     responses:
 *       200:
 *         description: Confirmação bem-sucedida da medição.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Dados inválidos fornecidos na solicitação.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                   example: INVALID_DATA
 *                 error_description:
 *                   type: string
 *                   example: "Mensagem de erro detalhada."
 *       404:
 *         description: Medição não encontrada com o UUID fornecido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                   example: MEASURE_NOT_FOUND
 *                 error_description:
 *                   type: string
 *                   example: "Leitura do mês já realizada"
 *       409:
 *         description: A medição já foi confirmada anteriormente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                   example: CONFIRMATION_DUPLICATE
 *                 error_description:
 *                   type: string
 *                   example: "Leitura do mês já realizada"
 */

export const confirmData = async (req: Request, res: Response) => {
    const { error } = confirmSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
        error_code: "INVALID_DATA", 
        error_description: error.message 
        });
    };

    const {measure_uuid, confirmed_value} = req.body;

    const confirmReadingUuid = await hasUuid(measure_uuid);
    if(confirmReadingUuid.rowCount === 0){
        return res.status(404).json({ 
            error_code: "MEASURE_NOT_FOUND", 
            error_description:  "Leitura do mês já realizada" 
        });
    };

    const confirmReadingConfirmed = await hasConfirmed(measure_uuid);
    if(confirmReadingConfirmed.rowCount != 0){
        return res.status(409).json({ 
            error_code: "CONFIRMATION_DUPLICATE", 
            error_description:  "Leitura do mês já realizada" 
        });
    };

    const saveConfirmed = await saveData(measure_uuid, confirmed_value);
    if(saveConfirmed){
        res.status(200).json({
            success: true
        });
    };

};