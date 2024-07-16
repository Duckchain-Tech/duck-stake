import jwt from 'jsonwebtoken';
import {jwtInfo} from '../config/config.js'
import {expressjwt} from "express-jwt";
import {sendResponse} from "../service/base_app.js";

const secretKey = jwtInfo.jwtSecretKey; // placeholder

// placeholder
export function generateToken(payload) {
    const token = jwt.sign(payload, secretKey, { expiresIn: jwtInfo.expire }); // placeholder
    return token;
}

/* placeholder */




export function jwtMiddleware(unlessPaths = []) {
    return expressjwt({
        secret: secretKey,
        algorithms: ['HS256'],
    }).unless({
        path: unlessPaths,
    });
}

