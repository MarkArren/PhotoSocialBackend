import { QueryResult } from 'pg';
import { query } from '../db/index';

/**
 * Get likes of post from DB
 * @param post_id
 * @returns Promise<string> - {user_id}
 */
export const getLikes = (post_id: string) => {
    return new Promise<any[]>((resolve, reject) => {
        query('SELECT user_id FROM LIKES WHERE post_id=$1', [post_id])
            .then((res: QueryResult) => {
                resolve(res.rows);
            })
            .catch((err: Error) => {
                console.error(err.message);
                reject('Failed to get likes from DB');
            });
    });
};

/**
 * Insert like into 'like' table
 * @param post_id
 * @param user_id
 * @returns Promise<void>
 */
export const insertLike = (post_id: string, user_id: string) => {
    return new Promise<void>((resolve, reject) => {
        query('INSERT INTO likes (post_id, user_id) VALUES ($1, $2)', [post_id, user_id])
            .then((res: QueryResult) => {
                resolve();
            })
            .catch((err: Error) => {
                console.error(err.message);
                reject('Failed to add like to DB');
            });
    });
};

/**
 * Delete like from 'like' table
 * @param post_id
 * @param user_id
 * @returns Promise<void>
 */
export const deleteLike = (post_id: string, user_id: string) => {
    return new Promise<void>((resolve, reject) => {
        query('DELETE FROM likes WHERE post_id=$1 AND user_id=$2', [post_id, user_id])
            .then((res: QueryResult) => {
                resolve();
            })
            .catch((err: Error) => {
                console.error(err.message);
                reject('Failed to delete like from DB');
            });
    });
};
