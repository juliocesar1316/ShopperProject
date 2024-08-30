import { Request, Response } from 'express';
import { customerSchema, hasData, getCustomer } from '../services/customersService';

/**
 * @swagger
 * /{customerCode}/list:
 *   get:
 *     summary: Lista as leituras de um cliente
 *     description: Retorna todas as leituras de um cliente específico com base no código do cliente e no tipo de medição opcional.
 *     parameters:
 *       - in: path
 *         name: customerCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Código do cliente para identificar as leituras.
 *         example: CUSTOMER123
 *       - in: query
 *         name: measure_type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [WATER, GAS]
 *         description: O tipo de medição a ser listado (WATER ou GAS).
 *     responses:
 *       200:
 *         description: Lista de leituras do cliente retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customer_code:
 *                   type: string
 *                   example: CUSTOMER123
 *                 measures:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       measure_uuid:
 *                         type: string
 *                         format: uuid
 *                         example: a7a45966-67be-420a-8e1e-7bd143730941
 *                       measure_date:
 *                         type: string
 *                         format: date-time
 *                         example: 2023-10-28T14:00:00Z
 *                       measure_type:
 *                         type: string
 *                         example: WATER
 *                       has_confirmed:
 *                         type: boolean
 *                         example: false
 *                       image_url:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *                       measure_value:
 *                         type: number
 *                         example: 123.45
 *       400:
 *         description: Tipo de medição não permitida.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                   example: INVALID_TYPE
 *                 error_description:
 *                   type: string
 *                   example: Tipo de medição não permitida.
 *       404:
 *         description: Nenhuma leitura encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                   example: MEASURES_NOT_FOUND
 *                 error_description:
 *                   type: string
 *                   example: Nenhuma leitura encontrada.
 */


export const listCustomer = async (req: Request, res: Response) => {
    const {customerCode} = req.params;
    const { measure_type } = req.query;

    const { error } = customerSchema.validate({ measure_type, customerCode });
    if (error) {
        return res.status(400).json({
        error_code: "INVALID_TYPE",
        error_description: "Tipo de medição não permitida",
        });
    };

    const confirmCustomer = await hasData(customerCode);
    if(confirmCustomer.rowCount === 0){
        return res.status(404).json({
            error_code: "MEASURES_NOT_FOUND",
            error_description: "Nenhuma leitura encontrada"
        });
    };

    const list = await getCustomer(customerCode, measure_type as string | undefined);
    if(list){
        res.status(200).json({
            customer_code: customerCode,
            measures: list
        });
    }

}