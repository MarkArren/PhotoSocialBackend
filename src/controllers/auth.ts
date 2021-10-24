import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createTokens, createUser, loginUser, verifyRefreshToken } from '../services/authService';

/**
 * Controller for user log in
 * @param req
 * @param res
 * @returns
 */
export const login = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) return res.status(400).json('Missing email or password');

    // Get user from DB and verifys password
    let user;
    try {
        user = await loginUser(email, password);
    } catch (err) {
        return res.status(400).json('Incorrect Email or Password');
    }

    if (!user) {
        return res.status(400).json('Incorrect Email or Password');
    }

    // Create new token and refresh token
    const [token, refreshToken] = createTokens(user);

    // Send token back
    return res.status(200).json({
        auth: true,
        token,
        refreshToken,
        message: 'Successful login',
    });
};

/**
 * Controller for user sign up
 * @param req
 * @param res
 * @returns
 */
export const signup = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;
    const name = req.body.name;

    if (!email || !password || !username || !name)
        return res.status(400).json('Missing email, password, username or name');

    // Create user in db
    try {
        await createUser(email, password, username, name);
    } catch (err) {
        // Username or email already exists
        if (err.code === '23505') return res.status(400).json(err.detail);
        return res.status(400).json('Failed to add to DB');
    }

    // Login user
    let user;
    try {
        user = await loginUser(email, password);
    } catch (err) {
        res.status(400).json('Failed to login user');
    }

    // Get tokens and send them back
    const [newToken, newRefreshToken] = createTokens(user);

    return res.status(200).json({
        auth: true,
        token: newToken,
        refreshToken: newRefreshToken,
        message: 'Successfully signedup',
    });
};

export const refreshToken = async (req: Request, res: Response) => {
    // Check for token
    if (!req.body.refreshToken) return res.status(400).json('No refresh token provided');

    // Decrypt token
    let decryptedToken;
    try {
        decryptedToken = verifyRefreshToken(req.body.refreshToken);
    } catch (err) {
        return res.status(400).json('Invalid refresh token');
    }
    // Confirm as jwt object
    if (typeof decryptedToken === 'string') return res.status(400).json('Invalid refresh token');
    decryptedToken = decryptedToken as jwt.JwtPayload;

    // Check if token is valid
    if (Date.now() < decryptedToken.exp) return res.status(400).json('Refresh token expired');
    if (!decryptedToken.sub) return res.status(400).json('Refresh token invalid');

    // Create tokens
    const [newToken, newRefreshToken] = createTokens({ id: decryptedToken.sub });

    // Send token back
    return res.status(200).json({
        auth: true,
        token: newToken,
        refreshToken: newRefreshToken,
        message: 'Refreshed tokens',
    });
};
