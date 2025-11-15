import User from "../models/Users.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if(!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = new User({ username, email, password: passwordHash });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch(err){
        res.status(500).json({ message: 'Server error', error: err.message });
    }
} 

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        if(users.length === 0) {
            return res.status(200).json({ message: 'No users found' });
        }

        res.status(200).json(users);
    } catch(err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshTokens.push(refreshToken);
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        // const secret = process.env.JWT_SECRET || 'uday123';
        // const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1h' });

        res.status(200).json({ token: accessToken, message: 'Login successful' });
    } catch(err){
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

export const refreshToken = async(req, res) => {
    const token = req.cookie?.refreshToken;
    if(!token) return res.status(401).json({ error: 'No refresh token' });

    try{
        const payload  = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(payload.id);
        if(!user) return res.status(404).json({ error: 'User not found' });

        if(!user.refreshTokens.includes(token)) return res.status(403).json({error: 'Refresh Token revoked'});
        
        const newAccessToken = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: process.env.ACCESS_EXPIRES || '15m' });
        return res.json({newAccessToken});
    }
    catch (err) {
    console.error(err);
    return res.status(403).json({ error: "Invalid refresh token" });
    }
}

export const logoutUser = async (req, res) => {
    try{
        const token = req.cookie?.refreshToken;
        if(token) {
            const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            await User.findByIdAndUpdate(payload.id, {$pull: {refreshTokens: token}}); 
        }
    } catch(err){}

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    });
    res.json({message: 'User Logged Out'});
}