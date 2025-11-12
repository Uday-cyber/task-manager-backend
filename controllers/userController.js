import User from "../models/Users.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

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

        const secret = process.env.JWT_SECRET || 'uday123';
        const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1h' });

        res.status(200).json({ token, message: 'Login successful' });
    } catch(err){
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}