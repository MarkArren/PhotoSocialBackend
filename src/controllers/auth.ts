import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createTokens, verifyRefreshToken } from '../services/authService';

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
    console.log(decryptedToken.sub);
    const [newToken, newRefreshToken] = createTokens({ id: decryptedToken.sub });

    // Send token back
    return res.status(200).json({
        auth: true,
        token: newToken,
        refreshToken: newRefreshToken,
        message: 'Refreshed tokens',
    });
};
