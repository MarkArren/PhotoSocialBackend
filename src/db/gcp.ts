import { Storage } from '@google-cloud/storage';
import path from 'path';

// Initialises storage bucket
const storage = new Storage({
    keyFilename: path.join(path.resolve(), 'google-cloud-key.json'),
    projectId: 'photo-social-app',
});
export const postsBucket = storage.bucket('photo-social-posts');
