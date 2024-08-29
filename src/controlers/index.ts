import { Request, Response } from 'express';

import { CheckDuplicate, CaptureValueLLM, uploadSchema } from '../services/services';


const upload = async (req: Request, res: Response) => {  
  const { error } = uploadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error_code: "INVALID_DATA", 
      error_description: error.message 
    });
  }
  const { customer_code, measure_type, measure_datetime } = req.body;

  try {
    const duplicate = await CheckDuplicate(customer_code, measure_type, measure_datetime);
    if(duplicate.rowCount){
      return res.status(409).json({
        error_code: 'DOUBLE_REPORT',
        error_description: 'Leitura do mês já realizada'
      });
    }
  
    const captureValueImg = await CaptureValueLLM(req.body.image);
    res.status(200).json({
      image_url: captureValueImg
    });
  
  
    // const insertdata = await insertMeasure(customer_code, captureValueImg, measure_datetime, measure_type );
  
    // res.status(200).json({
    //   image_url: insertdata.IMAGE_URL,
    //   measure_value: insertdata.MEASURE_VALUE,
    //   measure_uuid: insertdata.MEASURE_UUID,
    // });

  } catch (err:any) {
    return res.status(400).json({ 
        error_code: "INVALID_DATA", 
        error_description: err.message 
    });
  } 
}

export default upload;