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

// placeholder
export async function updateChainAndToken() {
    const newTokenInfo = await getTokenList();
    if (newTokenInfo){
        for (const tokenInfo of newTokenInfo) {
            if (!tokenInfo.chainName){
                logger.info(tokenInfo,"chainName not exist");
                continue
            }
            const chainName = tokenInfo.chainName;
            let chainId = 0;
            if (!await chainNameExist(chainName)){
                const newChainId = await addChainInfo(chainName);
                if (newChainId > 0){
                    chainId = newChainId;
                }
            } else {
                const localChainInfo = await getChainInfoByChainName(chainName);
                if (localChainInfo){
                    if (Number(localChainInfo.id) > 0){
                        chainId = Number(localChainInfo.id);
                    }
                } else {
                   logger.error("updateChainAndToken getChainInfoByChainName chainInfo not exist:",tokenInfo);
                }
            }


            if (!tokenInfo.tokens || tokenInfo.tokens.length === 0 || chainId === 0){
                continue;
            }
            const tokens = tokenInfo.tokens;
            for (const token of tokens) {
                let contractAddress = token.tokenContractAddress;
                if (!await tokenExistByChainIdAndChainName(chainId,token.tokenName)){
                    if (tokenInfo.chainName.includes("TON") && token.tokenName !== "TON"){
                        const {rawAddress, friendlyAddress, bounceableAddress1,bounceableAddress2} = addressTransfer(contractAddress);
                        contractAddress = bounceableAddress1;
                    }
                    addTokenInfo(chainId,token.tokenName,token.tokenDecimal,contractAddress);
                }

            }

        }
        logger.info("updateChainAndToken successful!!!")
    } else {
        logger.info("updateChainAndToken getTokenList not data");
    }
}

async function addChainInfo(chainName,chainId){
    let id = 0;
    // placeholder
    if (chainName.includes("TON")){
        chainId = 607;
    }
    try {
        const sql = "INSERT INTO chains (chain_name, chain_type,chain_Id) VALUES(?, ?,?)";
        const chainType = chainName.toLowerCase();
        const results = await commonQuery(sql,[chainName,chainType,chainId]);
        if (results && results.insertId){
            id = Number(results.insertId);
        }
    } catch (e) {
        logger.error("addChainInfo:",e)
    }
    return id;
}
