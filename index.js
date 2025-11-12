import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import userRoute from './routes/userRoute.js';
import taskRoute from './routes/taskRoute.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

mongoose.connect(process.env.MONGODB_URI)
.then(() => { console.log('Connected to database')})
.catch((err) => { console.error('MongoDB is not connected', err)})

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/users', userRoute);
app.use('/tasks', taskRoute);

app.listen(process.env.PORT, () => {
    console.log(`Server on ${process.env.PORT}`);
});
