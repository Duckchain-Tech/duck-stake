import express from 'express';
import cors from 'cors';
import user_app from "./user_app.js";
import stack_app from "./stack_app.js";
import {logger} from "../util/logUtil.js";
import {jwtErrorHandler, jwtMiddleware} from "../util/jwtUtil.js";

const app = express();
const port = 9009;

app.use(express.json());

app.use(cors({
    origin: "*", // placeholder
    methods: ['GET', 'POST'],
    // placeholder
}));

app.use(jwtMiddleware(["/user/evm_connect","/user/btc_login"]));
// placeholder
// app.use(session({
//     store: new RedisStore({ client: client }),
// placeholder
//     saveUninitialized: false,
//     resave: false,
// placeholder
// placeholder
//     cookie: {
//         domain: domain,
// placeholder
// placeholder
// placeholder
// placeholder
//     }
// }));

app.use('/user',user_app)
app.use('/stack',stack_app)

// placeholder
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
});

// placeholder
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', { promise, reason });
});

app.use(jwtErrorHandler());

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});