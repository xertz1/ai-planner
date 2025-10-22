import 'dotenv/config'; 
import express from 'express'; 
import cors from 'cors'; 
import planRoute from './ai/planRoute.js';


const app = express();
const PORT = 44000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/ai', planRoute);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`AI backend running on port ${PORT}`);
});