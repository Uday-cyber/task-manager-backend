import express from 'express';
import { getUsers, loginUser, registerUser } from '../controllers/userController.js';

const userRoute = express.Router();

userRoute.post('/register', registerUser);
userRoute.get('/', getUsers);
userRoute.post('/login', loginUser);

export default userRoute;