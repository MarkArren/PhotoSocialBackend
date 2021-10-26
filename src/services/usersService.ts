import { QueryResult } from 'pg';
import { httpError } from '../helper/error';
import { query } from '../db/index';

interface User {
    id: string;
    username: string;
    name: string;
    bio: string;
    profile_pic: string;
    posts: number;
    likes: number;
}

export const getUserFromUsername = (username: string) => {
    return new Promise<User>((resolve, reject) => {
        query(`SELECT id, username, name, bio, profile_pic, likes, posts FROM users WHERE username=$1`, [username])
            .then((res: QueryResult) => {
                if (res.rows.length === 1) return resolve(res.rows[0]);
                else if (res.rows.length === 0) return reject(new httpError('User not found', 404));

                console.error(`Multiple users with username: ${username}!`);
                reject('Multiple users with username');
            })
            .catch((err: Error) => {
                console.error(err.message);
                reject('Failed to get user');
            });
    });
};

export const getUserFromID = (user_id: string) => {
    return new Promise<User>((resolve, reject) => {
        query(`SELECT id, username, name, bio, profile_pic, likes, posts FROM users WHERE id=$1`, [user_id])
            .then((res: QueryResult) => {
                if (res.rows.length === 1) return resolve(res.rows[0]);
                else if (res.rowCount === 0) return reject(new httpError('User not found', 404));

                console.error(`Multiple users with id: ${user_id}!`);
                reject('Multiple users with id');
            })
            .catch((err: Error) => {
                console.error(err.message);
                reject('Failed to get user');
            });
    });
};

export const updateUser = (username: string, name: string, bio: string, profile_pic: string, user_id: string) => {
    return new Promise<User>((resolve, reject) => {
        query(
            `UPDATE users SET username=$1, name=$2, bio=$3, profile_pic=$4
            WHERE id=$5
            RETURNING ID, username, name, profile_pic, bio, likes, posts`,
            [username, name, bio, profile_pic, user_id],
        )
            .then((res: QueryResult) => {
                if (res.rowCount === 1) return resolve(res.rows[0]);
                else if (res.rowCount === 0) return reject(new httpError('User not found', 404));

                console.error(`Multiple users with username: ${username}!`);
                reject('Multiple users with username');
            })
            .catch((err) => {
                if (err.code === '23505') return reject(new httpError('Username already taken', 409));
                console.error(err.message);
                reject('Failed to update user');
            });
    });
};

export const deleteUser = (user_id: string) => {
    return new Promise<void>((resolve, reject) => {
        query(`DELETE FROM users CASCADE WHERE id=$1`, [user_id])
            .then((res: QueryResult) => {
                if (res.rowCount === 1) return resolve();
                else if (res.rowCount === 0) return reject(new httpError('User not found', 404));

                console.error('Multiple rows deleted when deleting user!');
                reject('Multiple users deleted');
            })
            .catch((err: Error) => {
                console.error(err.message);
                reject('Failed to delete user');
            });
    });
};
