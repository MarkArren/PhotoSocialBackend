import express from 'express';
import passport from 'passport';
import { login, refreshToken, signup } from '../controllers/auth';
import { createTokens } from '../services/authService';

const router = express.Router();

// Refresh token endpoint - NOTE use a GET Request to limit CSRF
router.get('/token', refreshToken);
router.post('/signup', signup);
router.post('/login', login);

// router.post('/login', async (req, res, next) => {
//     passport.authenticate('login', async (err, user, info) => {
//         try {
//             // Returns errors/ info to client
//             if (err || !user) {
//                 if (info && info.message) {
//                     return res.status(400).json(info.message);
//                 }
//                 return res.status(400).json(err);
//             }

//             req.login(user, { session: false }, async (error) => {
//                 if (error) return next(error);

//                 // Create new token and refresh token
//                 const [token, refreshToken] = createTokens(user);

//                 // Send token back
//                 return res.status(200).json({
//                     auth: true,
//                     token,
//                     refreshToken,
//                     message: 'Successful login',
//                 });
//             });
//         } catch (error) {
//             return next(error);
//         }
//     })(req, res, next);
// });

export default router;
