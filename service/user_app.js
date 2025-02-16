import express from 'express';

import {
    getClientIp,
    isAuthenticated,
    sendError,
    sendResponse,
    sendSuccessData,
    sendSuccessResponse
} from "./base_app.js";

import {
    bindInviteCode,
    checkSocialTaskFinish,
    checkTodayQuizeFinish,
    getUser,
    registerOrUpdateUser
} from "./userService.js";

import {commonQuery, getConnection, releaseConnection} from "./db.js";
import {verifyEvmConnectSignature} from "../util/evmUtil.js";
import bitcore from 'bitcore-lib'
import {getIntegralByAddress} from "./integralService.js";
import {generateToken} from "../util/jwtUtil.js";
import {logger} from "../util/logUtil.js";

const user_app = express();


user_app.get('/evm_connect', async (req, res) => {
    try {
        const addr = req.query.address;
        const sign = req.query.sign;
        const inviteCode = req.query.inviteCode;
        const smartAddress = req.query.smartAddress;
        const chainName = 'evm';

        // placeholder
        const verifyResult = verifyEvmConnectSignature(addr, sign);
        if (!verifyResult) {
            logger.error("verify evm signature fail:", addr, " sign:", sign);
            return sendError(res);
        }
        const addResult = await registerOrUpdateUser(inviteCode, addr,smartAddress, getClientIp(req), chainName);
        if (!addResult) {
            return sendError(res);
        }
        const token  = generateToken({address:addr});
        // req.session.wallet = addr;
        return sendSuccessData(res, {token: token});
    } catch (err) {
        logger.error("login error", err);
        return sendResponse(res, 500, 500, err);
    }
});

// placeholder
// app.post('/login', (req, res) => {
//     const { username, password } = req.body;
//
// placeholder
//     if (username === 'admin' && password === '123456') {
//         const token = generateToken({ username });
//         res.json({ token });
//     } else {
//         res.status(401).json({ error: 'Invalid credentials' });
//     }
// });

user_app.get('/btc_login', async (req, res) => {
    const publicKey = req.publicKey
    const address = req.address
    // const text = req.query.text
    const sig = req.query.sig
    const inviteCode = req.query.inviteCode
    const chainName = 'btc';
    const originalMessage="Welcome to DuckChain";
    try {
        const message = new bitcore.Message(originalMessage);

        var signature = bitcore.crypto.Signature.fromCompact(Buffer.from(sig, 'base64'));
        var hash = message.magicHash();

        var ecdsa = new bitcore.crypto.ECDSA();
        ecdsa.hashbuf = hash;
        ecdsa.sig = signature;

        const pubkeyInSig = ecdsa.toPublicKey();

        const pubkeyInSigString = new bitcore.PublicKey(
            Object.assign({}, pubkeyInSig.toObject(), {compressed: true})
        ).toString();

        if (pubkeyInSigString !== publicKey) {
            console.log('/btc_login:', 'invaild_sign', pubkeyInSigString, publicKey);
            return sendResponse(res, 401, 401, 'Invalid signature.');
        }

        const valid = bitcore.crypto.ECDSA.verify(hash, signature, pubkeyInSig);
        if (valid) {
            const addResult = await registerOrUpdateUser(inviteCode, address, getClientIp(req), chainName);
            if (!addResult) {
                return sendError(res);
            }
            const token  = generateToken({address:address});
            // req.session.wallet = addr;
            return sendSuccessData(res, {token: token});
        }
        return sendError(res)
    } catch (error) {
        logger.error('/btc_login:', error);
        return sendResponse(res, 500, 500, 'Error verifying signature.');
    }
});

// user_app.get('/logout', (req, res) => {
//     try {
//         if (req.session) {
// placeholder
//             req.session.destroy((err) => {
//                 if (err) {
//                     return sendResponse(res, 500, 500, 'err0r');
//                 } else {
//                     return sendSuccessResponse(res);
//                 }
//             });
//         } else {
//             return sendSuccessResponse(res);
//         }
//     } catch (error) {
//         logger.error(("logout", error);
//         return sendResponse(res, 500, 500, 'err0r');
//     }
// });

user_app.get('/check_login', isAuthenticated, async (req, res) => {
    const addr = req.user.address;
    return sendSuccessData(res, {walletAddress: addr});
});

user_app.get('/bind_invite', isAuthenticated, async (req, res) => {
    try {
        const wallet = req.user.address;
        const inviteCode = req.query.inviteCode;
        const bindResult = await bindInviteCode(inviteCode, wallet);
        if (bindResult) {
            return sendSuccessResponse(res);
        }
        return sendError(res);
    } catch (error) {
        logger.error("bind_invite", error);
        return sendError(res);
    }
});

user_app.get('/check_invite', isAuthenticated, async (req, res) => {
    try {
        const wallet = req.user.address;
        let results = await commonQuery("select * from sys_users where address=?", [wallet]);
        let hasInviter = false;
        if (results[0].inviter_address) {
            hasInviter = true;
        }
        return sendSuccessData(res, {hasInviter});
    } catch (error) {
        logger.error("check_invite", error);
        return sendError(res);
    }
});


user_app.get('/info', isAuthenticated, async (req, res) => {
    try {
        const wallet = req.user.address
        logger.info("info wallet:",wallet);
        let results = await commonQuery("select * from sys_users where address=?", [wallet]);
        let integralTotal = 0;
        const iResults = await getIntegralByAddress(wallet);
        if (iResults && iResults.integral && !results[0].smart_address){
            integralTotal = Number(iResults.integral);
        }
        if (results && results[0] && results[0].smart_address && integralTotal === 0){
            const iResults1 = await getIntegralByAddress(results[0].smart_address);
            if (iResults1 && iResults1.integral){
                integralTotal = Number(iResults1.integral);
            }
        }

        let info = {
            address: results[0].address,
            inviterAddress: results[0].inviter_address,
            inviteCode: results[0].invite_code,
            eggTotal: integralTotal
        }

        return sendSuccessData(res, info)
    } catch (error) {
        logger.error("info:", error);
        return sendError(res);
    }
});

export default user_app