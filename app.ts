import express from 'express';
import routes from './rotes';
import { setupSwagger } from './swaggerConfig'; 

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(routes);

setupSwagger(app);

const PORT = 80;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;  