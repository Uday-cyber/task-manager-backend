import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';

import userRoute from './routes/userRoute.js';
import taskRoute from './routes/taskRoute.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: "https://task-manager-frontend-lac-eight.vercel.app",
    credentials: true,
}));
app.use(cookieParser());  
app.use(express.json());
app.use(morgan('dev'));

mongoose.connect(process.env.MONGODB_URI)
.then(() => { console.log('Connected to database')})
.catch((err) => { console.error('MongoDB is not connected', err)})

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// app.use(express.static(path.join(process.cwd(), 'uploads')));

app.use('/users', userRoute);
app.use('/tasks', taskRoute);

app.listen(process.env.PORT, () => {
    console.log(`Server on ${process.env.PORT}`);
});
