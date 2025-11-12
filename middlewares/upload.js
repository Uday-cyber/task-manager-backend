import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFile = ['.jpg', '.png', '.jpeg', '.gif', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if(!allowedFile.includes(ext)) {
        return cb(new Error('Only .jpg, .jpeg, .png, .gif, .pdf allowed'));
    }
    cb(null, true);
}

export const upload = multer({ storage, fileFilter });