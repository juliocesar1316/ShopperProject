import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import express, { Express } from 'express';
import config from './config';

const url = config.api.baseUrl;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Medição de Água e Gás',
      version: '1.0.0',
      description: 'Documentação da API para gerenciamento de consumo de água e gás',
    },
    servers: [
      {
        url: url,
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./src/controlers/*.ts'], // Caminho para seus arquivos de controle com as anotações
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};