import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { CheckDuplicate, CaptureValueLLM, uploadSchema, insertMeasure, saveImage  } from '../services/uploadService';

/**
 * @swagger
 * /images/{filename}:
 *   get:
 *     summary: Retorna uma imagem armazenada no servidor
 *     description: Este endpoint serve uma imagem armazenada no servidor com base no nome do arquivo fornecido na URL. A imagem é recuperada do diretório de uploads.
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do arquivo da imagem a ser recuperada.
 *     responses:
 *       200:
 *         description: A imagem foi encontrada e é enviada com sucesso.
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Imagem não encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Imagem não encontrada
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Faz o upload de uma imagem para o servidor
 *     description: Envia uma imagem codificada em base64 e registra uma leitura de medição (WATER ou GAS) para um cliente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: base64
 *                 example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUg
 *                 description: Imagem codificada em base64.
 *               customer_code:
 *                 type: string
 *                 description: Código do cliente.
 *               measure_datetime:
 *                 type: string
 *                 format: date-time
 *                 description: Data e hora da medição.
 *               measure_type:
 *                 type: string
 *                 enum: [WATER, GAS]
 *                 description: Tipo da medição (WATER ou GAS).
 *     responses:
 *       200:
 *         description: Operação realizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 image_url:
 *                   type: string
 *                   description: URL da imagem armazenada.
 *                 measure_value:
 *                   type: integer
 *                   description: Valor da medição obtido.
 *                 measure_uuid:
 *                   type: string
 *                   format: uuid
 *                   description: UUID da medição registrada.
 *       400:
 *         description: Dados inválidos fornecidos na requisição.
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
 *                   example: Descrição detalhada do erro.
 */


export const upload = async (req: Request, res: Response) => {  
  const { error } = uploadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error_code: "INVALID_DATA", 
      error_description: error.message 
    });
  }
  const { customer_code, measure_type, measure_datetime, image } = req.body;

  try {
    const duplicate = await CheckDuplicate(customer_code, measure_type, measure_datetime);
    if(duplicate.rowCount != 0){
      return res.status(409).json({
        error_code: 'DOUBLE_REPORT',
        error_description: 'Leitura do mês já realizada'
      });
    }

    const savedImageUrl = await saveImage(image, customer_code, measure_datetime);
  
    const captureValueImg = await CaptureValueLLM(image);  
  
    const insertdata = await insertMeasure(customer_code, captureValueImg, measure_datetime, measure_type, savedImageUrl);
    if(insertdata){
      res.status(200).json({
        image_url: insertdata.urlImage,
        measure_value: insertdata.value,
        measure_uuid: insertdata.measureUuid
      });
    }
    
  } catch (err:any) {
    return res.status(400).json({ 
        error_code: "INVALID_DATA", 
        error_description: err.message 
    });
  }
};

export const serveImage = (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../uploads', filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Imagem não encontrada' });
  }
};
