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

describe('/{username}/following tests', () => {
    let userAlpha = { email: 'alpha@test.com', password: 'password', username: 'alpha', name: 'alpha test' };
    let userBravo = { email: 'bravo@test.com', password: 'password', username: 'bravo', name: 'bravo test' };
    let userCharlie = { email: 'charlie@test.com', password: 'password', username: 'charlie', name: 'charlie test' };

    let tokenA: string;
    let tokenB: string;
    let tokenC: string;

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
    });

    describe('/POST', () => {
        it('User alpha should follow user bravo', async () => {
            const res = await chai
                .request(app)
                .post(`/${userBravo.username}/following`)
                .set({ Authorization: `Bearer ${tokenA}` });

            res.should.have.status(200);
        });

        it('User alpha should follow user charlie', async () => {
            const res = await chai
                .request(app)
                .post(`/${userCharlie.username}/following`)
                .set({ Authorization: `Bearer ${tokenA}` });

            res.should.have.status(200);
        });
    });

    describe('/GET', () => {
        it('it should get users followers which should be 0', async () => {
            const res = await chai
                .request(app)
                .get(`/${userAlpha.username}/followers`)
                .set({ Authorization: `Bearer ${tokenA}` });

            res.should.have.status(200);
            res.body.should.exist;
            res.body.length.should.be.equal(0);
        });

        it('it should get users following which should be 2', async () => {
            const res = await chai
                .request(app)
                .get(`/${userAlpha.username}/following`)
                .set({ Authorization: `Bearer ${tokenA}` });

            res.should.have.status(200);
            res.body.should.exist;
            res.body.length.should.be.equal(2);
        });

        it('it should get users (bravo) followers which should be 1', async () => {
            const res = await chai
                .request(app)
                .get(`/${userBravo.username}/followers`)
                .set({ Authorization: `Bearer ${tokenA}` });

            res.should.have.status(200);
            res.body.should.exist;
            res.body.length.should.be.equal(1);
        });
    });

    describe('/DELETE', () => {
        it('it should delete following of user', async () => {
            const res = await chai
                .request(app)
                .delete(`/${userBravo.username}/following`)
                .set({ Authorization: `Bearer ${tokenA}` });

            res.should.have.status(200);
        });

        it('it should delete user (bravo)', async () => {
            const res = await chai
                .request(app)
                .delete(`/${userCharlie.username}/following`)
                .set({ Authorization: `Bearer ${tokenA}` });

            res.should.have.status(200);
        });

        it('it should get users followers which should be 0', async () => {
            const res = await chai
                .request(app)
                .get(`/${userAlpha.username}/followers`)
                .set({ Authorization: `Bearer ${tokenA}` });

            res.should.have.status(200);
            res.body.should.exist;
            res.body.length.should.be.equal(0);
        });
    });
});
