import express from 'express';
import multer from 'multer';
import passport from 'passport';
import { getPost, uploadPost, updatePost, deletePost } from '../controllers/posts';
import { getLikes, likePost, unLikePost } from '../controllers/likes';
import { addComment, getComments, removeComment } from '../controllers/comments';

const router = express.Router();
const upload = multer();

router.get('/:post_id', getPost);
router.post('/', passport.authenticate('jwt', { session: false }), upload.array('images', 10), uploadPost);
router.patch('/:post_id', passport.authenticate('jwt', { session: false }), updatePost);
router.delete('/:post_id', passport.authenticate('jwt', { session: false }), deletePost);

// Like routes
router.get('/:post_id/likes', passport.authenticate('jwt', { session: false }), getLikes);
router.post('/:post_id/like', passport.authenticate('jwt', { session: false }), likePost);
router.delete('/:post_id/like', passport.authenticate('jwt', { session: false }), unLikePost);

// Comment routes
router.get('/:post_id/comments', passport.authenticate('jwt', { session: false }), getComments);
router.post('/:post_id/comment', passport.authenticate('jwt', { session: false }), addComment);
router.delete('/:post_id/comment/:comment_id', passport.authenticate('jwt', { session: false }), removeComment);

export default router;
