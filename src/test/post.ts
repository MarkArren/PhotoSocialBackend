//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
process.env.PGDATABASE = 'photo_social_test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../index';
import fs from 'fs';
import { query } from '../db/index';

let should = chai.should();

// const client = new Client();
chai.use(chaiHttp);

describe('POST tests for posts', () => {
    let token: string;

    before(async () => {
        // Get access token from login
        const res = await chai.request(app).post('/login').send({ email: 'bob@test.com', password: 'password' });
        token = res.body.token;

        // Clear tables 'posts' & 'post_files'
        const qRes = await query('TRUNCATE posts CASCADE', []);
    });

    it('it should not POST not post wo/ token', async () => {
        const res = await chai
            .request(app)
            .post('/post')
            .set('content-type', 'multipart/form-data')
            .field('caption', 'Test post with single image')
            .attach('images', fs.readFileSync(`${__dirname}\\img\\Bandflames2.png`), 'tests\\file.png');

        res.should.have.status(401);
    });

    it('it should not POST a post without an image/ video', async () => {
        const res = await chai
            .request(app)
            .post('/post')
            .set('content-type', 'multipart/form-data')
            .auth(token, { type: 'bearer' })
            .field('caption', 'this is a post without an image');
        res.should.have.status(400);
    });

    it('it should POST a new post w/ single image', async () => {
        const res = await chai
            .request(app)
            .post('/post')
            .set('content-type', 'multipart/form-data')
            .auth(token, { type: 'bearer' })
            .field('token', token)
            .field('caption', 'Test post with single image')
            .attach('images', fs.readFileSync(`${__dirname}\\img\\Bandflames2.png`), 'tests\\file.png');

        res.should.have.status(200);
        res.should.exist;
        res.body.post.should.have.property('id');
        res.body.post['id'].should.not.equal('-1');
    });

    it('it should POST a new post w/ two images', async () => {
        const res = await chai
            .request(app)
            .post('/post')
            .set('content-type', 'multipart/form-data')
            .auth(token, { type: 'bearer' })
            .field('caption', 'Test post with two images')
            .attach('images', fs.readFileSync(`${__dirname}\\img\\Bandflames2.png`), 'tests/file.png')
            .attach('images', fs.readFileSync(`${__dirname}\\img\\SeanOxoCube.png`), 'tests/file.png');

        res.should.have.status(200);
        res.body.should.exist;
        res.body.post.should.have.property('id');
        res.body.post['id'].should.not.equal('-1');
    });

    it('it should POST a new post w/ 1 photo + video', async () => {
        const res = await chai
            .request(app)
            .post('/post')
            .set('content-type', 'multipart/form-data')
            .auth(token, { type: 'bearer' })
            .field('caption', 'Test post with 1 img + 1vid')
            .attach('images', fs.readFileSync(`${__dirname}\\img\\Bandflames2.png`), 'tests/file.png')
            .attach('images', fs.readFileSync(`${__dirname}\\img\\Hellobozo.mp4`), 'tests/file.png');

        res.should.have.status(200);
        res.body.should.exist;
        res.body.post.should.have.property('id');
        res.body.post['id'].should.not.equal('-1');
    });
});
