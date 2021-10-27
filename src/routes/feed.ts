import express from 'express';
import passport from 'passport';

import { getFeed } from '../controllers/feed';

const router = express.Router();

router.get('/', passport.authenticate('jwt', { session: false }), getFeed);

export default router;
