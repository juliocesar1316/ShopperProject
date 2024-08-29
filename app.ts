import express from 'express';
import rotas from './rotes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());
app.use(rotas);

const PORT = process.env.NODE_PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;  