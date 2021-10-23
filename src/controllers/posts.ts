import { Request, Response } from 'express';
import { uploadImagesToBucket, insertPost, insertPostFiles } from '../services/postService';

export const getPost = async (req: Request, res: Response) => {
    const { id: _id } = req.params;
    res.status(200).json('/GET request to post with id');
};

export const uploadPost = async (req: any, res: Response) => {
    let post_id = '-1';

    try {
        const files = req.files;
        const caption = req.body.caption;

        // Check if files are attached
        if (!files) return res.status(400).json('Please attach files');
        if (files.length == 0) return res.status(400).json('No images/ videos attached');
        if (files.length > 10) return res.status(400).json('Too many pictues/ videos');

        // TODO compress images before uploading
        console.log('Uploading images to GCP');
        const imageUrls = await uploadImagesToBucket(files);

        // Check if imageUrls is not null
        if (!imageUrls || imageUrls.length == 0) {
            console.error('Error imageUrls are empty');
            res.status(500).json('Failed to get imageUrls');
            return;
        }

        // Add post to db
        // TODO add user_id from user auth
        console.log('Adding post to DB');
        post_id = await insertPost('9bc8b526-ba0d-4fdb-96b1-19a7592a7601', caption);

        if (!post_id) return res.status(500).json('Failed to add post to DB');

        // Add post_files to db
        console.log('Adding post_files to DB');
        const postFilesID = insertPostFiles(post_id, imageUrls);
    } catch (err: any) {
        console.log(err);
        res.status(500).json('/POST Failed ');
        return;
    }

    res.status(200).json({ message: 'success', post: { id: post_id } });
    console.log(`Successfully uploaded post with id: ${post_id}`);
};

export const updatePost = async (req: Request, res: Response) => {
    const { id: _id } = req.params;
    res.status(200).json('/UPDATE request to post with id');
};

export const likePost = async (req: Request, res: Response) => {
    const { id: _id } = req.params;
    res.status(200).json('/POST request to add or remove like');
};
