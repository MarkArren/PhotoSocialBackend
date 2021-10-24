// TODO add service logic code
import { QueryResult } from 'pg';
import { query } from '../db/index';
import { postsBucket } from '../db/gcp';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads files (img/vid) to GCP Bucket
 * @param files Files to be uploaded
 * @returns Promise<string[]> - URL of all images
 */
export const uploadImagesToBucket = (files: File[]) => {
    return new Promise<string[]>(async (resolve, reject) => {
        // If testing return skip upload
        if (process.env.NODE_ENV === 'test') resolve(Array.from({ length: files.length }, () => 'testURL.com'));

        resolve(await Promise.all(files.map(uploadImageToBucket)));
    });
};

/**
 * Uploads a file (img/vid) to GCP Bucket
 * @param file File to be uploaded
 * @returns Promise<string> - URL of image
 */
const uploadImageToBucket = async (file: any) =>
    new Promise<string>((resolve, reject) => {
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
                // console.log('Succesfully upload image to gcp');
                // try {
                //     // Make the file public
                //     await postsBucket.file(filename).makePublic();
                // } catch {
                //     return res.status(500).send({
                //     message:
                //         `Uploaded the file successfully: ${filename}, but public access is denied!`,
                //     url: publicUrl,
                //     });
                // }
                resolve(publicUrl);
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
        fileUrls.forEach(async (fileUrl) => {
            promises.push(insertPostFile(post_id, fileUrl));
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
export const insertPostFile = (post_id: string, fileUrl: string) => {
    return new Promise<string>((resolve, reject) => {
        return query(
            `INSERT INTO post_files (post_id, image_url) 
            VALUES ($1, $2) RETURNING id`,
            [post_id, fileUrl],
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

// https://www.smashingmagazine.com/2020/04/express-api-backend-project-postgresql/
// https://www.coreycleary.me/what-is-the-difference-between-controllers-and-services-in-node-rest-apis
// https://geshan.com.np/blog/2021/01/nodejs-postgresql-tutorial/
