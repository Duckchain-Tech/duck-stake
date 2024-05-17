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

