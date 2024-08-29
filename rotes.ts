import express from 'express';
import {upload, serveImage} from './src/controlers/upload';
import { confirmData } from './src/controlers/confirm';
import { listCustomer } from './src/controlers/customers';

const routes = express.Router();

routes.post('/upload', upload);
routes.get('/images/:filename', serveImage);
routes.patch('/confirm', confirmData);
routes.get('/:customerCode/list/', listCustomer);

export default routes;