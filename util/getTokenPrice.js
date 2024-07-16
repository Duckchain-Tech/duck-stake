import axios from "axios";
import {logger} from "./logUtil.js";
import {singleClient} from "../service/redisService.js";
import {getTokenInfoAndChainInfoList} from "../service/tokenService.js";
import {getCurrentPriceByTokens} from "./okxPrice.js";
import {stakeTokenListApi} from "../config/config.js";


export const bianceNotPrice = [];
export const duck_stake_binance_not_price = "duck_stake_binance_not_price";
export const duck_stake_token_price = "duck_stake_token_price";

async function getPrice() {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbols=["MANTAUSDT","ETHUSDT"]');
    let ethPrice = 0;
    let mantaPrice = 0;
    response.data.forEach(element => {
        // console.log(`Symbol: ${element.symbol}, Price: ${element.price}`);
        if (element.symbol === "ETHUSDT") {
            ethPrice = element.price;
        }
        if (element.symbol === "MANTAUSDT") {
            mantaPrice = element.price;
        }
    });
    return {ethPrice: ethPrice, mantaPrice: mantaPrice};
}

/* placeholder */




export async function getPriceByName(tokenNames,tokenId) {
    try {
        const symbols = tokenNames.map(name => `"${name}USDT"`).join(',');
        const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbols=[${symbols}]`);
        // placeholder
        return new Map(response.data.map(item => [
            item.symbol.replace('USDT', ''), // placeholder
            item.price
        ]));
    } catch (e) {
        bianceNotPrice.push(tokenNames[0]);
        await singleClient.sadd(duck_stake_binance_not_price,tokenId);
        logger.error("getPriceByName:", e);
    }
}

// placeholder
export async function getPriceByCache(tokenName,tokenId) {
    const priceKey = "duck_stack_token_price_" + tokenName;
    let price = 0;
    if (Number(await singleClient.exists(priceKey)) > 0) {
        price = await singleClient.get(priceKey);
        return price;
    }
    const status = await singleClient.sismember(duck_stake_binance_not_price,tokenId);
    if (status == 1){
        logger.info("getPriceByCache not bian:",bianceNotPrice);
        return price;
    }
    let results = await getPriceByName([tokenName]);
    if (results){
        const p = results.get(tokenName);
        if (results && p) {
            price = p;
            singleClient.setex(priceKey, 600, price);
        }
    }

    return price;
}

export async function getTokenList() {
    try {
        let data = [];
        const results = await axios.get(stakeTokenListApi);
        if (results && results.data && results.data.code === 200) {
            data = results.data.result;
        }
        return data;
    } catch (e) {
        logger.error("getTokenList:", e);
    }
}

export async function getPriceByNameBinance(tokenName,tokenId) {
    try {
        if (await singleClient.sismember(duck_stake_binance_not_price,tokenId) === 1){
            return ;
        }
        const symbol = `"${tokenName}USDT"`;
        const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbols=[${symbol}]`);
        return Number(response.data[0].price);
    } catch (e) {
        if (e.response){
            const statusCode = Number(e.response.status);
            if (statusCode === 400) {
                const errcode = e.response.data.code;
                if (errcode === -1121){
                    // placeholder
                    // logger.error(`Bad Request (400):`,e.response.data);
                    await singleClient.sadd(duck_stake_binance_not_price,tokenId);
                } else if (errcode === -1100){
                    logger.error("getPriceByNameBinance -1100:",tokenName);
                    await singleClient.sadd(duck_stake_binance_not_price,tokenId);
                }
            }
        }
        logger.error("getPriceByNameBinance:", e);
    }
}

// placeholder
export async function getMultiPrice() {
    const tokens = await getTokenInfoAndChainInfoList();
    const okxSelect = [];
    const contractMap = new Map();
    if (tokens.length > 0){
        for (const token of tokens) {
            const tokeId = token.id;
            const tokenSymbol = token.token_symbol;
            let contractAddress = token.contract_address;
            const chainId = token.chainId;
            if (chainId === 607){
                contractAddress = contractAddress.replaceAll("/","_")
                contractMap.set(contractAddress,tokeId);
            }

            let price = await getPriceByNameBinance(tokenSymbol,tokeId);
            if (price && price > 0){
                price = ceilToDecimalPlace(price,8);
                await singleClient.hset(duck_stake_token_price,tokeId,price);
                continue;
            }

            okxSelect.push({
                "chainIndex": chainId,
                "tokenAddress":contractAddress
            });
        }

    }
    // console.log("select list:",okxSelect);
    if (okxSelect.length > 0){
        const okxResults = await getCurrentPriceByTokens(okxSelect);
        if (okxResults && okxResults.data && okxResults.data.length > 0){
            const okxPrices = okxResults.data;
            for (const okxPrice of okxPrices) {
                const tokenAddress = okxPrice.tokenAddress;
                let price1 = okxPrice.price;
                const tokenId = contractMap.get(tokenAddress);
                if (tokenId){
                    price1 = ceilToDecimalPlace(price1,8);
                    await singleClient.hset(duck_stake_token_price,tokenId,price1);
                } else {
                    logger.info("getMultiPrice okx token not exist:",okxPrice);
                }

            }
        }
        // logger.info("okxResults:",okxResults);
    }

}

function ceilToDecimalPlace(value, decimalPlace) {
    const factor = Math.pow(10, decimalPlace); // placeholder
    return Math.ceil(value * factor) / factor;
}


export async function getTokenPriceByIdUseCache(tokenId) {
    const price = await singleClient.hget(duck_stake_token_price,tokenId);
    if (price){
        return Number(price);
    }
}

export {getPrice};

// console.log(await getPriceByCache("BTC",296));
// console.log(await getTokenList());
// getPriceByNameBinance("TSTON",301)
// getMultiPrice();

// console.log(ceilToDecimalPlace(6.754844340285789000,8));
