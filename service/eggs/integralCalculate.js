import {commonQuery, getConnection, releaseConnection} from "../db.js";
import {updateChainAndToken} from "../tokenService.js";
import {getTokenPriceByIdUseCache} from "../../util/getTokenPrice.js";
import {logger} from "../../util/logUtil.js";
import {getUser} from "../userService.js";
import {stakeConfig} from "../../config/config.js";
import {scheduleJob} from "node-schedule";
import {singleClient} from "../redisService.js";
import {getCrossChainTotalByPage} from "../stackService.js";
import {getStartOfDayTimestamp, getTodayUnixTimeRange} from "../../util/DateTimeUtil.js";


const duck_stake_in_account_prefix = "duck:stake:in:account:"; // placeholder
let duck_stake_in_account_prefix_expire = 3600;// placeholder

async function getRecods() {
    // placeholder
    const sql = 'SELECT c.*,t.token_symbol FROM cross_chain_records c LEFT JOIN tokens t on c.token_id = t.id WHERE c.credited=0';
    const result = await commonQuery(sql, []);
    return result;
}

async function getRecods1(createAt) {
    // placeholder
    const sql = 'SELECT c.receiver ,c.token_id ,SUM(c.token_amount)as token_amount FROM cross_chain_records c WHERE c.created_at <= ? AND c.credited=0 GROUP BY c.receiver,c.token_id ';
    const result = await commonQuery(sql, [createAt]);
    return result;
}


// placeholder
async function getStakeTotal(address, tokenId) {
    const sql = 'SELECT * from cross_chain_total_assets WHERE address =? and token_id=?';
    const result = await commonQuery(sql, [address, tokenId]);
    return result[0];
}

