import express from 'express';
import multer from 'multer';
import { getPost, uploadPost, updatePost, likePost } from '../controllers/posts';

const router = express.Router();
const upload = multer();

router.get('/:id', getPost);
router.post('/', upload.array('images', 10), uploadPost);
router.patch('/:id', updatePost);

router.patch('./:id/likePost', likePost);

export default router;
