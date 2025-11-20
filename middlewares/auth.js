import jwt from 'jsonwebtoken';

import User from '../models/user.js';

export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try{
        const secret = process.env.JWT_SECRET || 'uday123';
        const decoded = jwt.verify(token, secret);

        const user = await User.findById(decoded.id).select('-password');
        if(!user){
            return res.status(401).json({ message: 'User not found or invalid token'})
        }
        req.user = user;
        next();
    } catch(err){
        if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
        return res.status(401).json({ error: 'Token is not valid', details: err.message });
    }
}