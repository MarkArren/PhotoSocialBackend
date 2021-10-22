//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
process.env.PGDATABASE = 'photo_social_test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../index';
import { Client, QueryResult } from 'pg';
import fs from 'fs';

let should = chai.should;

const client = new Client();
chai.use(chaiHttp);

describe('Posts', () => {
    before(() => {
        // Connect to client
        client
            .connect()
            .then(() => console.log('connected'))
            .catch((err) => console.error('connection error', err.stack));
    });
    after(() => {
        client.end();
    });

    // it('Create users table', async (done) => {
    //     console.log('sending query');
    //     const query = await client
    //         .query(
    //             `CREATE TABLE users (
    //                 id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    //                 email character varying UNIQUE NOT NULL,
    //                 password_hash character varying NOT NULL,
    //                 username varchar(30) UNIQUE NOT NULL,
    //                 name varchar(30),
    //                 bio varchar(150),
    //                 likes integer,
    //                 posts integer,
    //                 token character varying,
    //                 created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
    //             );`,
    //         )
    //         .then(() => {
    //             console.log('worked');
    //             done();
    //         })
    //         .catch((err: Error) => {
    //             console.error('error', err.stack);
    //         });
    //     done();
    // });

    // it('Create posts table', async (done) => {
    //     console.log('sending query');
    //     const query = await client
    //         .query(
    //             'CREATE TABLE posts (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, user_id uuid REFERENCES users, caption varchar(150), created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP)',
    //         )
    //         .then(() => console.log('worked'))
    //         .catch((err: Error) => {
    //             console.error('error', err.stack);
    //         });
    //     done();
    // });
});

// describe('Get Post', () => {
//     it('it should GET the post with id', (done) => {
//         chai.request(server)
//             .get('/post')
//             .end((err: Error, res: QueryResult<any>) => {
//                 res.should.have.status(200);
//                 res.body.should.be;
//             });
//     });
// });

describe('Post Post', () => {
    before(() => {
        // Connect to client
        client
            .connect()
            .then(() => console.log('connected'))
            .catch((err) => console.error('connection error', err.stack));
    });
    after(() => {
        client.end();
    });

    it('it should POST a new post w/ single image', async (done) => {
        const res = await chai
            .request(app)
            .post('/post')
            .set('content-type', 'multipart/form-data')
            .field('caption', 'this is a test post')
            .attach('image', fs.readFileSync(`${__dirname}/file.png`), 'tests/file.png');

        res.should.have.status(200);
        console.log(res.body);
    });
});
