import {generateInviteCode} from "../util/SecretUtil.js";
import {getStartOfDayTimestamp, gettimestampSeconds} from "../util/DateTimeUtil.js";
import {commonQuery} from "./db.js";
import {compareStringsIgnoreCase} from "../util/ArrayUtil.js";

async function getUser(addr){
    const results=await commonQuery("select * from sys_users where address=?",[addr]);
    if (results.length>0){
        return results[0];
    }
}

async function getUserByInviteCode(inviteCode){
    const results=await commonQuery("select * from sys_users where invite_code=?",[inviteCode]);
    if (results.length>0){
        return results[0];
    }
}
async function registerOrUpdateUser(inviteCode,addr,smartAddress,ip,chainName){
    let user=await getUser(addr);
    if (user){
        return true;
    }else {
        let referWallet="";
        let referUser;
        if (inviteCode){
            referUser=await getUserByInviteCode(inviteCode);
            if (referUser){
                referWallet=referUser.address;
            }
        }
        const sql="insert into sys_users(address,block_chain,smart_address,invite_code,inviter_address,last_login_ip)values(?,?,?,?,?,?)";
        const executeResult=await commonQuery(sql,[addr,chainName,smartAddress,generateInviteCode(6),referWallet,ip]);
        if (executeResult.affectedRows===0){
            console.log("create user error:",addr);
            return false;
        }
        return true;
    }
}

async function checkTodayQuizeFinish(wallet){
    const date=getStartOfDayTimestamp();
    const progress=await commonQuery("select 1 from quiz_progress where address=? and progress=questions and date=?",[wallet,date]);
    return progress.length !== 0;
}

async function checkSocialTaskFinish(wallet){
    const progress=await commonQuery("select 1 from task_progress where address=? and progress='[1,1,1]'",[wallet]);
    return progress.length !== 0;
}

async function bindInviteCode(inviteCode,wallet){
    let user=await getUser(wallet);
    if (user.inviter_address || compareStringsIgnoreCase(user.invite_code,inviteCode)){
        return false;
    }else {
        const referUser=await getUserByInviteCode(inviteCode);
        if (referUser){
            await commonQuery("update sys_users set inviter_address=? where address=? and (inviter_address is null or inviter_address='')",[referUser.address,wallet]);
            return true;
        }
    }
    return false;
}

export {registerOrUpdateUser,getUser,checkTodayQuizeFinish,checkSocialTaskFinish,bindInviteCode}