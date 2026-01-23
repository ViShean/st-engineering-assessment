import multer from 'multer';
import path from 'path';


export const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const mimetype = file.mimetype;
        const allowedMimes = ['text/csv', 'application/vnd.ms-excel', 'text/comma-separated-values'];

    if (ext === '.csv' && allowedMimes.includes(mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only .csv is allowed.'));
    }
    }
});