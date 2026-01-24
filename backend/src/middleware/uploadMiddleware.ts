import multer from 'multer';
import path from 'path';


export const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB limit
        files: 1,                 // allow 1 file per request
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const mimetype = file.mimetype;
        const allowedMimes = [
                    'text/csv', 
                    'application/vnd.ms-excel', 
                    'text/comma-separated-values',
                    'application/csv'
                ];
    if (ext === '.csv' && allowedMimes.includes(mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only .csv is allowed.'));
    }
    }
});