import { Request, Response } from 'express';
import { httpError } from '../helper/error';
import { uploadImageToBucket } from '../services/postsService';
import { deleteUser as deleteUserDB, getUserFromUsername, getUserFromID, updateUser } from '../services/usersService';

export const getUser = async (req: Request, res: Response) => {
    try {
        const { username: username } = req.params;

        const user = await getUserFromUsername(username);

        res.status(200).json(user);
    } catch (err) {
        if (err instanceof httpError) {
            return res.status(err.httpCode).json(err.message);
        }
        console.error(err);
        res.status(500).json(err);
    }
};

export const putUser = async (req: any, res: Response) => {
    try {
        const user = req.user;
        const { username: username } = req.params;

        let usernameNew;
        let name;
        let bio;
        let profilePic;

        // Get specified user from DB
        const userDB = await getUserFromUsername(username);

        // Check if user id matches user from DB
        if (user.id !== userDB.id) throw new httpError("Can't edit another users profile", 403);

        // Check if profile_pic exists
        if (req.file) {
            try {
                profilePic = await uploadImageToBucket(req.file);
            } catch (err) {
                res.status(500).json(err);
            }
        }

        // Set parameters from DB
        usernameNew = req.body.username ? req.body.username : username;
        name = req.body.name ? req.body.name : userDB.name;
        bio = req.body.bio ? req.body.bio : userDB.bio;
        profilePic = profilePic ? profilePic : userDB.profile_pic;

        const updatedUser = await updateUser(usernameNew, name, bio, profilePic, user.id);

        res.status(200).json(updatedUser);
    } catch (err) {
        if (err instanceof httpError) {
            return res.status(err.httpCode).json(err.message);
        }
        console.error(err);
        res.status(500).json(err);
    }
};

export const deleteUser = async (req: any, res: Response) => {
    try {
        const user = req.user;
        const { username: username } = req.params;

        // Get specified user from DB
        const userDB = await getUserFromUsername(username);

        // Check if user id matches user from DB
        if (user.id !== userDB.id) throw new httpError("Can't edit another users profile", 403);

        await deleteUserDB(user.id);

        res.status(200).json('User deleted');
    } catch (err) {
        if (err instanceof httpError) {
            return res.status(err.httpCode).json(err.message);
        }
        console.error(err);
        res.status(500).json(err);
    }
};
