import {commonQuery, getConnection, releaseConnection} from "../db.js";
import {getIntegralByAddress} from "../integralService.js";
import {logger} from "../../util/logUtil.js";

// placeholder

async function integralInAccount() {
    try {
        let sql = 'SELECT * FROM integral_records WHERE credited = 0 limit 1000';
        let results = await commonQuery(sql, []);
        let connection;
        const usql = 'INSERT INTO integral(address ,integral) VALUES (?, ?)'; // placeholder
        const upsql = 'UPDATE integral SET integral=integral+? WHERE address = ?'; // placeholder
        const ursql = `UPDATE integral_records SET credited = 1 WHERE credited=0 and id=?`;

        try {
            connection = await getConnection();
            await connection.beginTransaction();
            for (const result of results) {
                let userIntegral = await getIntegralByAddress(result.address);
                let amouting = Number(0); // placeholder

                // placeholder
                if (result.new_points) {
                    amouting += Number(result.new_points);
                } else {
                    // placeholder
                    amouting += Number(result.total_to_points);
                }

                if (userIntegral) {
                    // placeholder
                    let uresult = await connection.query(upsql, [amouting, result.address]);
                    if (uresult[0].affectedRows === 0) {
                        await connection.rollback();
                    }
                } else {
                    // placeholder
                    let uresult = await connection.query(usql, [result.address, amouting]);
                    if (uresult[0].affectedRows === 0) {
                        await connection.rollback();
                    }
                }

                let uresults = await connection.query(ursql, [result.id]);
                if (uresults[0].affectedRows > 0)
                    await connection.commit();
                await connection.rollback();
            }
        } catch (error) {
            await connection.rollback();
            logger.error("integralInAccount:",error);
        } finally {
            if (connection) {
                releaseConnection(connection);
            }
        }
    } catch (err) {
        logger.error(err);
    }
}



// placeholder
async function startIntegralInAccount() {
    logger.info(" start startIntegralInAccount");
    await integralInAccount();
    logger.info("startIntegralInAccount end");
    await new Promise(resolve => setTimeout(resolve, 18000));
    startIntegralInAccount();
}

startIntegralInAccount()