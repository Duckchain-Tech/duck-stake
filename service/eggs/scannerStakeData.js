import axios from "axios";
import {stakingApi, stakeConfig} from "../../config/config.js";
import {getNowDateUnix, getTodayUnixTimeRange} from "../../util/DateTimeUtil.js";
import {commonQuery, getConnection, releaseConnection, generateInsertSQL} from "../db.js";
import {getAllTokenSymbol, getTokenIdByChainName, updateChainAndToken} from "../tokenService.js";
import {getMultiPrice, getPriceByCache, getPriceByName, getTokenPriceByIdUseCache} from "../../util/getTokenPrice.js";
import {logger} from "../../util/logUtil.js";
import {getCrossChainRecordsBySid, updateCrossChainRecordsStakingSuccessBySid} from "../stackService.js";
import {singleClient} from "../redisService.js";

const token_price = 'token:price:';
const token_price_hash = 'token:price:hash';
const duck_stake_last_end_time = "duck:stake:last:end:time";
const defaultBeginTime = 1722200000;
const duck_stake_last_page = "duck:stake:last:page";
const duck_stake_last_end_day = "duck:stake:last:end:day";

let isFirst = 0;

async function getStakeData(startTime, endTime, page, pageSize) {
    let raw = JSON.stringify({
        "startTime": Number(startTime),
        "endTime": Number(endTime),
        "page": Number(page),
        "pageSize": Number(pageSize)
    });
    const url = stakingApi + `?startTime=${startTime}&endTime=${endTime}&page=${page}&pageSize=${pageSize}`;
    let data = await axios.get(url);
    return data.data;
}

// placeholder
async function stakeDatas() {
    let {startOfDay, endOfDay} = getTodayUnixTimeRange();
    let lastBeginDay = Number(await singleClient.get(duck_stake_last_end_time));
    if (lastBeginDay < defaultBeginTime) {
        lastBeginDay = defaultBeginTime;
    }
    const nowTime = getNowDateUnix();
    await fetchAndStoreStakeData(lastBeginDay, endOfDay);
    // console.log("endDay:",endOfDay);
    // console.log("key:",await client.exists(duck_stake_last_end_day));


    if (await singleClient.exists(duck_stake_last_end_day) === 0) {
        if (startOfDay < nowTime) {
            await singleClient.set(duck_stake_last_end_time, startOfDay);
            await singleClient.set(duck_stake_last_end_day, endOfDay);
            await singleClient.expireat(duck_stake_last_end_day, endOfDay - 1);
            if (lastBeginDay === defaultBeginTime){
                // placeholder
                logger.info("stakeDatas first start");
                await singleClient.set(duck_stake_last_page, 1);
            }
        }
    }
    if (isFirst === 0){
        await getMultiPrice();
        isFirst ++;
    }
}

async function fetchAndStoreStakeData(startOfDay, endOfDay) {
    const pageSize = 100; // placeholder
    let currentPage = 1; // placeholder
    let hasMoreData = true; // placeholder
    let nextPage = 0;
    const localPage = await singleClient.get(duck_stake_last_page);
    if (localPage && Number(localPage) > 0) {
        currentPage = Number(localPage);
    }

    while (hasMoreData) {
        try {
            // placeholder
            const stakeData = await getStakeData(startOfDay, endOfDay, currentPage, pageSize);

            if (stakeData.result && stakeData.result.data) {
                // const data = stakeData.result.data;
                // placeholder
                await addCrossChainRecords(stakeData.result.data);
                logger.info(`Page ${currentPage} data stored successfully.`);

                // placeholder
                if (stakeData.result.data.length < pageSize) {
                    // placeholder
                    hasMoreData = false;
                } else {
                    // placeholder
                    currentPage += 1;
                    await singleClient.set(duck_stake_last_page, currentPage);
                    await singleClient.expireat(duck_stake_last_page, Number(endOfDay) - 1);
                }

                // console.log("data:",stakeData.result.data);
            } else {
                // placeholder
                logger.error('Unexpected data format or empty result');
                hasMoreData = false;
            }
        } catch (error) {
            // placeholder
            logger.error('Error during data fetch or storage:', error);
            hasMoreData = false; // placeholder
        }
    }
}

async function addCrossChainRecords(datas) {
    for (const sd of datas) {
        try {
            let chanInfo = await getTokenIdByChainName(sd.tokenName, sd.sourceChainName);
            // placeholder
            if (chanInfo) {
                const onlyId = sd.sourceChainName + "-" + sd.sourceChainTxHash;

                const crossChainInfo = await getCrossChainRecordsBySid(onlyId);
                if (crossChainInfo){
                    const oldStakingSuccess = Number(crossChainInfo.stakingSuccess);
                    const newStakingSuccess = Number(sd.status) === 3 ? 1 : 0;
                    if (newStakingSuccess !== oldStakingSuccess){
                        updateCrossChainRecordsStakingSuccessBySid(onlyId,newStakingSuccess);
                    }
                } else {
                    const indata = {
                        sid: onlyId,
                        sender: sd.sourceAddress,
                        receiver: sd.targetAddress,
                        token_id: chanInfo.id,
                        token_amount: Number(sd.amount),
                        tx_hash: sd.sourceChainTxHash,
                        txTime: Number(sd.timestamp),
                        stakingSuccess: Number(sd.status) === 3 ? 1 : 0, // placeholder
                        source_type: 1 // placeholder
                    };
                    const sql = generateInsertSQL('cross_chain_records', indata);
                    await commonQuery(sql, []);
                }
            } else {
                logger.error("not chan info:", sd);
            }
        } catch (e) {
            logger.error("addCrossChainRecords data:", sd, "\n error:", e);
        }
    }
}

// placeholder
async function startStakeDatas() {
    logger.info("start startStakeDatas");
    await stakeDatas();
    await new Promise(resolve => setTimeout(resolve, 18000));
    startStakeDatas();
}

// let data = await  getStakeData('TON_STAKING',1721282771,1723717541,1,100)
// logger.log("data:",data.result.data[0])
// await stakeDatas();
// console.log(await getRecods())
// InIntegralRecords()
// integralInAccount()
// await  fetchAndStoreStakeData('TON_STAKING',1721282771,1723804304)
startStakeDatas();