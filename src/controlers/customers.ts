import { Request, Response } from 'express';
import { customerSchema, hasData, getCustomer } from '../services/customersService';


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