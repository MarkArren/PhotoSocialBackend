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

describe('POST test for comments', () => {
    let token: string;
    let post_id: string;
    let comment_id: string;

    before(async () => {
        // Get access token from login
        const resUser = await chai.request(app).post('/login').send({ email: 'bob@test.com', password: 'password' });
        token = resUser.body.token;

        // Create new post
        const resPost = await chai
            .request(app)
            .post('/post')
            .set('content-type', 'multipart/form-data')
            .auth(token, { type: 'bearer' })
            .field('token', token)
            .field('caption', 'Test post for testing likes')
            .attach('images', fs.readFileSync(`${__dirname}\\img\\Bandflames2.png`), 'tests\\file.png');
        post_id = resPost.body.post['id'];

        // Clear tables 'comments'
        const qRes = await query('TRUNCATE comments', []);
    });

    it('it should return an empty array of comments', async () => {
        const res = await chai.request(app).get(`/post/${post_id}/comments`).auth(token, { type: 'bearer' });

        res.should.have.status(200);
        res.body.should.have.lengthOf(0);
    });

    it('it should post a comment', async () => {
        const res = await chai.request(app).post(`/post/${post_id}/comment`).auth(token, { type: 'bearer' }).send({
            comment: 'This is a test comment',
        });
        comment_id = res.body;
        res.should.have.status(200);
    });

    it('it should return now one comment from current user', async () => {
        const res = await chai.request(app).get(`/post/${post_id}/comments`).auth(token, { type: 'bearer' });

        res.should.have.status(200);
        res.body.should.have.lengthOf(1);
        res.body[0]['comment_text'].should.exist;
    });

    it('it should delete the comment from current user', async () => {
        const resDel = await chai
            .request(app)
            .del(`/post/${post_id}/comment/${comment_id}`)
            .auth(token, { type: 'bearer' });
        resDel.should.have.status(200);

        const resGet = await chai.request(app).get(`/post/${post_id}/comments`).auth(token, { type: 'bearer' });

        resGet.should.have.status(200);
        resGet.body.should.have.lengthOf(0);
    });
});
