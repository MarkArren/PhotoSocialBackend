import express from 'express';
import multer from 'multer';
import { getPost, uploadPost, updatePost, likePost } from '../controllers/posts.js';

const router = express.Router();
const upload = multer();

router.get('/:id', getPost);
router.post('/', upload.single('postUpload'), uploadPost);
router.patch('/:id', updatePost);

router.patch('./:id/likePost', likePost);

export default router;
