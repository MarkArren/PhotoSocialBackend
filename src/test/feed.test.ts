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

describe('/feed tests', () => {
    let userAlpha = { email: 'alpha@test.com', password: 'password', username: 'alpha', name: 'alpha test' };
    let userBravo = { email: 'bravo@test.com', password: 'password', username: 'bravo', name: 'bravo test' };
    let userCharlie = { email: 'charlie@test.com', password: 'password', username: 'charlie', name: 'charlie test' };

    let tokenA: string;
    let tokenB: string;
    let tokenC: string;

    let postB;
    let postC;

    before(async () => {
        // Delete test users 'alpla' and 'bravo'
        const qRes = await query('DELETE FROM users WHERE username=$1 or username=$2 or username=$3', [
            'alpha',
            'bravo',
            'charlie',
        ]);

        // Create users alpha, bravo & charlie
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

        const resCharlie = await chai
            .request(app)
            .post('/signup')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send(userCharlie);

        tokenA = resAlpha.body.token;
        tokenB = resBravo.body.token;
        tokenC = resCharlie.body.token;

        // Get users bravo and charlie to create posts
        const resPostB = await chai
            .request(app)
            .post('/post')
            .set('content-type', 'multipart/form-data')
            .auth(tokenB, { type: 'bearer' })
            .field('caption', 'Test post from Bravo')
            .attach('images', fs.readFileSync(`${__dirname}\\img\\Bandflames2.png`), 'tests\\file.png');

        const resPostC = await chai
            .request(app)
            .post('/post')
            .set('content-type', 'multipart/form-data')
            .auth(tokenC, { type: 'bearer' })
            .field('caption', 'Test post from Charlie with two images')
            .attach('images', fs.readFileSync(`${__dirname}\\img\\Bandflames2.png`), 'tests/file.png')
            .attach('images', fs.readFileSync(`${__dirname}\\img\\SeanOxoCube.png`), 'tests/file.png');

        // Make user alpha follow bravo and charlie
        const resFollowB = await chai
            .request(app)
            .post(`/${userBravo.username}/following`)
            .set({ Authorization: `Bearer ${tokenA}` });

        const resFollowC = await chai
            .request(app)
            .post(`/${userCharlie.username}/following`)
            .set({ Authorization: `Bearer ${tokenA}` });

        postB = resPostB.body.post.id;
        postC = resPostC.body.post.id;
    });

    describe('/GET', () => {
        it('it should get bravos empty feed', async () => {
            const res = await chai
                .request(app)
                .get(`/feed`)
                .set({ Authorization: `Bearer ${tokenB}` });

            console.log(res.body);
            res.should.have.status(200);
            res.body.should.exist;
            res.body.length.should.be.equal(0);
        });

        it('it should get users feed which should have two posts', async () => {
            const res = await chai
                .request(app)
                .get('/feed')
                .set({ Authorization: `Bearer ${tokenA}` });

            console.log(res.body);
            res.should.have.status(200);
            res.body.should.exist;
            res.body.length.should.be.equal(2);
            console.log(res.body[1]['images']);
        });
    });
});
