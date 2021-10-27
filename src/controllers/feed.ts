import { Request, Response } from 'express';
import { getFollowing } from '../services/followingService';
import { query } from '../db';
import { httpError } from '../helper/error';
import { getFeed as getFeedDB } from '../services/feedService';

export const getFeed = async (req: any, res: Response) => {
    try {
        const user = req.user;
        // Get users following
        // const following = await getFollowing(user.id);

        const feed = await getFeedDB(user.id);
        const formattedFeed = feed.reduce((total, cur, index) => {
            // If first element do nothing
            if (index === 0) {
                total.push(cur);
                return total;
            }

            let prev = total.pop();
            // Check for duplicate ID
            if (prev['id'] ? prev['id'] == cur['id'] : false) {
                console.log('multiple found');
                // If images array not defined then define
                if (!prev['images']) prev['images'] = [];

                // Add both urls to image
                prev['images'].push({ index: prev['index'], url: prev['filename'] });
                prev['images'].push({ index: cur['index'], url: cur['filename'] });
                total.push(prev);
            } else {
                total.push(prev);
                total.push(cur);
            }
            return total;
        }, []);

        return res.status(200).json(formattedFeed);
    } catch (err) {
        if (err instanceof httpError) {
            return res.status(err.httpCode).json(err.message);
        }
        console.error(err);
        res.status(500).json(err);
    }
};
