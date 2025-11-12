import fs from 'fs';
import path from 'path';

import Task from "../models/tasks.js";

export const createTask = async (req, res) => {
    try{
        const filePath = req.file ? `/uploads/${req.file.filename}` : null;

        const createrTask = await Task.create({
            ...req.body,
            user: req.user._id,
            file: filePath
        });

        res.status(201).json({ message: 'Task created successfully', task: createrTask });
    } catch(err){
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

export const getAllTasks = async (req, res) => {
    try {
        const { search, page = 1, limit = 5, sort = '-createdAt' } = req.query;
        const query = { user: req.user._id };

        if(search) {
            query.title = { $regex: search, $options: 'i'};
        }

        const tasks = await Task.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

        res.status(200).json(tasks);
    } catch(err){
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

export const updateTask = async (req, res) => {
    try{
        let task = await Task.findOne({ _id: req.params.id, user: req.user._id });
        if(!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if(req.file){
            if(task.file){
                const fullpath = path.join(process.cwd(), task.file);
                fs.unlinkSync(fullpath);
            }
            task.file = `/uploads/${req.file.filename}`;
        }

        // task = await Task.findByIdAndUpdate(
        //     task._id,
        //     req.body,
        //     { new: true }
        // );

        task.title = req.body.title ?? task.title;
        task.description = req.body.description ?? task.description;
        task.status = req.body.status ?? task.status;

        await task.save();

        res.status(200).json({ message: 'Task updated successfully', task });
    } catch(err){
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
        if(!task){
            return res.status(404).json({ message: 'Task not found' });
        }

        if(task.file){
            const fullpath = path.join(process.cwd(), task.file);
            fs.unlinkSync(fullpath);
        }

        await task.deleteOne();

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch(err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
} 