const mysql = require('mysql2/promise');
const { checkError, dateFormat } = require('./system');

const option = { 
    host: "localhost", user: "root", port: process.env.MYSQL_PORT, password: process.env.APP_PASS, database: process.env.APP_NAME,
    multipleStatements: true, dateStrings: "date", connectionLimit: 30, maxIdle: 10, idleTimeout: 60000, keepAliveInitialDelay: 10000, enableKeepAlive: true // pool
}
const createPool = mysql.createPool(option);

const pool = async (query, params, url=null)=>{
    const connection = await createPool.getConnection();
    try {
        const [rows] = await connection.execute(query, params)
        return rows;
    } catch (err) {
        const $ERR = `Url: ${url}\nQuery: ${query}\nParams: ${JSON.stringify(params)}\nError: ${err.message}`;
        checkError($ERR, `[MySQL > POOL] config/mysql.js`)
        return { code: 2 };
    } finally {
        if(connection) connection.release();
    }
}
const pooling = async (connection, query, params, url=null)=>{
    try {
        const [rows] = await connection.execute(query, params)
        return rows
    } catch (err) {
        const $ERR = `Url: ${url}\nQuery: ${query}\nParams: ${JSON.stringify(params)}\nError: ${err.message}`;
        checkError($ERR, `[MySQL > POOLING] config/mysql.js`)
        throw new Error($ERR)
    }
}
// used: try{ await transaction(async (conn)=>{ pooling(conn, query, params, url)}) }
const transaction = async (callback) => {
    const connection = await createPool.getConnection();
    await connection.beginTransaction();
    try {
        await callback(connection);
        await connection.commit();
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

module.exports = { pool, pooling, transaction };