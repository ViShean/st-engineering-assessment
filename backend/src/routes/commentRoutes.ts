import { Router } from 'express';
import * as commentController from '../controllers/commentController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.post('/upload', upload.single('file'), commentController.handleUpload);
router.get('/', commentController.getComments);
router.get('/status/:jobId', commentController.streamProgress);
router.delete('/reset', commentController.resetDatabase);

export default router;