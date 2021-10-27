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

describe('/post tests', () => {
    let userAlpha = { email: 'alpha@test.com', password: 'password', username: 'alpha', name: 'alpha test' };
    let userBravo = { email: 'bravo@test.com', password: 'password', username: 'bravo', name: 'bravo test' };
    let tokenA: string;
    let tokenB: string;
    let postA: any;
    let postB: any;

    before(async () => {
        // Delete test users 'alpla' and 'bravo'
        const qRes = await query('DELETE FROM users CASCADE WHERE username=$1 or username=$2', ['alpha', 'bravo']);

        // Create users alpha & bravo
        const resAlpha = await chai
            .request(app)
            .post('/signup')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send(userAlpha);

        const resBravo = await chai
            .request(app)
            .post('/signup')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send(userBravo);

        // Save access tokens
        tokenA = resAlpha.body.token;
        tokenB = resBravo.body.token;
    });

    describe('/POST', () => {
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
                .auth(tokenA, { type: 'bearer' })
                .field('caption', 'this is a post without an image');
            res.should.have.status(400);
        });

        it('it should POST a new post w/ single image', async () => {
            const res = await chai
                .request(app)
                .post('/post')
                .set('content-type', 'multipart/form-data')
                .auth(tokenA, { type: 'bearer' })
                .field('caption', 'Test post with single image')
                .attach('images', fs.readFileSync(`${__dirname}\\img\\Bandflames2.png`), 'tests\\file.png');

            res.should.have.status(200);
            res.should.exist;
            res.body.post.should.have.property('id');
            res.body.post['id'].should.not.equal('-1');
            postA = res.body.post;
        });

        it('it should POST a new post w/ two images', async () => {
            const res = await chai
                .request(app)
                .post('/post')
                .set('content-type', 'multipart/form-data')
                .auth(tokenB, { type: 'bearer' })
                .field('caption', 'Test post with two images')
                .attach('images', fs.readFileSync(`${__dirname}\\img\\Bandflames2.png`), 'tests/file.png')
                .attach('images', fs.readFileSync(`${__dirname}\\img\\SeanOxoCube.png`), 'tests/file.png');

            res.should.have.status(200);
            res.body.should.exist;
            res.body.post.should.have.property('id');
            res.body.post['id'].should.not.equal('-1');
            postB = res.body.post;
        });

        it('it should POST a new post w/ 1 photo + video', async () => {
            const res = await chai
                .request(app)
                .post('/post')
                .set('content-type', 'multipart/form-data')
                .auth(tokenA, { type: 'bearer' })
                .field('caption', 'Test post with 1 img + 1vid')
                .attach('images', fs.readFileSync(`${__dirname}\\img\\Bandflames2.png`), 'tests/file.png')
                .attach('images', fs.readFileSync(`${__dirname}\\img\\Hellobozo.mp4`), 'tests/file.png');

            res.should.have.status(200);
            res.body.should.exist;
            res.body.post.should.have.property('id');
            res.body.post['id'].should.not.equal('-1');
        });
    });

    describe('/GET', () => {
        it('it should not GET post with random id', async () => {
            const res = await chai.request(app).get(`/post/8a7sdgbj328i7cgb3278e2gbd`);

            res.should.have.status(404);
        });

        it('it should GET post', async () => {
            const res = await chai
                .request(app)
                .get(`/post/${postA.id}`)
                .set({ Authorization: `Bearer ${tokenA}` });

            res.should.have.status(200);
            res.body.should.have.property('id');
            res.body.should.have.property('user_id');
            res.body.should.have.property('caption');
            res.body.should.have.property('created_at');
            res.body.should.have.property('images');
        });
    });

    describe('/PATCH', () => {
        it('it should not PATCH post with random id', async () => {
            const res = await chai
                .request(app)
                .patch(`/post/8a7sdgbj328i7cgb3278e2gbd`)
                .set('content-type', 'application/x-www-form-urlencoded')
                .auth(tokenA, { type: 'bearer' })
                .send({ caption: 'Random post test' });

            res.should.have.status(404);
        });

        it('it should not PATCH another users post', async () => {
            const res = await chai
                .request(app)
                .patch(`/post/${postB.id}`)
                .set('content-type', 'application/x-www-form-urlencoded')
                .auth(tokenA, { type: 'bearer' })
                .send({ caption: 'Changing caption unauthorized' });

            res.should.have.status(403);
        });

        it('it should PATCH post changing caption', async () => {
            let newCaption = 'Changing caption test';
            const res = await chai
                .request(app)
                .patch(`/post/${postA.id}`)
                .set('content-type', 'application/x-www-form-urlencoded')
                .auth(tokenA, { type: 'bearer' })
                .send({ caption: newCaption });

            res.should.have.status(200);
            res.body.should.have.property('id');
            res.body.should.have.property('user_id');
            res.body.should.have.property('caption');
            res.body.should.have.property('created_at');
            res.body['caption'].should.equal(newCaption);
        });

        it('it should not PATCH without caption', async () => {
            const res = await chai.request(app).patch(`/post/${postA.id}`).auth(tokenA, { type: 'bearer' });

            res.should.have.status(400);
        });
    });

    describe('/DELETE', () => {
        it('it should not allow DELETE on another users post', async () => {
            const res = await chai
                .request(app)
                .delete(`/post/${postB.id}`)
                .set({ Authorization: `Bearer ${tokenA}` });

            res.should.have.status(404);
        });

        it('it should DELETE users post', async () => {
            const res = await chai
                .request(app)
                .delete(`/post/${postA.id}`)
                .set({ Authorization: `Bearer ${tokenA}` });

            res.should.have.status(200);
        });
    });
});
