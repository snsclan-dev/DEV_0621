const axios = require('axios');
const express = require('express');
const app = express.Router();

const $PATH = require.main.path;
const $REDIS = require(`${$PATH}/config/redis`);
const { pool } = require(`${$PATH}/config/mysql`)
const { checkError, dateFormat } = require(`${$PATH}/config/system`);

// /app
app.get('/info', async (req, res)=>{ // fetchInfo
    const $INFO = await $REDIS.GET(`${process.env.APP_NAME.toUpperCase()}_INFO`)
    res.json(JSON.parse($INFO))
})
app.get('/store', async (req, res)=>{ // storeUser
    const { login_id, user_name, user_level, user_ip } = req.user;
    if(!login_id) return res.json({ id: null, level: 0, ip: user_ip });
    res.json({ id: login_id, name: user_name, level: user_level, ip: user_ip })
})
app.get('/list', async (req, res)=>{ // index
    const $SQL_LIST = `SELECT num, menu, category, title, created FROM event ORDER BY created DESC LIMIT 20 OFFSET 0;`;
    const $LIST = await pool($SQL_LIST, [null], req.originalUrl)
    if($LIST.code) return res.json({ code: 2, msg: `이벤트 목록 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({ code: 0, list: $LIST })
})
app.get('/messenger', async (req, res)=>{ // telegram
    const { login_id } = req.user;
    try{
        const $DATA = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates?limit=1&offset=-1`).then((res)=>res.data)
        const $RESULT = $DATA.result
        if($RESULT.length === 0) return res.json({code: 1, msg: '봇에게 [ /start ]를 입력해 주세요!\n마지막 메세지가 [ /start ]일 경우에만 등록(연결)됩니다.'})
        const $FIND = $RESULT.find((e)=> e.message && e.message.text === '/start')
        if(!$FIND) return res.json({ code: 1, msg: '봇에게 [ /start ]를 입력해 주세요!\n마지막 메세지가 [ /start ]일 경우에만 등록(연결)됩니다.' });
        const $SQL_TELEGRAM = `UPDATE user_info SET messenger=? WHERE id=?;`;
        const $TELEGRAM = await pool($SQL_TELEGRAM, [$FIND.message.chat.id, login_id], req.originalUrl)
        if($TELEGRAM.code) return res.json({ code: 2, msg: `메신저 등록(연결) 오류\ntime : ${dateFormat()}\ncode : POOL`})
        res.json({ code: 0, msg: '메신저를 등록(연결)했습니다.' })
    }catch(err){
        checkError(err, '메신저 등록(연결) 오류!')
        res.json({ code: 2, msg: `메신저 등록(연결) 오류!`})
    }
})
app.post('/messenger/delete', async (req, res)=>{
    const { login_id } = req.user;
    const $SQL_DELETE = `UPDATE user_info SET messenger=? WHERE id=?;`;
    const $DELETE = await pool($SQL_DELETE, [null, login_id], req.originalUrl)
    if($DELETE.code) return res.json({ code: 2, msg: `메신저 삭제(해제) 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({ code: 0, msg: '메신저를 삭제(해제)했습니다.' })
})
app.post('/error', async (req, res)=>{ /// 코드 추가
    const { msg } = req.body;
    checkError(err, '클라이언트 오류!')
    res.json({ code: 0 })
})
module.exports = app;