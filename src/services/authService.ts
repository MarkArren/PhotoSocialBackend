import { query } from '../db/index';
import bcrypt from 'bcrypt';
import { QueryResult } from 'pg';
import jwt from 'jsonwebtoken';
import { TcpSocketConnectOpts } from 'net';
import crypto from 'crypto';

/**
 * Inserts new user into 'user' table
 * @param email Email of user
 * @param password Raw password of user
 * @param username Username
 * @param name Name
 * @returns Promise<string> - Id of user
 */
export const insertUser = (email: string, password: string, username: string, name: string) => {
    return new Promise<string>(async (resolve, reject) => {
        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create user in DB
        query('INSERT INTO users (email, password_hash, username, name) VALUES ($1, $2, $3, $4) RETURNING id', [
            email,
            password_hash,
            username,
            name,
        ])
            .then((res: QueryResult) => {
                resolve(res.rows[0]['id']);
            })
            .catch((err: Error) => {
                reject(err);
            });
    });
};

/**
 * Creates new user in DB
 * @param email Email
 * @param password Password
 * @param username Username
 * @param name Name
 * @returns Promise<void>
 */
export const createUser = (email: string, password: string, username: string, name: string) => {
    return new Promise<void>(async (resolve, reject) => {
        try {
            // Hash password
            const password_hash = await bcrypt.hash(password, 10);
            // Create user in DB
            const res = await query(
                `INSERT INTO users
                (email, password_hash, username, name)
                VALUES ($1, $2, $3, $4)`,
                [email, password_hash, username, name],
            );

            if (res.rowCount === 1) resolve();
            reject('Could not add to DB');
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Get user from DB and verifys the password is correct
 * @param email Email of user
 * @param password Password of user
 * @returns Promise<object> - User
 */
export const loginUser = async (email: string, password: string) => {
    return new Promise<object>(async (resolve, reject) => {
        let user;
        let passwordValid;

        // Fetch user from DB with email
        try {
            const res = await query('SELECT * FROM users WHERE email=$1', [email]);
            if (res.rows.length === 0) reject('User does not exist');
            user = res.rows[0];
        } catch (err) {
            reject(err);
        }

        // Compare if password to hashed password
        try {
            passwordValid = await bcrypt.compare(password, user['password_hash']);
        } catch (err) {
            reject(err);
        }

        if (passwordValid) resolve(user);
        reject('Incorrect Password');
    });
};

/**
 * Create jwt and refresh jwt
 * @param user User to create token for
 * @returns { token, refreshToken }
 */
export const createTokens = (user: any) => {
    if (!user.id) {
        console.error('User.id not provided when creating token');
        return;
    }
    // Create token
    const token = jwt.sign({}, 'TOP_SECRET', {
        subject: user.id,
        expiresIn: '1h',
    });

    // Create refresh token - NOTE different secret value
    const refreshToken = jwt.sign({}, 'TOP_SECRET_REFRESH', {
        subject: user.id,
        expiresIn: '7d',
    });

    // const refreshToken = crypto.randomBytes(48).toString('hex');

    // Send token back
    return [token, refreshToken];
};

export const verifyRefreshToken = (refreshToken: string): string | jwt.JwtPayload => {
    return jwt.verify(refreshToken, 'TOP_SECRET_REFRESH');
};
