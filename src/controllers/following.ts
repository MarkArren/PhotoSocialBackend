import { Request, Response } from 'express';
import { getUserFromUsername } from '../services/usersService';
import { query } from '../db';
import { httpError } from '../helper/error';
import {
    deleteFollowing as deleteFollowingDB,
    insertFollowing,
    getFollowing as getFollowingDB,
    getFollowers as getFollowersDB,
} from '../services/followingService';

export const getFollowing = async (req: Request, res: Response) => {
    try {
        const { username: username } = req.params;

        // Get target user and add following to db
        const user = await getUserFromUsername(username);
        // Get target user and add following to db
        const following = await getFollowingDB(user.id);

        res.status(200).json(following);
    } catch (err) {
        if (err instanceof httpError) {
            return res.status(err.httpCode).json(err.message);
        }
        console.error(err);
        res.status(500).json(err);
    }
};

export const getFollowers = async (req: Request, res: Response) => {
    try {
        const { username: username } = req.params;

        // Get target user and add following to db
        const user = await getUserFromUsername(username);
        // Get target user and add following to db
        const userFollowing = await getFollowersDB(user.id);

        res.status(200).json(userFollowing);
    } catch (err) {
        if (err instanceof httpError) {
            return res.status(err.httpCode).json(err.message);
        }
        console.error(err);
        res.status(500).json(err);
    }
};

export const postFollowing = async (req: any, res: Response) => {
    try {
        const user = req.user;
        const { username: username } = req.params;

        // Get target user and add following to db
        const userFollowing = await getUserFromUsername(username);
        const message = await insertFollowing(user.id, userFollowing.id);

        res.status(200).json(message);
    } catch (err) {
        if (err instanceof httpError) {
            return res.status(err.httpCode).json(err.message);
        }
        console.error(err);
        res.status(500).json(err);
    }
};

export const deleteFollowing = async (req: any, res: Response) => {
    try {
        const user = req.user;
        const { username: username } = req.params;

        // Get target user and delete following from db
        const userFollowing = await getUserFromUsername(username);
        const message = await deleteFollowingDB(user.id, userFollowing.id);

        res.status(200).json(message);
    } catch (err) {
        if (err instanceof httpError) {
            return res.status(err.httpCode).json(err.message);
        }
        console.error(err);
        res.status(500).json(err);
    }
};
