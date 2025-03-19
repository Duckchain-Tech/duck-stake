import axios from 'axios';
import cryptoJS from 'crypto-js';
import { okxConfig } from "../config/config.js";
import {logger} from "./logUtil.js";

// placeholder
const apiBaseUrl = 'https://www.okx.com';
const apiKey = okxConfig.apiKey;
const secretKey = okxConfig.secretKey;
const passphrase = okxConfig.passphrase;
const projectId = okxConfig.projectId;

// placeholder
const getIsoString = () => new Date().toISOString();  // placeholder

// placeholder
const getSignString = (method, apiEndpoint, isoString, bodyStr = '') => {
    if (method === 'POST') {
        return isoString + method + apiEndpoint + bodyStr;  // placeholder
    }
    return isoString + method + apiEndpoint;  // placeholder
}

// placeholder
const getSign = (signString, secretKey) => {
    return cryptoJS.enc.Base64.stringify(cryptoJS.HmacSHA256(signString, secretKey)); // placeholder
}

// placeholder
const makeRequest = async (method, apiEndpoint, data = null) => {
    const isoString = getIsoString();
    const bodyStr = method === 'POST' ? JSON.stringify(data) : '';  // placeholder
    const signString = getSignString(method, apiEndpoint, isoString, bodyStr);
    const sign = getSign(signString, secretKey);

    // placeholder
    const headers = {
        'Content-Type': 'application/json',
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-SIGN': sign,
        'OK-ACCESS-TIMESTAMP': isoString,
        'OK-ACCESS-PASSPHRASE': passphrase,
        'OK-ACCESS-PROJECT': projectId,  // placeholder
    };

    const url = apiBaseUrl + apiEndpoint;

    try {
        if (method === 'GET') {
            const response = await axios.get(url, { headers });
            return response.data;
        } else if (method === 'POST') {
            const response = await axios.post(url, data, { headers });
            return response.data;
        } else {
            throw new Error('Unsupported HTTP method');
        }
    } catch (error) {
        console.error('API Request Error:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// placeholder
export const getRequest = async (apiEndpoint) => {
    return await makeRequest('GET', apiEndpoint);
};

// placeholder
export const postRequest = async (apiEndpoint, data) => {
    return await makeRequest('POST', apiEndpoint, data);
};


export async function getCurrentPriceByTokens(tokenInfos) {
    const results = await postRequest("/api/v5/wallet/token/current-price",tokenInfos);
    return results;
}


export async function getAllChainList() {
    // placeholder
    try {
        const headers = {
            'Content-Type': 'application/json',
            'OK-ACCESS-KEY': okxConfig.okLinkApiKey
        }
        const results = await axios.get("https://www.oklink.com/api/v5/explorer/tokenprice/chain-list",{headers})
        if (results && results.data && results.data.data){
            return results.data.data;
        }
    } catch (err) {
        logger.error("getAllChainList:",err);
    }
}

// placeholder
//
// getRequest(apiEndpoint)
//     .then(response => {
//         console.log('GET Response:', response);
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });



// placeholder
// const data = [
//     {
//         "chainIndex": "1",
//         "tokenAddress":"0xc18360217d8f7ab5e7c516566761ea12ce7f9d72"
//     },
//     {
//         "chainIndex": "0",
//         "tokenAddress": "btc-brc20-ordi"
//     },
//     {
//         "chainIndex": "0",
//         "tokenAddress": "btc-arc20-00009b954c9f1358de9c089f95ec420132e4106a89c8fbb3cfda198ae1e5f9d5i0"
//     },
//     {
//         "chainIndex": "0",
//         "tokenAddress": "btc-runesMain-840000:2"
//     }
// ]
//
// const results = await postRequest(apiEndpoint, data);
// console.log(results);
// console.log(await getCurrentPriceByTokens([ {
//         "chainIndex": "1",
//         "tokenAddress":"0xc18360217d8f7ab5e7c516566761ea12ce7f9d72"
//     }]));
// console.log(await getAllChainList());
