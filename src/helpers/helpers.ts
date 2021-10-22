import { postsBucket } from '../db/gcp';
import { v4 as uuidv4 } from 'uuid';

export const uploadImage = async (file: any) =>
    new Promise<string>((resolve, reject) => {
        try {
            // Create file in bucket and write stream
            const filename = uuidv4();
            const blob = postsBucket.file(`${filename}.${file.originalname.split('.').pop()}`);
            const blobStream = blob.createWriteStream({
                resumable: false,
            });

            blobStream.on('error', (err) => {
                console.log('Error uploading image to gcp');
                reject(err.message);
            });

            blobStream.on('finish', async () => {
                // Create URL for directly file access via HTTP.
                const publicUrl = `https://storage.googleapis.com/photo-social-posts/${blob.name}`;
                console.log('Succesfully upload image to gcp');
                // try {
                //     // Make the file public
                //     await postsBucket.file(filename).makePublic();
                // } catch {
                //     return res.status(500).send({
                //     message:
                //         `Uploaded the file successfully: ${filename}, but public access is denied!`,
                //     url: publicUrl,
                //     });
                // }
                resolve(publicUrl);
            });

            blobStream.end(file.buffer);
        } catch (err) {
            reject(`Could not upload the file: ${file.originalname}. ${err}`);
        }
    });

export const uploadImages = async (files: File[]) =>
    new Promise<string[]>(async (resolve, reject) => {
        // let imageUrls: string[] = [];
        // files.map(async (file) => {
        //     imageUrls.push(await uploadImage(file));
        //     console.log(imageUrls);
        // });
        resolve(await Promise.all(files.map(uploadImage)));
    });
