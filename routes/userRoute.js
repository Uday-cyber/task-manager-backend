import express from 'express';
import { getUsers, loginUser, refreshToken, registerUser } from '../controllers/userController.js';

const userRoute = express.Router();

userRoute.post('/register', registerUser);
userRoute.get('/', getUsers);
userRoute.post('/login', loginUser);
userRoute.post('/refresh', refreshToken)

export default userRoute;