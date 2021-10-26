import { Pool, QueryResult } from 'pg';

// Initialises pool
const pool = new Pool();

export const query = (text: string, params: any[]) => pool.query(text, params);
// new Promise<QueryResult<any>>(async (resolve, reject) => {
//     // const start = Date.now();
//     // let q = pool.query(text, params);
//     // q.then((res) => {
//     //     const duration = Date.now() - start;
//     //     console.log('executed query', { text, duration, rows: res.rowCount });
//     //     resolve(res);
//     // }).catch((err) => {
//     //     reject(err);
//     // });
//     return pool.query(text, params);
// });
