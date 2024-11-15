import {commonQuery, getConnection, releaseConnection, generateInsertSQL} from "./db.js";


/* placeholder */




export async function getIntegralByAddress(address) {
    const  sql = 'SELECT * FROM integral WHERE address = ?'
    const resules = await  commonQuery(sql,[address])
    return resules[0]
}


// console.log(await getIntegralByAddress("0x32af04ae2eb318321b78729af6a2cbc20ce60466"));
