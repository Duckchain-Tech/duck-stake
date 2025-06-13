import {database} from '../config/config.js';
import mysql from 'mysql2/promise';
// console.log("use db:",database.database);
const pool = mysql.createPool(database);

async function getConnection() {
    // placeholder
    // placeholder
    const poolConnection = await pool.getConnection();
    // placeholder
    return poolConnection;
}

function releaseConnection(poolConnection) {
    // pool.releaseConnection(poolConnection);
    // placeholder
    poolConnection.release();
    // pool.releaseConnection(poolConnection)
    // placeholder
}

async function commonQuery(sql, params) {
    let connection;
    try{
        connection=await getConnection();
        const [results, ] = await connection.query(sql, params);
        return results;
    }finally {
        if (connection){
            releaseConnection(connection);
        }
    }

}

function generateInsertSQL(tableName, data) {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data).map(value => {
        if (typeof value === 'string') {
            return `'${value}'`;
        }
        return value;
    }).join(', ');
    return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`;
}

export {getConnection,commonQuery,releaseConnection,generateInsertSQL}
