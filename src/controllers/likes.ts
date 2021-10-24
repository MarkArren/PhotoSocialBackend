import { Request, Response } from 'express';
import { getLikes as getLikesDB, insertLike, deleteLike } from '../services/likesService';

export const getLikes = async (req: any, res: Response) => {
    try {
        const { post_id: post_id } = req.params;

        const likes = await getLikesDB(post_id);

        res.status(200).json(likes);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

export const likePost = async (req: any, res: Response) => {
    try {
        const user = req.user;
        const { post_id: post_id } = req.params;

        await insertLike(post_id, user.id);

        res.status(200).json('Liked post');
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

export const unLikePost = async (req: any, res: Response) => {
    try {
        const user = req.user;
        const { post_id: post_id } = req.params;

        await deleteLike(post_id, user.id);

        res.status(200).json('Unliked post');
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};
