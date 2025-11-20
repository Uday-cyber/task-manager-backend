import cloudinary from "../config/cloudinary.js";
import Task from "../models/Tasks.js";

// Helper function to upload file to Cloudinary using stream
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "tasks_uploads", resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

// CREATE TASK
export const createTask = async (req, res) => {
  try {
    let fileUrl = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer); // upload file
      fileUrl = result.secure_url;
    }

    const newTask = await Task.create({
      ...req.body,
      user: req.user._id,
      file: fileUrl,
    });

    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET ALL TASKS
export const getAllTasks = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    let query = {};

    if (req.user.role === "admin") {
      query = {};
    } else {
      query.user = req.user._id;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate("user", "username email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Task.countDocuments(query),
    ]);

    res.json({
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      tasks,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE TASK
export const updateTask = async (req, res) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      task.file = result.secure_url;
    }

    // Update text fields
    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    task.status = req.body.status ?? task.status;

    await task.save();

    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE TASK
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Cloudinary deletion optional: requires storing public_id
    // We skip it for now (URL only)

    await task.deleteOne();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};








// import fs from 'fs';
// import path from 'path';

// import Task from "../models/Tasks.js";

// export const createTask = async (req, res) => {
//     try{
//         // const filePath = req.file ? `/uploads/${req.file.filename}` : null;

//         const filePath = req.file ? req.file.path : null;   
        
//         const createrTask = await Task.create({
//             ...req.body,
//             user: req.user._id,
//             file: filePath
//         });

//         res.status(201).json({ message: 'Task created successfully', task: createrTask });
//     } catch(err){
//         res.status(500).json({ message: 'Server error', error: err.message });
//     }
// }

// export const getAllTasks = async (req, res) => {
//     try {
//         const { search, page = 1, limit = 5, sort = '-createdAt' } = req.query;
//         const query = { user: req.user._id };

//         if(search) {
//             query.title = { $regex: search, $options: 'i'};
//         }

//         const tasks = await Task.find(query)
//         .sort(sort)
//         .skip((page - 1) * limit)
//         .limit(parseInt(limit));

//         res.status(200).json(tasks);
//     } catch(err){
//         res.status(500).json({ message: 'Server error', error: err.message });
//     }
// }

// export const updateTask = async (req, res) => {
//     try{
//         let task = await Task.findOne({ _id: req.params.id, user: req.user._id });
//         if(!task) {
//             return res.status(404).json({ message: 'Task not found' });
//         }

//         if(req.file){
//             // if(task.file){
//             //     const fullpath = path.join(process.cwd(), task.file);
//             //     fs.unlinkSync(fullpath);
//             // }
//             // task.file = `/uploads/${req.file.filename}`;
//             task.file = req.file.path;
//         }

//         // task = await Task.findByIdAndUpdate(
//         //     task._id,
//         //     req.body,
//         //     { new: true }
//         // );

//         task.title = req.body.title ?? task.title;
//         task.description = req.body.description ?? task.description;
//         task.status = req.body.status ?? task.status;

//         await task.save();

//         res.status(200).json({ message: 'Task updated successfully', task });
//     } catch(err){
//         res.status(500).json({ message: 'Server error', error: err.message });
//     }
// }

// export const deleteTask = async (req, res) => {
//     try {
//         const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
//         if(!task){
//             return res.status(404).json({ message: 'Task not found' });
//         }

//         // if(task.file){
//         //     const fullpath = path.join(process.cwd(), task.file);
//         //     fs.unlinkSync(fullpath);
//         // }

//         await task.deleteOne();

//         res.status(200).json({ message: 'Task deleted successfully' });
//     } catch(err) {
//         res.status(500).json({ message: 'Server error', error: err.message });
//     }
// } 