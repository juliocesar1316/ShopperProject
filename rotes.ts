import express from 'express';
import upload from './src/controlers/index'

const rotes = express();

rotes.use('/upload', upload);
// rotes.use('/confirm', confirmRoutes);
// rotes.use('/:customerCode/list', listRoutes);

export default rotes;