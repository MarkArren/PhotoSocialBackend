import { Request, Response } from 'express';

export const getPost = async (req: Request, res: Response) => {
    const { id: _id } = req.params;
    res.status(200).json('/GET request to post with id');
};

export const uploadPost = async (req: Request, res: Response) => {
    const { id: _id } = req.params;
    res.status(200).json('/POST request to post with id');
};

export const updatePost = async (req: Request, res: Response) => {
    const { id: _id } = req.params;
    res.status(200).json('/UPDATE request to post with id');
};

export const likePost = async (req: Request, res: Response) => {
    const { id: _id } = req.params;
    res.status(200).json('/POST request to add or remove like');
};
