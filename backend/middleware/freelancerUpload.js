import multer from 'multer';
import path from 'path';

const allowedImageTypes = /jpeg|jpg|png|webp|gif|heic|heif/;
const allowedPdfTypes = /pdf/;

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${file.fieldname}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    if (file.fieldname === 'profilePicture' || file.fieldname === 'personalIdImage') {
        if (allowedImageTypes.test(ext) && allowedImageTypes.test(mimetype)) {
            return cb(null, true);
        }
    }

    if (file.fieldname === 'portfolio') {
        if (allowedPdfTypes.test(ext) && allowedPdfTypes.test(mimetype)) {
            return cb(null, true);
        }
    }

    cb(new Error('Only valid images or PDF files are allowed.'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

export default upload;