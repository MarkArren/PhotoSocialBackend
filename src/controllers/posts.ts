import { Request, Response } from 'express';
import { uploadImages } from '../helpers/helpers';
import { query } from '../db/index';

export const getPost = async (req: Request, res: Response) => {
    const { id: _id } = req.params;
    res.status(200).json('/GET request to post with id');
};

export const uploadPost = async (req: any, res: Response) => {
    let post_id = '-1';

    try {
        // Upload images to cloud bucket
        const files = req.files;
        const caption = req.body.caption;
        console.log('Uploading images to GCP');
        const imageUrls = await uploadImages(files);

        // Check if imageUrls is not null
        if (!imageUrls || imageUrls.length == 0) {
            console.error('Error imageUrls are empty');
            res.status(500).json('Failed to get imageUrls');
            return;
        }

        // Add post to db
        console.log('Adding post to DB');
        await query(
            `INSERT INTO posts (user_id, caption) 
            VALUES ($1, $2) RETURNING id, caption`,
            ['9bc8b526-ba0d-4fdb-96b1-19a7592a7601', caption],
        ).then(
            (res) => {
                post_id = res.rows[0]['id'];
            },
            (err) => {
                console.error(err.message);
                res.status(500).json('Failed to add post to DB');
            },
        );

        // Add post_files to db
        console.log('Adding post_files to DB');
        imageUrls.forEach(async (imageUrl) => {
            await query(
                `INSERT INTO post_files (post_id, image_url) 
                VALUES ($1, $2) RETURNING id`,
                [post_id, imageUrl],
            ).catch((err) => {
                console.error(err.message);
                res.status(500).json('Failed to add post_files to DB');
                return;
            });
        });
    } catch (err: any) {
        console.log(err);
        res.status(500).json('/POST Failed ');
        return;
    }

    res.status(200).json({ message: 'success', post: { post_id } });
    console.log(`Successfully uploaded post with post_id: ${post_id}`);
};

export const updatePost = async (req: Request, res: Response) => {
    const { id: _id } = req.params;
    res.status(200).json('/UPDATE request to post with id');
};

export const likePost = async (req: Request, res: Response) => {
    const { id: _id } = req.params;
    res.status(200).json('/POST request to add or remove like');
};