// placeholder
async function InIntegralRecords() {
    try {
        // placeholder
        await updateChainAndToken();
        // let tokenSybols = await getAllTokenSymbol();
        // let priceMap = await getPriceByName(tokenSybols);
        const {startOfDay,endOfDay} = getTodayUnixTimeRange();
        duck_stake_in_account_prefix_expire = endOfDay - 400;
        const beginTime = new Date();
        let results = await getRecods1(beginTime);
        logger.info("InIntegralRecords getRecods total:",results.length);
        for (const data of results) {
            let connection;
            try {
                connection = await getConnection();
                await connection.beginTransaction();
                const tokenId = data.token_id;
                const token_finished_cache_key = duck_stake_in_account_prefix+tokenId;
                //let tokenPrice = Number(priceMap.get(data.token_symbol));
                // let tokenPrice = await getPriceByCache(data.token_symbol);
                let tokenPrice = await getTokenPriceByIdUseCache(tokenId);
                if (!tokenPrice) {
                    logger.info('token  price not exist',tokenId);
                    tokenPrice = Number(1);
                    continue;
                } else {
                    tokenPrice = Number(tokenPrice);
                }
                // placeholder
                let owner = data.receiver;
                let amount = data.token_amount;
                let user = await getUser(owner);
                // placeholder
                // if (user.smart_address){
                //     owner = user.smart_address;
                //     logger.info("owner smart_address:",owner)
                // }
                // let tokenId = data.token_id;
                // placeholder
                let beforeTotal = await getStakeTotal(owner, tokenId);
                let beforAmount = Number(0);
                if (beforeTotal) {
                    beforAmount = Number(beforeTotal.total_amount);
                }

                // placeholder
                let amounting = beforAmount + Number(data.token_amount);
                let pricesing = amounting * tokenPrice; // placeholder
                let intergal = pricesing * 3;// placeholder
                let insql = 'INSERT INTO integral_records(address,token_id,new_points,daily_token_price,total_staked_amount,total_value) VALUES(?,?,?,?,?,?)';
                // placeholder
                let ursql = `UPDATE cross_chain_records SET credited=1 WHERE credited=0 AND receiver=? AND token_id = ? AND created_at <= ?`;

                // placeholder
                let utsql = 'UPDATE cross_chain_total_assets SET total_amount = total_amount+? WHERE address=? and token_id=?';

                // placeholder
                if (!beforeTotal) {
                    let results = await connection.query('INSERT INTO cross_chain_total_assets(address,total_amount,token_id) VALUES(?,?,?)', [owner, amount, tokenId]);
                    if (results[0].affectedRows > 0) {
                    } else {
                        await connection.rollback();
                    }
                }

                // placeholder
                if (user && user.inviter_address.length > 0) {
                    const inviteInfo = await getUser(user.inviter_address);
                    let inviter_address = user.inviter_address;
                    if (inviteInfo.smart_address){
                        inviter_address = inviteInfo.smart_address;
                        logger.info("deposit  inviteInfo.smart_address",inviter_address);
                    }
                    // placeholder
                    let insql1 = 'INSERT INTO integral_records(address,token_id,to_address,total_to_points,daily_token_price,total_staked_amount,total_value) VALUE(?,?,?,?,?,?,?)';
                    // placeholder
                    let awardIntergal = intergal * Number(stakeConfig.fee);
                    // placeholder
                    let cResult1 = await connection.query(insql1, [inviter_address, tokenId, owner, awardIntergal, tokenPrice, amounting, pricesing]);
                    if (cResult1[0].affectedRows > 0) {
                        // placeholder
                        let cResult2 = await connection.query(insql1, [owner, tokenId, owner, awardIntergal, tokenPrice, amounting, pricesing]);
                        if (cResult2[0].affectedRows > 0) {

                        } else {
                            await connection.rollback();
                        }
                    } else {
                        await connection.rollback();
                    }

                }
                // placeholder
                let inResults = await connection.query(insql, [owner, tokenId, intergal, tokenPrice, amounting, pricesing]);
                if (inResults[0].affectedRows > 0) {
                    let utResults = await connection.query(utsql, [Number(data.token_amount), owner, tokenId]);
                    if (utResults[0].affectedRows > 0) {
                        let urResults = await connection.query(ursql, [owner,tokenId,beginTime]);
                        if (urResults[0].affectedRows > 0) {
                            await connection.commit();
                            const token_finished_exist = await singleClient.exists(token_finished_cache_key);
                            await singleClient.sadd(token_finished_cache_key,owner);
                            if (token_finished_exist === 0){
                                logger.info("set token_finished_exist expire:",token_finished_cache_key);
                                await singleClient.expireat(token_finished_cache_key,duck_stake_in_account_prefix_expire);
                            }
                        } else {
                            await connection.rollback();
                        }
                    } else {
                        await connection.rollback();
                    }
                } else {
                    await connection.rollback();
                }


            } catch (error) {
                await connection.rollback();
                logger.error("InIntegralRecords:",error);
                continue;
            } finally {
                if (connection) {
                    releaseConnection(connection);
                }
            }
        }

    } catch (err) {
        logger.error(err);
    }
}

const pageSize = 100;
const duck_stake_in_account_total_lastId = "duck_stake_in_account_total_lastId";
async function calculateNoAddTotalAmount(){
    logger.info("calculateNoAddTotalAmount begin");
    const {startOfDay,endOfDay} = getTodayUnixTimeRange();
    duck_stake_in_account_prefix_expire = endOfDay - 400;
    let lastId = 0;
    const cacheLastId = await singleClient.get(duck_stake_in_account_total_lastId);
    if (cacheLastId && Number(cacheLastId) > 0) {
        lastId = Number(cacheLastId);
    }

    // placeholder
    let insql = 'INSERT INTO integral_records(address,token_id,cross_chain_id,new_points,daily_token_price,total_staked_amount,total_value) VALUES(?,?,?,?,?,?,?)';


    let status = true;
    while (status){
        let results = await getCrossChainTotalByPage(lastId,pageSize);
        if (results && results.length && results.length > 0){
            for (const result of results) {
                const tokenId = result.token_id;
                const address = result.address;
                const amount = Number(result.total_amount);
                const token_finished_cache_key = duck_stake_in_account_prefix+tokenId;
                if (await singleClient.sismember(token_finished_cache_key,address)){
                    continue;
                }

