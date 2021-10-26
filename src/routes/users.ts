import express from 'express';
import multer from 'multer';
import passport from 'passport';
import { deleteUser, getUser, putUser } from '../controllers/users';

const router = express.Router();
const upload = multer();

router.get('/:username', passport.authenticate('jwt', { session: false }), getUser);
router.put('/:username', passport.authenticate('jwt', { session: false }), upload.single('profile_pic'), putUser);
router.delete('/:username', passport.authenticate('jwt', { session: false }), deleteUser);

export default router;
