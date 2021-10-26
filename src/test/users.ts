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

describe('/{username} tests', () => {
    let userAlpha = { email: 'alpha@test.com', password: 'password', username: 'alpha', name: 'alpha test' };
    let userBravo = { email: 'bravo@test.com', password: 'password', username: 'bravo', name: 'bravo test' };

    let tokenA: string;
    let tokenB: string;

    before(async () => {
        // Delete test users 'alpla' and 'bravo'
        const qRes = await query('DELETE FROM users WHERE username=$1 or username=$2', ['alpha', 'bravo']);

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

        tokenA = resAlpha.body.token;
        tokenB = resBravo.body.token;
    });

    describe('/GET', () => {
        it('it should not get user with random username', async () => {
            const res = await chai
                .request(app)
                .get('/3i1278gbsjzcd781ghazsd')
                .set({ Authorization: `Bearer ${tokenA}` });

            res.should.have.status(404);
        });

        it('it should get user alpha', async () => {
            const res = await chai
                .request(app)
                .get(`/${userAlpha.username}`)
                .set({ Authorization: `Bearer ${tokenA}` });

            res.should.have.status(200);
            res.body.should.exist;
            res.body.should.have.property('id');
            res.body['id'].should.not.equal('-1');
            res.body.should.have.property('username');
            res.body.should.have.property('name');
            res.body.should.have.property('bio');
            res.body.should.have.property('profile_pic');
            res.body.should.have.property('likes');
            res.body.should.have.property('posts');
            res.body.should.not.have.property('email');
            res.body.should.not.have.property('password_hash');
            res.body.should.not.have.property('created_at');
        });

        it('it should get user bob', async () => {
            const res = await chai
                .request(app)
                .get(`/${userBravo.username}`)
                .set({ Authorization: `Bearer ${tokenA}` });

            res.should.have.status(200);
            res.body.should.exist;
            res.body.should.have.property('id');
            res.body['id'].should.not.equal('-1');
            res.body.should.have.property('username');
            res.body.should.have.property('name');
            res.body.should.have.property('bio');
            res.body.should.have.property('profile_pic');
            res.body.should.have.property('likes');
            res.body.should.have.property('posts');
            res.body.should.not.have.property('email');
            res.body.should.not.have.property('password_hash');
            res.body.should.not.have.property('created_at');
        });
    });

    describe('/PUT', () => {
        it('it should not allow PUT on another user', async () => {
            const res = await chai
                .request(app)
                .put(`/${userBravo.username}`)
                .set({ Authorization: `Bearer ${tokenA}` });

            res.should.have.status(403);
        });

        it('it should not change username to existing username', async () => {
            const res = await chai
                .request(app)
                .put(`/${userAlpha.username}`)
                .set('content-type', 'multipart/form-data')
                .auth(tokenA, { type: 'bearer' })
                .field('username', userBravo.username);
            res.should.have.status(409);
        });

        it('it should change users (alpha) username', async () => {
            let usernameNew = userAlpha.username + '1';
            const res = await chai
                .request(app)
                .put(`/${userAlpha.username}`)
                .set('content-type', 'multipart/form-data')
                .auth(tokenA, { type: 'bearer' })
                .field('username', usernameNew);

            res.should.have.status(200);
            res.body.should.have.property('username');
            res.body.should.have.property('name');
            res.body.should.have.property('bio');
            res.body.should.have.property('profile_pic');
            res.body.should.have.property('likes');
            res.body.should.have.property('posts');
            res.body.should.not.have.property('email');
            res.body.should.not.have.property('password_hash');
            res.body.should.not.have.property('created_at');

            res.body['username'].should.equal(usernameNew);
            userAlpha.username = usernameNew;
        });

        it('it should change user (alpha) profile_pic', async () => {
            const res = await chai
                .request(app)
                .put(`/${userAlpha.username}`)
                .set('content-type', 'multipart/form-data')
                .auth(tokenA, { type: 'bearer' })
                .field('bio', '')
                .attach('profile_pic', fs.readFileSync(`${__dirname}\\img\\Bandflames2.png`), 'tests\\file.png');

            res.should.have.status(200);
            res.should.have.status(200);
            res.body.should.have.property('username');
            res.body.should.have.property('name');
            res.body.should.have.property('bio');
            res.body.should.have.property('profile_pic');
            res.body.should.have.property('likes');
            res.body.should.have.property('posts');
            res.body.should.not.have.property('email');
            res.body.should.not.have.property('password_hash');
            res.body.should.not.have.property('created_at');
        });
    });

    describe('/DELETE', () => {
        it('it should not allow DELETE on another user', async () => {
            const res = await chai
                .request(app)
                .delete(`/${userBravo.username}`)
                .set({ Authorization: `Bearer ${tokenA}` });

            res.should.have.status(403);
        });

        it('it should delete user (alpha)', async () => {
            const res = await chai
                .request(app)
                .delete(`/${userAlpha.username}`)
                .set({ Authorization: `Bearer ${tokenA}` });

            res.should.have.status(200);
        });

        it('it should delete user (bravo)', async () => {
            const res = await chai
                .request(app)
                .delete(`/${userBravo.username}`)
                .set({ Authorization: `Bearer ${tokenB}` });

            res.should.have.status(200);
        });
    });
});
