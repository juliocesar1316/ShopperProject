import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

import { CheckDuplicate, CaptureValueLLM, uploadSchema, insertMeasure, saveImage  } from '../services/uploadService';


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
