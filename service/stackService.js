import {commonQuery} from "./db.js";


// placeholder
export async function getStackRecordsByAddress(address, page, pageSize){
    page = Number(page);
    pageSize = Number(pageSize);
    const sql = "SELECT cr.id,t.chain_id,t.token_symbol,cr.token_id ,cr.tx_hash,cr.receiver,cr.token_amount ,cr.txTime FROM cross_chain_records cr,tokens t WHERE cr.token_id = t.id AND cr.receiver=? LIMIT ?,?";
    if (page < 0){
        page = 0;
    }
    if (page > 0){
        page = page + pageSize;
    }
    const results = await commonQuery(sql,[address,page,pageSize]);
    return results;
}

export async function getCrossChainRecordsBySid(sid) {
    const sql = "select * from cross_chain_records WHERE sid = ?";
    const result = await commonQuery(sql,[sid]);
    if (result && result[0]){
        return result[0];
    }
}


export async function updateCrossChainRecordsStakingSuccessBySid(sid,StakingSuccess) {
    const sql = "UPDATE cross_chain_records SET stakingSuccess = ? WHERE sid = ?";
    commonQuery(sql,[StakingSuccess,sid]);
}

export async function getCrossChainTotalByPage(lastId,pageSize) {
    const sql = "SELECT * FROM cross_chain_total_assets WHERE id>? limit ?";
    const results = await commonQuery(sql,[lastId,pageSize]);
    return results;
}



// console.log(await getStackRecordsByAddress("0x909a7c6527c3e2f3f75ad282da6a1dd67fc50a10",0,10));
// console.log(await getCrossChainRecordsBySid("TON_STAKING-313f05776efc3dcfc51ed3b05ac050dd7c4b0a2e3d8b745e3a38c5e313b51c31"));
// console.log(await getCrossChainTotalByPage(0,10));