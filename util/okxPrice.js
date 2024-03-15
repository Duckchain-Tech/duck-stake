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

