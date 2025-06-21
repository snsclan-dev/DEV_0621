const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
require('dayjs/locale/ko');

const $PATH = require.main.path;
const { logger, telegram } = require(`${$PATH}/modules`)

const $SYSTEM_CORS = [ process.env.APP_URL, process.env.APP_HOST ]
const $FILE_UPLOAD = { maxSize: 10, fileSize: 10 * 1024 * 1024, chat: 3, temp: 100 } // upload

const checkIp = (req) => {
    const reqIp = req.headers["cf-connecting-ip"] || req.headers['x-real-ip'] || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    if(!reqIp) return null;
    const $IP = reqIp.split(',')[0].replace(/[^0-9.]/gm, '');
    const $REGEX_IP = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if(!$REGEX_IP.test($IP)) return null
    return $IP
}
const checkToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    const cookie = req.cookies[process.env.APP_NAME]
    const check = cookie || token; 
    if (!check || check === 'undefined') {
        req.user = { login_id: null, user_level: 0, user_ip: checkIp(req) };
        return next();
    }
    jwt.verify(check, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            req.user = { login_id: null, user_level: 0, user_ip: checkIp(req) };
        } else {
            req.user = decoded;
        }
        next();
    });
};
const checkError = (err, note) => {
    const $ERR = `${note}\n${err.stack || err.message}\n----------\n${err}`;
    if(process.env.NODE_ENV === 'production'){
        logger.error($ERR);
        telegram({ msg: `오류 알림 : ${$ERR}` })
    }else{
        console.log(`---------- \n[ checkError ]\n${$ERR}\n ----------`);
    }
}
const dateFormat = (format='YYYY-MM-DD HH:mm:ss') => {
    return dayjs().format(format)
}
const randomString = ()=>{
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return timestamp + random;
}

module.exports = {
    $SYSTEM_CORS, $FILE_UPLOAD,
    checkToken, checkError, checkIp, dateFormat, randomString
};
