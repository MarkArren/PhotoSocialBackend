//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
process.env.PGDATABASE = 'photo_social_test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../index';

let should = chai.should();

// const client = new Client();
chai.use(chaiHttp);

describe('POST tests for /login', () => {
    it('it should give error of missing credentials', async () => {
        const res = await chai.request(app).post('/login').send();

        res.should.have.status(400);
    });

    it('it should not login - missing password', async () => {
        const res = await chai.request(app).post('/login').send({ email: 'test@test.com' });

        res.should.have.status(400);
    });

    it('it should not login - missing email', async () => {
        const res = await chai.request(app).post('/login').send({ password: 'password' });

        res.should.have.status(400);
    });

    it('it should not login - incorrect password', async () => {
        const res = await chai.request(app).post('/login').send({ email: 'bob@test.com', password: '123' });

        res.should.have.status(400);
        res.body.should.not.have.property('token');
        res.body.should.not.have.property('refreshToken');
    });

    it('it should log in user bob and return tokens', async () => {
        const res = await chai.request(app).post('/login').send({ email: 'bob@test.com', password: 'password' });

        res.should.have.status(200);
        res.body.should.have.property('token');
        res.body.should.have.property('refreshToken');
    });
});

describe('POST tests for /token', () => {
    it('it should give error - missing token', async () => {
        const res = await chai.request(app).get('/token').send();

        res.should.have.status(400);
        res.body.should.not.have.property('token');
        res.body.should.not.have.property('refreshToken');
    });

    it('it should be an invalid token', async () => {
        const res = await chai.request(app).get('/token').send({ token: 'WN8MFnfb1vPFjRVH' });

        res.should.have.status(400);
        res.body.should.not.have.property('token');
        res.body.should.not.have.property('refreshToken');
    });

    it('it should be an invalid signature', async () => {
        const res = await chai.request(app).get('/token').send({
            refreshToken:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MzUwODIyOTYsImV4cCI6MTczNTY4NzA5Niwic3ViIjoiNWZkNWI2ODEtZGI0OC00YTIwLTk0NmUtOWM4NjYzMjdmYzM1In0.MEu06FvrM6KRvVFIEmqpbZzCG1Tc3Q27HJt8NVpPK_0',
        });

        res.should.have.status(400);
        res.body.should.not.have.property('token');
        res.body.should.not.have.property('refreshToken');
    });

    it('it should be an expired token', async () => {
        const res = await chai.request(app).get('/token').send({
            refreshToken:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MDMzNzQ4OTUsImV4cCI6MTYwMzU0NzY5NSwic3ViIjoiZGJiOTdmZTQtMGQwZi00ODdmLWI1ZGMtZmRjMDg5YmM2Yzg4In0.Q3aO7p1-ChH5b42NtHniuiNJnddb9jr8M8pjWazg-Xo',
        });

        res.should.have.status(400);
        res.body.should.not.have.property('token');
        res.body.should.not.have.property('refreshToken');
    });

    it('it should return a new token and refresh token', async () => {
        const res = await chai.request(app).get('/token').send({
            refreshToken:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MDMzNzQ4OTUsImV4cCI6MTY2NjQ0Njg5NSwic3ViIjoiZGJiOTdmZTQtMGQwZi00ODdmLWI1ZGMtZmRjMDg5YmM2Yzg4In0.A3JDO0bghWypUNUpT5-FSFGjNcp4b4WUQ6JHANu4oUA',
        });

        res.should.have.status(200);
        res.body.should.have.property('token');
        res.body.should.have.property('refreshToken');
    });
});
