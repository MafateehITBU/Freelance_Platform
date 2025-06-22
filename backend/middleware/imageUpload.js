import multer from 'multer';
import path from 'path';

const allowedImageTypes = /jpeg|jpg|png|gif|webp|heic|heif/;

const imageFileFilter = (req, file, cb) => {
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedImageTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error("Only image files are allowed (JPG, PNG, etc)."));
};

const imageStorage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    },
});

const imageUpload = multer({
    storage: imageStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

export default imageUpload;