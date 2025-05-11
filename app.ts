import express, { NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { exceptionHandler } from './src/middlewares/exceptionhandler/index.js';
import router from './src/routes/index.js';

const app = express();

app.use(cors());
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', router);

// Error handling middleware
app.use(exceptionHandler);

export default app;
