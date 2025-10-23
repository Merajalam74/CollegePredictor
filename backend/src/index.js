import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import paymentRoutes from './routes/payment.js';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => res.send('College Predictor API Running!'));

app.listen(PORT, () => console.log(`Backend server listening at http://localhost:${PORT}`));