const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
require('dayjs/locale/ko');

const $PATH = require.main.path;
const { logger, telegram } = require(`${$PATH}/modules`)

const $SYSTEM_CORS = [ process.env.APP_URL, process.env.APP_HOST ]
// server <=> client
const $FILE_UPLOAD = { // upload.js > folder params : temp 5, chat 3
    maxSize: 10, fileSize: 10 * 1024 * 1024, 
    // client
    tag: 50, editor: 10, board: 5, chat: 3, image: 1,
    // server
    count: 50, temp: 5
}
const checkIp = (req)=>{
    const reqIp = req.headers["cf-connecting-ip"] || req.headers['x-real-ip'] || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const $IP = reqIp.split(',')[0].replace(/[^0-9.]/gm, '');
    if(reqIp) return $IP
    return false;
}
const checkToken = (req, res, next)=>{
    const token = req.headers.authorization?.split(' ')[1];
    const cookie = req.cookies[process.env.APP_NAME]
    const check = token === 'undefined' ? cookie : token;
    if(!check){
        req.user = {login_id: false, login_ip: checkIp(req), user_level: 0 }
    }else{
        jwt.verify(check, process.env.JWT_KEY, (err, decoded)=>{
            if(err) req.user = {login_id: false, login_ip: checkIp(req), user_level: 0 }
            else req.user = decoded;
        });
    }
    next();
};
const checkError = (err, location)=>{ // catch error
    logger.error(`[${location}]\n[${err}\n`);
    process.env.NODE_ENV === 'production' ? telegram(`[ ${process.env.APP_NAME.toUpperCase()} ]\n오류 알림 : ${location}\n${err}`) : console.log(err);
}
const dateFormat = (format)=>{
    return dayjs().format(format)
}
const devLog = (title, log)=>{ // dev log
    if(process.env.NODE_ENV === 'development'){
        console.log(`----------[ ${title} ]----------`)
        console.log(log);
    }
}

module.exports = { 
    $SYSTEM_CORS, $FILE_UPLOAD, 
    checkToken, checkError, checkIp, 
    dateFormat,
    //  delay, checkRandom
    devLog
};
