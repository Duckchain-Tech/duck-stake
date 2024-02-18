import {commonQuery, getConnection, releaseConnection,generateInsertSQL} from "./db.js";
import {stakingApi} from "../config/config.js";
import {logger} from "../util/logUtil.js";
import {getTokenList} from "../util/getTokenPrice.js";
import {addressTransfer} from "../util/tonUtil.js";





export async function getTokenIdByChainName(tokenName,chainName){
    const  sql = 'SELECT t.* from tokens t JOIN chains c on t.chain_id = c.id WHERE t.token_symbol=? AND c.chain_name= ?'
    let result = await commonQuery(sql,[tokenName,chainName])
    return result[0]
}


export async function getAllTokenSymbol() {
    const sql = 'SELECT token_symbol FROM tokens';
    try {
        const results = await commonQuery(sql); // placeholder

        let tokenNames = results.reduce(function (accumulator, currentRow) {
            accumulator.push(currentRow.token_symbol); // placeholder
            return accumulator; // placeholder
        }, new Set); // placeholder
        tokenNames = Array.from(tokenNames);
        return tokenNames;
    } catch (error) {
        console.error('Error fetching token symbols:', error);
        throw error;
    }
}


export async function chainNameExist(chainName) {
    const sql = "SELECT id FROM chains WHERE chain_name=?";
    let status = false;
    try {
        const results = await commonQuery(sql,[chainName]);
        if (results && results[0] && results[0].id){
            status = true;
        }
    } catch (e) {
        logger.error("chainNameExist:",e)
    }

    return status
}


export async function tokenExistByChainIdAndChainName(chainId,chainName) {
    const sql = "SELECT id FROM tokens WHERE chain_id = ? AND token_symbol = ?";
    let status = false;
    try {
        const results = await commonQuery(sql,[chainId,chainName]);
        if (results && results[0] && results[0].id){
            status = true;
        }
    } catch (e) {
        logger.error("tokenExistByChainIdAndChainName:",e)
    }

    return status
}
