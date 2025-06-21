const express = require('express');
const app = express.Router();

const $PATH = require.main.path;
const $REDIS = require(`${$PATH}/config/redis`);
const { pool } = require(`${$PATH}/config/mysql`)
const { checkIp, dateFormat } = require(`${$PATH}/config/system`);

// server start
require(`${$PATH}/modules/APP`);

// /app
app.get('/info', async (req, res)=>{ // fetchInfo
    const $INFO = await $REDIS.GET(`${process.env.APP_NAME.toUpperCase()}_INFO`)
    res.json(JSON.parse($INFO))
})
app.get('/store', async (req, res)=>{ // storeUser
    const { login_id, login_ip, user_name, user_level } = req.user;
    if(login_id && login_ip !== checkIp(req)){
        const $SQL = `SELECT logined FROM user WHERE id=?;`;
        const $DATA = await pool($SQL, [login_id], req.originalUrl)
        if($DATA.code) return res.json({ code: 2, msg: `로그인 상태 오류\ntime : ${dateFormat()}\ncode : POOL`})
        if(!$DATA[0].logined){
            res.cookie(process.env.APP_NAME, '', { maxAge: 0 });
            res.clearCookie(process.env.APP_NAME);
        }
        return res.json({code:3, msg:'로그인 환경이 변경되었습니다.\n다시 로그인해 주세요.'});
    }
    if(!login_id) return res.json({ id: null, level: 0 });
    res.json({ id: login_id, name: user_name, level: user_level })
})
app.get('/list', async (req, res)=>{ // index
    const $SQL_LIST = `SELECT num, menu, category, title, created FROM event ORDER BY created DESC LIMIT 20 OFFSET 0;`;
    const $LIST = await pool($SQL_LIST, [null], req.originalUrl)
    if($LIST.code) return res.json({ code: 2, msg: `이벤트 목록 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({ code: 0, list: $LIST })
})

module.exports = app;