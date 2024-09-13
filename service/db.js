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

