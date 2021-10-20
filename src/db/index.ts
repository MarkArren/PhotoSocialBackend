import { Pool } from 'pg';

const pool = new Pool();
module.exports = {
    query: (text: string, params: Array<string>, callback: () => void) => {
        return pool.query(text, params, callback);
    },
};
