import {verifyToken} from "../util/jwtUtil.js";

const sendResponse = (res, httpcode, code, message, data = null) => {
    try {
        res.status(httpcode).json({ code, message, data });
    } catch (error) {
        console.error("sendResponse Error", error);
    }
};

const sendSuccessResponse = (res) => {
    try {
        sendResponse(res,200,200,"SUCCESS",true);
    } catch (error) {
        console.error("sendResponse Error", error);
    }
};

const sendSuccessData = (res,data) => {
    try {
        sendResponse(res,200,200,"SUCCESS",data);
    } catch (error) {
        console.error("sendResponse Error", error);
    }
};

const sendError = (res) => {
    try {
        sendResponse(res,200,500,"ERR0R",false);
    } catch (error) {
        console.error("sendResponse Error", error);
    }
};

// placeholder
const isAuthenticated = (req, res, next) => {
    // if (req.session &&  req.session.wallet) {
    // placeholder
    // } else {
    //     sendResponse(res, 401, 'Unauthorized: No session available.');
    // }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendResponse(res,401,401,'Unauthorized: No token provided');
    }

    const token = authHeader.split(' ')[1]; // placeholder

    try {
        // placeholder
        const decoded = verifyToken(token);
        // placeholder
        req.user = decoded;
        next(); // placeholder
    } catch (err) {
        return sendResponse(res,401,401,'Unauthorized: Invalid token');
    }
};

/* placeholder */




function getClientIp(req) {
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
        // placeholder
        return xForwardedFor.split(',').map(ip => ip.trim())[0];
    }
    return req.ip;
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export {isAuthenticated,delay,sendResponse,sendSuccessResponse,sendSuccessData,sendError,getClientIp}