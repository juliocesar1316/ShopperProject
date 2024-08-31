import Joi from 'joi';
import bd from '../../conection';
import {GoogleGenerativeAI} from "@google/generative-ai"
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs'; 

dotenv.config();

export const uploadSchema = Joi.object({
    image: Joi.string().required(),
    customer_code: Joi.string().required(),
    measure_datetime: Joi.date().required(),
    measure_type: Joi.string().valid('WATER', 'GAS').required(),
});

function processBase64Image(base64String: string) {
    const regex = /^data:(.*);base64,(.*)$/;
    const matches = base64String.match(regex);
  
    if (!matches || matches.length !== 3) {
      throw new Error("Formato de imagem base64 inválido");
    }
  
    const mimeType = matches[1]; // ex: 'image/png'
    const data = matches[2]; // Base64 puro
  
    const image = {
      inlineData: {
        data: data,
        mimeType: mimeType
      },
    };
  
    return image;
};  


export const CheckDuplicate = async (customerCode: string, measureType: string, measureDatetime: Date) =>{
    const duplicate = await bd.query(`
        SELECT MD.MEASURE_UUID FROM MEASURE_DATA MD 
        INNER JOIN CUSTOMERS C ON C.CUSTOMER_ID = MD.CUSTOMER_ID
        INNER JOIN MEASURE_TYPE MT ON MT.MEASURE_TYPE_ID = MD.MEASURE_TYPE_ID
        WHERE C.CUSTOMER_CODE = $1 AND
        MT.MEASURE_TYPE_NAME = $2 AND
        DATE_TRUNC('month', MD.MEASURE_DATE) = DATE_TRUNC('month', $3::timestamp) AND
        DATE_TRUNC('year', MD.MEASURE_DATE) = DATE_TRUNC('year', $3::timestamp);
        `, [customerCode, measureType, measureDatetime]
    );

    return duplicate;
};


export const CaptureValueLLM = async (imageBase64: string): Promise<string | Error> => {

    const imageObject = processBase64Image(imageBase64);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not defined in the environment variables.');
    };

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const prompt = "Analyze the image of the water or gas meter. Ignore any other visual elements and return only the number.";

        const result = await model.generateContent([prompt, imageObject]);

        const response = await result.response;
        const text = response.text();
        return text;

    } catch (error:any) {
        return new Error(`Error processing image: ${error.message}`);
    }

};


export const saveImage = async (base64Image: string, customerCode: string, measureDatetime: Date) =>{

    const matches = base64Image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Formato de imagem inválido');
    };

    const formattedDate = dayjs(measureDatetime).format('YYYYMMDD');
    const fileName = `${customerCode}_${formattedDate}.jpg`;
    const buffer = Buffer.from(matches[2], 'base64');

    const uploadDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadDir, fileName);

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);
  
    return `images/${fileName}`;
};


export const insertMeasure = async (customerCode: string, captureValueImg: any, measureDatetime: Date, measureType: string, imageUrl:any) =>{
    const value = Number(captureValueImg);
    const customerResult  = await bd.query(`SELECT CUSTOMER_ID FROM CUSTOMERS WHERE CUSTOMER_CODE = $1`,[customerCode]);

    const measureTypeResult = await bd.query(`SELECT MEASURE_TYPE_ID FROM MEASURE_TYPE WHERE MEASURE_TYPE_NAME = $1`, [measureType]);

    const urlImage = `http://localhost:80/${imageUrl}`

    const insert = await bd.query(`
        INSERT INTO MEASURE_DATA (CUSTOMER_ID, MEASURE_VALUE, MEASURE_DATE, MEASURE_TYPE_ID, IMAGE_URL) VALUES ($1, $2, $3, $4, $5) RETURNING MEASURE_UUID  
    `, [customerResult.rows[0].customer_id, value, measureDatetime, measureTypeResult.rows[0].measure_type_id, urlImage]);
    
    const measureUuid = insert.rows[0].measure_uuid;

    return {value, measureUuid, urlImage };
};
