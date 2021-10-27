import { QueryResult } from 'pg';
import { query } from '../db';

export const getFeed = (user_id: string) => {
    return new Promise<any[]>((resolve, reject) => {
        query(
            `SELECT posts.id, posts.user_id, posts.caption, posts.created_at, post_files.filename, post_files.index 
            FROM posts 
            INNER JOIN following ON posts.user_id = following.following_user_id 
            INNER JOIN post_files ON posts.id = post_files.post_id 
            WHERE following.user_id = $1 `,
            [user_id],
        )
            .then((res: QueryResult) => {
                resolve(res.rows);
            })
            .catch((err: Error) => {
                console.error(err.message);
                reject('Failed to get following');
            });
    });
};
