import { Request, Response } from 'express';
import { getComments as getCommentsDB, insertComment, deleteComment } from '../services/commentsService';

export const getComments = async (req: any, res: Response) => {
    try {
        const user = req.user;
        const { post_id: post_id } = req.params;

        if (!post_id) throw Error('No post_id');

        const comments = await getCommentsDB(post_id);

        res.status(200).json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

export const addComment = async (req: any, res: Response) => {
    try {
        const user = req.user;
        const { post_id: post_id } = req.params;
        const comment = req.body.comment;
        if (!comment) throw Error('Comment empty');

        const comment_id = await insertComment(post_id, user.id, comment);

        res.status(200).json(comment_id);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

export const removeComment = async (req: any, res: Response) => {
    try {
        const user = req.user;
        const { post_id: post_id, comment_id: comment_id } = req.params;
        if (!comment_id) throw Error('Comment id empty');

        await deleteComment(comment_id, post_id, user.id);

        res.status(200).json('Successfully delete comment');
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};
