import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    title: {
        type: String,
        required: [true, 'Title is required']
    },

    description: {
        type: String,
        required: [true, 'Description is required']
    },

    file: {
        type: String,
    },

    status: {
        type: String,
        default: 'pending'
    }
}, { timestamps: true });

const Task = mongoose.model('Task', TaskSchema);
export default Task;