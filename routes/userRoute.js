import express from 'express';
import { getUsers, loginUser, logoutUser, refreshToken, registerUser } from '../controllers/userController.js';
import { authRole } from '../middlewares/authRole.js';
import { protect } from '../middlewares/auth.js';

const userRoute = express.Router();

userRoute.post('/register', registerUser);
userRoute.get('/', protect, authRole("admin"),getUsers);
userRoute.post('/login', loginUser);
userRoute.post('/refresh', refreshToken);
userRoute.post('/logout', logoutUser);

export default userRoute;