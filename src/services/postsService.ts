// TODO add service logic code
import { QueryResult } from 'pg';
import { query } from '../db/index';
import { postsBucket } from '../db/gcp';
import { v4 as uuidv4 } from 'uuid';
import { httpError } from '../helper/error';

interface Post {
    id: string;
    user_id: string;
    caption: string;
    created_at: string;
}

interface PostFile {
    id: string;
    post_id: string;
    caption: string;
    created_at: string;
}

export const getPost = (post_id: string) => {
    return new Promise<Post>((resolve, reject) => {
        query(`SELECT id, user_id, caption, created_at FROM posts WHERE id=$1`, [post_id])
            .then((res: QueryResult) => {
                if (res.rows.length === 1) return resolve(res.rows[0]);
                else if (res.rows.length === 0) return reject(new httpError('Post not found', 404));

                console.error(`Multiple posts with id: ${post_id}!`);
                reject('Multiple users with username');
            })
            .catch((err) => {
                if (err.code === '22P02') return reject(new httpError('Post not found', 404));
                console.error(err.message);
                reject('Failed to get post');
            });
    });
};

export const updatePost = (post_id: string, caption: string, user_id: string) => {
    return new Promise<Post>((resolve, reject) => {
        query(
            `UPDATE posts 
        SET caption=$1 
        WHERE id=$2 AND user_id=$3
        RETURNING id, user_id, caption, created_at`,
            [caption, post_id, user_id],
        )
            .then((res: QueryResult) => {
                if (res.rows.length === 1) return resolve(res.rows[0]);
                else if (res.rows.length === 0) return reject(new httpError('Post not found', 404));

                console.error(`Multiple posts with id: ${post_id}!`);
                reject('Multiple users with username');
            })
            .catch((err) => {
                if (err.code === '22P02') return reject(new httpError('Post not found', 404));
                console.error(err.message);
                reject('Failed to get post');
            });
    });
};

export const getPostFiles = (post_id: string) => {
    return new Promise<any[]>((resolve, reject) => {
        query(
            `SELECT filename, index 
            FROM post_files 
            WHERE post_id=$1`,
            [post_id],
        )
            .then((res: QueryResult) => {
                if (res.rowCount === 0) return reject(new httpError('Post files not found', 404));
                return resolve(res.rows);
            })
            .catch((err: Error) => {
                console.error(err.message);
                reject('Failed to get post files');
            });
    });
};

/**
 * Uploads files (img/vid) to GCP Bucket
 * @param files Files to be uploaded
 * @returns Promise<string[]> - URL of all images
 */
export const uploadImagesToBucket = (files: File[]) => {
    return new Promise<string[]>(async (resolve, reject) => {
        resolve(await Promise.all(files.map((file) => uploadImageToBucket(file))));
    });
};

/**
 * Uploads a file (img/vid) to GCP Bucket
 * @param file File to be uploaded
 * @returns Promise<string> - URL of image
 */
export const uploadImageToBucket = async (file: any, makePublic?: boolean) =>
    new Promise<string>((resolve, reject) => {
        // If testing return skip upload
        if (process.env.NODE_ENV === 'test') return resolve('testURL.com');
        try {
            // Create file in bucket and write stream
            const filename = uuidv4();
            const blob = postsBucket.file(`${filename}.${file.originalname.split('.').pop()}`);
            const blobStream = blob.createWriteStream({
                resumable: false,
            });

            // Check for errors
            blobStream.on('error', (err) => {
                console.error('Error uploading image to gcp');
                reject(err.message);
            });

            // Once finished return URL
            blobStream.on('finish', async () => {
                // Create URL for directly file access via HTTP.
                const publicUrl = `https://storage.googleapis.com/photo-social-posts/${blob.name}`;
                if (makePublic) {
                    try {
                        // Make the file public
                        await postsBucket.file(blob.name).makePublic();
                    } catch (Err) {
                        console.error(`Failed to make file: ${blob.name} public`);
                    }
                }
                resolve(blob.name);
            });

            blobStream.end(file.buffer);
        } catch (err) {
            reject(`Could not upload the file: ${file.originalname}. ${err}`);
        }
    });

/**
 * Insert post in to 'post' table
 * @param user_id Author of post
 * @param caption Caption of post
 * @returns Promise<string> - ID of post
 */
export const insertPost = (user_id: string, caption: string) => {
    return new Promise<string>((resolve, reject) => {
        query(
            `INSERT INTO posts (user_id, caption) 
            VALUES ($1, $2) RETURNING id, caption`,
            [user_id, caption],
        )
            .then((res: QueryResult) => {
                resolve(res.rows[0]['id']);
            })
            .catch((err: Error) => {
                console.error(err.message);
                reject('Failed to add post to DB');
            });
    });
};

/**
 * Insert post files in to 'post_file' table
 * @param post_id ID of post
 * @param fileUrl URLs of image/ video
 * @returns Promise<null>
 */
export const insertPostFiles = (post_id: string, fileUrls: string[]) => {
    return new Promise<string[]>(async (resolve, reject) => {
        let promises: Promise<string>[] = [];
        fileUrls.forEach(async (fileUrl, index) => {
            promises.push(insertPostFile(post_id, fileUrl, index));
        });

        try {
            let ids = await Promise.all(promises);
            resolve(ids);
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Insert post file in to 'post_file' table
 * @param post_id ID of post
 * @param fileUrl URL of image/ video
 * @returns Promise<string> - ID of post_file
 */
export const insertPostFile = (post_id: string, fileUrl: string, index: number) => {
    return new Promise<string>((resolve, reject) => {
        return query(
            `INSERT INTO post_files (post_id, filename, index) 
            VALUES ($1, $2, $3) RETURNING id`,
            [post_id, fileUrl, index],
        )
            .then((res: QueryResult) => {
                resolve(res.rows[0]['id']);
            })
            .catch((err: Error) => {
                console.error(err.message);
                reject('Failed to add post_files to DB');
            });
    });
};

/**
 * Delete post from 'posts' table
 * @param post_id
 * @param user_id
 * @returns Promise<void>
 */
export const deletePostDB = (post_id: string, user_id: string) => {
    return new Promise<void>((resolve, reject) => {
        query(`DELETE FROM posts WHERE id=$1 AND user_id=$2`, [post_id, user_id])
            .then((res: QueryResult) => {
                if (res.rowCount === 1) return resolve();
                else if (res.rowCount === 0) return reject(new httpError('Post not found', 404));

                console.error('Multiple rows deleted when deleting post!');
                reject('Multiple posts deleted');
            })
            .catch((err) => {
                if (err.code === '22P02') return reject(new httpError('Post not found', 404));
                console.error(err.message);
                reject('Failed to delete post');
            });
    });
};
