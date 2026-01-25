import multer from 'multer';
import path from 'path';

const ALLOWED_MIMES = [
  'text/csv',
  'application/vnd.ms-excel',
  'text/comma-separated-values',
  'application/csv'
];
export const validateFile = (originalname: string, mimetype: string) => {
  const ext = path.extname(originalname || '').toLowerCase();
  return ext === '.csv' && ALLOWED_MIMES.includes(mimetype);
};
export const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB limit
        files: 1,                 // allow 1 file per request
    },
    fileFilter: (req, file, cb) => {
    if (validateFile(file.originalname, file.mimetype)) {
    cb(null, true);
    } else {
    cb(new Error('Invalid file type. Only .csv is allowed.'));
    }
}
});