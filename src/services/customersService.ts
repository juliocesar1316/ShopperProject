import Joi from 'joi';
import bd from '../../conection';

export const customerSchema = Joi.object({
    measure_type: Joi.string().valid('WATER', 'GAS').insensitive().optional(),
    customerCode: Joi.string().required()
});

export const hasData = async (customerCode:string) => {
    const result = bd.query(`SELECT MD.MEASURE_UUID FROM MEASURE_DATA MD
        INNER JOIN CUSTOMERS C ON C.CUSTOMER_ID = MD.CUSTOMER_ID
        WHERE C.CUSTOMER_CODE = $1`, [customerCode]);
    
    return result;
};

export const getCustomer = async (customerCode:string, measure_type?: string) =>{
    let query =`
        SELECT 
        MD.MEASURE_UUID,
        MD.MEASURE_DATE,
        MT.MEASURE_TYPE_NAME MEASURE_TYPE,
        MD.HAS_CONFIRMED,
        MD.IMAGE_URL,
        CASE
            WHEN CO.IS_CONFIRMED = FALSE THEN CO.CONFIRMED_VALUE
            ELSE MD.MEASURE_VALUE
        END AS MEASURE_VALUE
        FROM MEASURE_DATA MD
        INNER JOIN CUSTOMERS C ON C.CUSTOMER_ID = MD.CUSTOMER_ID
        INNER JOIN MEASURE_TYPE MT ON MT.MEASURE_TYPE_ID = MD.MEASURE_TYPE_ID
        LEFT JOIN CONFIRMATION CO ON CO.MEASURE_UUID = MD.MEASURE_UUID
        WHERE C.CUSTOMER_CODE = $1
    `;

    const params = [customerCode];
    if (measure_type) {
        query += ` AND MT.MEASURE_TYPE_NAME = $2`;
        params.push(measure_type.toUpperCase());
    };

    const result = await bd.query(query, params);

    return result.rows;
}