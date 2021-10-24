import { QueryResult } from 'pg';
import { query } from '../db/index';

/**
 * Get comments from a post
 * @param post_id
 * @returns Promise<string[]> - {user_id, comment_text, created_at}[]
 */
export const getComments = (post_id: string) => {
    return new Promise<object[]>((resolve, reject) => {
        query('SELECT id, user_id, comment_text, created_at FROM comments WHERE post_id=$1', [post_id])
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
 * Insert comment on a post
 * @param post_id
 * @param user_id
 * @returns Promise<string> - ID of comment
 */
export const insertComment = (post_id: string, user_id: string, comment: string) => {
    return new Promise<void>((resolve, reject) => {
        query(
            `INSERT INTO comments (post_id, user_id, comment_text)
                VALUES ($1, $2, $3) RETURNING id`,
            [post_id, user_id, comment],
        )
            .then((res: QueryResult) => {
                resolve(res.rows[0]['id']);
            })
            .catch((err: Error) => {
                console.error(err.message);
                reject('Failed to add comment to DB');
            });
    });
};

/**
 * Delete comment from table
 * @param comment_id
 * @param user_id
 * @returns Promise<void>
 */
export const deleteComment = (comment_id: string, post_id: string, user_id: string) => {
    return new Promise<void>((resolve, reject) => {
        query('DELETE FROM comments WHERE id=$1 AND post_id=$2 AND user_id=$3', [comment_id, post_id, user_id])
            .then((res: QueryResult) => {
                resolve();
            })
            .catch((err: Error) => {
                console.error(err.message);
                reject('Failed to delete comment from DB');
            });
    });
};
