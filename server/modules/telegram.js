const https = require('https');

const $API_DEV = `https://api.telegram.org/bot${process.env.TELEGRAM_DEV_TOKEN}/sendMessage`;
const $API_BOT = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

const telegram = ({ id=false, msg })=>{
    if(process.env.NODE_ENV === 'production'){
        const $DATA = JSON.stringify({ chat_id: id ? id : process.env.TELEGRAM_DEV_ID, text: id ? msg : `[ ${process.env.APP_NAME.toUpperCase()} ]\n${msg}` });
        const $OPTION = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength($DATA) } };
        const req = https.request(id ? $API_BOT: $API_DEV, $OPTION);
        req.on('error', (err) => console.log(`Telegram Https Error\n${err}`));
        req.write($DATA);
        req.end();
    }else{
        console.log(id ? msg : `[ ${process.env.APP_NAME.toUpperCase()} ]\n${msg}`)
    }
}

module.exports = telegram;