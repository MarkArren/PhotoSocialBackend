import { Request, Response } from 'express';
import { httpError } from '../helper/error';
import {
    uploadImagesToBucket,
    insertPost,
    insertPostFiles,
    deletePostDB,
    getPostFiles,
    getPost as getPostDB,
    updatePost,
} from '../services/postsService';

export const getPost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { post_id: post_id } = req.params;

        const post = await getPostDB(post_id);

        const postFiles = await getPostFiles(post_id);

        let result = { ...post, images: postFiles };

        res.status(200).json(result);
    } catch (err) {
        if (err instanceof httpError) {
            return res.status(err.httpCode).json(err.message);
        }
        console.error(err);
        res.status(500).json(err);
    }
};

export const uploadPost = async (req: any, res: Response) => {
    let post_id = '-1';

    try {
        const files = req.files;
        const caption = req.body.caption;
        const user = req.user;

        // Check if files are attached
        if (!files) return res.status(400).json('Please attach files');
        if (files.length == 0) return res.status(400).json('No images/ videos attached');
        if (files.length > 10) return res.status(400).json('Too many pictues/ videos');

        // TODO compress images before uploading
        const imageUrls = await uploadImagesToBucket(files);

        // Check if imageUrls is not null
        if (!imageUrls || imageUrls.length == 0) {
            console.error('Error imageUrls are empty');
            res.status(500).json('Failed to get imageUrls');
            return;
        }

        // Add post to db
        post_id = await insertPost(user.id, caption);

        if (!post_id) return res.status(500).json('Failed to add post to DB');

        // Add post_files to db
        const postFilesIDs = await insertPostFiles(post_id, imageUrls);
    } catch (err: any) {
        console.error(err);
        res.status(500).json('/POST Failed ');
        return;
    }

    res.status(200).json({ message: 'success', post: { id: post_id } });
    // console.log(`Successfully uploaded post with id: ${post_id}`);
};

export const patchPost = async (req: any, res: Response) => {
    try {
        const user = req.user;
        const { post_id: post_id } = req.params;

        // Check if caption is specified
        if (!req.body.caption) throw new httpError('Caption not included', 400);

        // Get post from DB and check if user is author of post
        const post = await getPostDB(post_id);
        if (post.user_id !== user.id) throw new httpError('Unable to edit post', 403);

        // Check if caption hasnt changed
        if (req.body.caption === post.caption) return res.status(200).json(post);
        const postUpdated = await updatePost(post_id, req.body.caption, user.id);

        res.status(200).json(postUpdated);
    } catch (err) {
        if (err instanceof httpError) {
            return res.status(err.httpCode).json(err.message);
        }
        console.error(err);
        res.status(500).json(err);
    }
};

export const deletePost = async (req: any, res: Response) => {
    try {
        const user = req.user;
        const { post_id: post_id } = req.params;

        await deletePostDB(post_id, user.id);

        res.status(200).json('Post deleted');
    } catch (err) {
        if (err instanceof httpError) {
            return res.status(err.httpCode).json(err.message);
        }
        console.error(err);
        res.status(500).json(err);
    }
};
