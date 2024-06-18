import express from "express";
import {isAuthenticated, sendError, sendSuccessData} from "./base_app.js";
import {getStackRecordsByAddress} from "./stackService.js";
import {getPriceByCache, getPriceByName, getTokenPriceByIdUseCache} from "../util/getTokenPrice.js";
import {logger} from "../util/logUtil.js";


const stack_app = express();

//isAuthenticated
stack_app.get("/records", async (req, res) => {
    try {
        const page = req.query.page;
        const pageSize = req.query.pageSize;
        const address = req.query.address;
        const data = await getStackRecordsByAddress(address,page - 1,pageSize);
        const toData = [];
        for (const datum of data) {
            let tokenPrice = await getTokenPriceByIdUseCache(datum.token_id);
            if (tokenPrice){
                // console.log("token price:",tokenPrice);
                tokenPrice = Number(tokenPrice);
            } else {
                tokenPrice = 1;
            }
            const amount = Number(datum.token_amount) * tokenPrice;
            toData.push({
                id:datum.id,
                chanId: datum.chain_id,
                tokenSymbol: datum.token_symbol,
                txHash: datum.tx_hash,
                recipient: datum.receiver,
                amount: amount,
                txTime: datum.txTime
            })
        }
        return sendSuccessData(res,toData);
    } catch (err) {
        logger.error("records:", err);
        return sendError(res);
    }

});

// stack_app.get("/records", isAuthenticated, async (req, res) => {
//     try {
//
//
//     } catch (err) {
//         logger.error("records:", err);
//         return sendError(res);
//     }
//
// });

export default stack_app;