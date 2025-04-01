import express, { Express, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.routes';

const app: Express = express();
const prisma = new PrismaClient();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());
app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});
app.use('/api/auth', authRoutes);

export default app;