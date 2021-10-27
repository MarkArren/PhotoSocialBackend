import { QueryResult } from 'pg';
import { query } from '../db/index';

export const getFollowing = (user_id: string) => {
    return new Promise<string[]>((resolve, reject) => {
        query(`SELECT following_user_id FROM following WHERE user_id=$1`, [user_id])
            .then((res: QueryResult) => {
                resolve(res.rows);
            })
            .catch((err: Error) => {
                console.error(err.message);
                reject('Failed to get following');
            });
    });
};

export const getFollowers = (user_id: string) => {
    return new Promise<string[]>((resolve, reject) => {
        query(`SELECT user_id FROM following WHERE following_user_id=$1`, [user_id])
            .then((res: QueryResult) => {
                resolve(res.rows);
            })
            .catch((err: Error) => {
                console.error(err.message);
                reject('Failed to get following');
            });
    });
};

export const insertFollowing = (user_id: string, following_id: string) => {
    return new Promise<string>((resolve, reject) => {
        query(`INSERT INTO following (user_id, following_user_id) VALUES ($1, $2)`, [user_id, following_id])
            .then((res: QueryResult) => {
                if (res.rowCount === 1) {
                    return resolve('Followed user');
                }
                console.error('Failed to insert into following table');
                return resolve('Failed to follow user');
            })
            .catch((err: Error) => {
                console.error(err.message);
                reject('Failed to delete like from DB');
            });
    });
};

export const deleteFollowing = (user_id: string, following_id: string) => {
    return new Promise<string>((resolve, reject) => {
        query('DELETE FROM following WHERE user_id=$1 AND following_user_id=$2', [user_id, following_id])
            .then((res: QueryResult) => {
                if (res.rowCount === 1) {
                    return resolve('Unfollowed user');
                } else if (res.rowCount === 0) {
                    return resolve('Already not following user');
                }
                console.error('Deleted multiple following rows');
                return resolve('Unfollowed users');
            })
            .catch((err: Error) => {
                console.error(err.message);
                reject('Failed to delete like from DB');
            });
    });
};
