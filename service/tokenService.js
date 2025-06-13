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

export async function getChainInfoByChainName(chainName) {
    const sql = "SELECT id,chain_name,chain_type FROM chains WHERE chain_name=?";
    try {
        const results = await commonQuery(sql,[chainName]);
        if (results && results[0]){
            return  results[0];
        }
    } catch (e) {
        logger.error("getChainInfoByChainName:",e)
    }
}

async function addTokenInfo(chainId,tokenSymbol,decimals,contractAddress){
    const sql = "INSERT INTO tokens (chain_id, token_symbol, token_precision,contract_address) VALUES(?,?, ?,?)";
    try {
        commonQuery(sql,[chainId,tokenSymbol,decimals,contractAddress]);
    } catch (e) {
        logger.error("addTokenInfo:",e);
    }


}

export async function getTokenInfoAndChainInfoList(){
    const sql = "SELECT t.*,c.chain_Id as chainId,c.chain_name,c.chain_type FROM tokens t,chains c WHERE t.chain_id = c.id";
    const results = await commonQuery(sql,[]);
    return results;
}

export async function chainNameAndIdExist(chainName,chainId) {
    const sql = "SELECT id FROM chains WHERE chain_name=? and chain_Id=?";
    let status = false;
    try {
        const results = await commonQuery(sql,[chainName,chainId]);
        if (results && results[0] && results[0].id){
            status = true;
        }
    } catch (e) {
        logger.error("chainNameExist:",e)
    }

    return status
}

export async function addChainApiInfo(chainId,chainFullName,chainShortName) {
    const sql = "INSERT INTO chains (chain_name, chain_type,chain_Id, chain_full_name) VALUES(?, ?, ?, ?)";
    commonQuery(sql,[chainShortName,chainShortName.toLowerCase(),chainId,chainFullName]);
}

// console.log(await  getTokenIdByChainName('NOT','TON_STAKING'))
// console.log(await getAllTokenSymbol())
// console.log(await chainNameExist("BTC"));
// console.log(await tokenExistByChainIdAndChainName(3,"Not"));
// updateChainAndToken();
// addChainInfo("etc")
// console.log(await getTokenInfoAndChainInfoList());
// console.log(await chainNameAndIdExist("BTC",1));
