import Joi from 'joi';
import bd from '../../conection';
import { validate as uuidValidate } from 'uuid';

const uuidValidator = (value: string, helpers: Joi.CustomHelpers) => {
    if (!uuidValidate(value)) {
      return helpers.error('any.invalid');
    }
    return value;
};

export const confirmSchema = Joi.object({
    measure_uuid: Joi.string().custom(uuidValidator, 'UUID Validation').required(),
    confirmed_value: Joi.number().required(),
});

export const hasUuid = async (measure_uuid:string) => {
    const confirmResult = await bd.query(`SELECT MEASURE_UUID FROM MEASURE_DATA WHERE MEASURE_UUID = $1`, [measure_uuid]);
    return  confirmResult;
};

export const hasConfirmed = async (measure_uuid:string) => {
    const confirmResult = await bd.query(`SELECT CONFIRMATION_ID FROM CONFIRMATION WHERE MEASURE_UUID = $1`, [measure_uuid]);
    return confirmResult;
};

export const saveData = async (measure_uuid:string, confirmed_value:number) =>{
    let boolean = '';

    const compare = await bd.query(`SELECT MEASURE_UUID FROM MEASURE_DATA WHERE MEASURE_VALUE = $1`,[confirmed_value]);
    if(compare.rowCount === 0){
        boolean = 'F';
    }else{
        boolean = 'T';
    }

    const insert = await bd.query(`INSERT INTO CONFIRMATION (MEASURE_UUID, CONFIRMED_VALUE, IS_CONFIRMED ) VALUES ($1, $2, $3)`, [measure_uuid, confirmed_value, boolean ]);
    const update = await bd.query(`UPDATE MEASURE_DATA SET HAS_CONFIRMED = 'T' WHERE MEASURE_UUID = $1`, [measure_uuid]);

    return boolean;
};