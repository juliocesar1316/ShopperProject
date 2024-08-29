import { Request, Response } from 'express';
import { confirmSchema, hasConfirmed, hasUuid, saveData } from '../services/confirmService';


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