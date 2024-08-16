import Redis from "ioredis";
import { createPool } from 'generic-pool';
import {redisConfig} from "../config/config.js";

// placeholder
const factory = {
    create: () => {
        return new Redis({
            host: redisConfig.host,
            port: redisConfig.port,
            // password:process.env.REDIS_PASSWORD
            // placeholder
        });
    },
    destroy: (client) => {
        return client.quit();
    }
};

// placeholder
const opts = {
    max: 30, // placeholder
    min: 2   // placeholder
};

export const redisPool = createPool(factory, opts);
export const singleClient=new Redis({
    host: redisConfig.host,
    port: redisConfig.port,
    // password:process.env.REDIS_PASSWORD
    // placeholder
});
// placeholder
async function run() {
    let client;
    try {
        client = await redisPool.acquire();
        const pipeline = client.pipeline();
        const quackibels=-10;

        pipeline.rpush("user_quack_records",quackibels);
        pipeline.incrby("user_quackibels",quackibels);
        await pipeline.exec(function (err, results) {
            // `err` is always null, and `results` is an array of responses
            // corresponding the sequence the commands where queued.
            // Each response follows the format `[err, result]`.
            console.log("err:",err);
            console.log("results:",results);
        });
        const updateQuackiels=await client.get("user_quackibels");
        console.log("updateQuackiels:",updateQuackiels);
        const quackRecords=await client.lrange("user_quack_records",-2,-1);
        console.log("quackRecords:",quackRecords);
    } catch (err) {
        console.error('Redis operation error', err);
    } finally {
        if (client) {
            redisPool.release(client);
        }
    }
}

export async function sAdd(key,...values) {
    let client;
    try {
        client = await redisPool.acquire();
        client.sadd(key,values)
    } catch (err) {
        console.error('Redis operation error', err);
    } finally {
        if (client) {
            redisPool.release(client);
        }
    }
}

export async function sExist(key,value) {
    let client;
    try {
        client = await redisPool.acquire();
        return await client.sismember(key,value)
    } catch (err) {
        console.error('Redis operation error', err);
    } finally {
        if (client) {
            redisPool.release(client);
        }
    }
}

export async function hSet(key,itemkey,value) {
    let client;
    try {
        client = await redisPool.acquire();
        client.hset(key,itemkey,value);
    } catch (err) {
        console.error('Redis operation error', err);
    } finally {
        if (client) {
            redisPool.release(client);
        }
    }
}

export async function hGet(key,itemkey) {
    let client;
    try {
        client = await redisPool.acquire();
        return await client.hget(key,itemkey);
    } catch (err) {
        console.error('Redis operation error', err);
    } finally {
        if (client) {
            redisPool.release(client);
        }
    }
}

export async function Set(key,value) {
    let client;
    try {
        client = await redisPool.acquire();
        client.set(key,value)
    } catch (err) {
        console.error('Redis operation error', err);
    } finally {
        if (client) {
            redisPool.release(client);
        }
    }
}

export async function Get(key) {
    let client;
    try {
        client = await redisPool.acquire();
        let val = await client.get(key)
        return val
    } catch (err) {
        console.error('Redis operation error', err);
    } finally {
        if (client) {
            redisPool.release(client);
        }
    }
}


export async function Incr(key) {
    let client;
    let num = 0;
    try {
        client = await redisPool.acquire();
        num = await client.incr(key)
    } catch (err) {
        console.error('Redis operation error', err);
    } finally {
        if (client) {
            redisPool.release(client);
        }
    }
    return num
}

export async function expireAtUnixTime(key,expireat1) {
    let client;
    let num = 0;
    try {
        client = await redisPool.acquire();
        await  client.expireat(key, expireat1)
    } catch (err) {
        console.error('Redis operation error', err);
    } finally {
        if (client) {
            redisPool.release(client);
        }
    }
    return num
}

export async function sLength(key) {
    let client;
    try {
        client = await redisPool.acquire();
        return await client.scard(key)
    } catch (err) {
        console.error('Redis operation error', err);
    } finally {
        if (client) {
            redisPool.release(client);
        }
    }
}

export async function sGet(key) {
    let client;
    try {
        client = await redisPool.acquire();
        return  await client.smembers(key)
    } catch (err) {
        console.error('Redis operation error', err);
    } finally {
        if (client) {
            redisPool.release(client);
        }
    }
}

export async function exist(key) {
    let client;
    try {
        client = await redisPool.acquire();
        return  await client.exists(key)
    } catch (err) {
        console.error('Redis operation error', err);
    } finally {
        if (client) {
            redisPool.release(client);
        }
    }
}

export async function hGetAll(key) {
    let client;
    try {
        client = await redisPool.acquire();
        return await client.hgetall(key);
    } catch (err) {
        console.error('Redis operation error', err);
    } finally {
        if (client) {
            redisPool.release(client);
        }
    }
}
