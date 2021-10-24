import express from 'express';
import multer from 'multer';
import passport from 'passport';
import { getPost, uploadPost, updatePost, likePost } from '../controllers/posts';

const router = express.Router();
const upload = multer();

router.get('/:id', getPost);
router.post('/', passport.authenticate('jwt', { session: false }), upload.array('images', 10), uploadPost);
router.patch('/:id', passport.authenticate('jwt', { session: false }), updatePost);

router.patch('./:id/likePost', likePost);

export default router;
