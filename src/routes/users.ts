import express from 'express';
import multer from 'multer';
import passport from 'passport';
import { postFollowing, deleteFollowing, getFollowing, getFollowers } from '../controllers/following';
import { deleteUser, getUser, putUser } from '../controllers/users';

const router = express.Router();
const upload = multer();

router.get('/:username', passport.authenticate('jwt', { session: false }), getUser);
router.put('/:username', passport.authenticate('jwt', { session: false }), upload.single('profile_pic'), putUser);
router.delete('/:username', passport.authenticate('jwt', { session: false }), deleteUser);

router.get('/:username/following', passport.authenticate('jwt', { session: false }), getFollowing);
router.get('/:username/followers', passport.authenticate('jwt', { session: false }), getFollowers);

router.post('/:username/following', passport.authenticate('jwt', { session: false }), postFollowing);
router.delete('/:username/following', passport.authenticate('jwt', { session: false }), deleteFollowing);

export default router;
