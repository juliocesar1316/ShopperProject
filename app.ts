import express from 'express';
import routes from './rotes';
import { setupSwagger } from './swaggerConfig';
import config from './config';

const PORT = config.server.port;

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(routes);

setupSwagger(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;  