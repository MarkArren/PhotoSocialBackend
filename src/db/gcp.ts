import { GetSignedUrlConfig, Storage } from '@google-cloud/storage';
import path from 'path';

// Initialises storage bucket
const storage = new Storage({
    keyFilename: path.join(path.resolve(), 'google-cloud-key.json'),
    projectId: 'photo-social-app',
});
export const postsBucket = storage.bucket('photo-social-posts');

/**
 * Gets signed url of filename
 * @param filename filename to get Url
 * @returns
 */
export const getSignedUrl = (filename: string) => {
    // These options will allow temporary read access to the file
    const options: GetSignedUrlConfig = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 60 minutes
    };

    return storage.bucket('photo-social-posts').file(filename).getSignedUrl(options);
};
