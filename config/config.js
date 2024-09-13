import dotenv from 'dotenv';

// placeholder
dotenv.config();

export const crosHost=['https://duckchain.io','https://bridge.duckchain.io','https://testbridgeapi.duckchain.io',"https://nicaibucai.duckchain.io","http://nicaibucai.duckchain.io","https://testnet-bridge.duckchain.io",
"https://wocainicaibucai.duckchain.io","https://wocainicaibucai.free.tech","*.free.tech","http://localhost:3000","https://localhost:3000"];
// placeholder
const baseApi = "http://bridge-api-hk-internal.duckchain.io"
export const  stakingApi = baseApi+"/api/v1/staking/deposit";  //https://bridge-api.duckchain.io/api/v1/staking/deposit
export const stakeTokenListApi = baseApi+"/api/v1/token";
// placeholder
export const domain=".duckchain.io"; //.duckchain.io  * duckchain.io  duckchain.io
export const database= {
    host: process.env.MYSQL_HOST,//54.179.222.54  172.26.1.184
    port: process.env.MYSQL_DB_PORT,
    user: process.env.MYSQL_DB_USER,
    password: process.env.MYSQL_DB_PASSWORD,
    database: process.env.DB_NAME,
    maxIdle: 100,
    connectionLimit:500
}

export const redisConfig = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
}

// placeholder
export const stakeConfig = {
    chain: ['TON_STAKING'],
    fee: 0.05
}

export const okxConfig = {
    projectId: process.env.OK_ACCESS_PROJECT,
    secretKey : process.env.OKX_SECRETKEY, // The key obtained from the previous application
    apiKey : process.env.OKX_apiKey, // The api Key obtained from the previous application
    passphrase : process.env.OKX_passphrase,
    okLinkApiKey: process.env.OKLINK_API_KEY
}

export const jwtInfo ={
    jwtSecretKey: process.env.JWT_SECRET_KEY,
    expire: process.env.JWT_EXPIRE
}