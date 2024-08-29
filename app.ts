import express from 'express';
import routes from './rotes';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(routes);

const PORT = 80;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;  