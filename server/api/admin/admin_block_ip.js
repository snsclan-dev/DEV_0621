const express = require('express');
const app = express.Router();

const $PATH = require.main.path;
const { checkError, checkToken, dateFormat } = require(`${$PATH}/config/system`);
const { pool, pooling, transaction } = require(`${$PATH}/config/mysql`)
const { pagination } = require(`${$PATH}/modules`);
const { checkAdmin } = require(`${$PATH}/modules/USER`);

// /admin/block
app.use(checkToken, (req, res, next)=>{
    const { login_id, user_level } = req.user;
    if(!login_id) return res.json({code:3, msg:'로그인이 필요합니다.'});
    if(!checkAdmin(user_level)) return res.json({code:3, msg:'운영자가 아닙니다.'})
    next();
})
app.get('/ip/list/:page', async (req, res)=>{
    const { page } = req.params;
    try{
        await transaction(async (conn)=>{
            const $SQL_COUNT = `SELECT COUNT(num) AS count FROM block_ip;`;
            const $COUNT = await pooling(conn, $SQL_COUNT, [], req.originalUrl)
            const $PAGING = pagination($COUNT[0].count, page, 20, 10);
            const $SQL_LIST = `SELECT * FROM block_ip ORDER BY created DESC LIMIT ${$PAGING.viewList} OFFSET ${$PAGING.offset};`;
            const $LIST = await pooling(conn, $SQL_LIST, [], req.originalUrl)
            res.json({ code: 0, list: $LIST, paging: $PAGING })
        })
    }catch(err){
        checkError(err, `/admin/admin_user.js, /block/ip`);
        return res.json({code: 2, msg: `차단 목록 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    }
})
app.post('/ip/create', async (req, res)=>{
    const { ip } = req.body
    const $SQL_INSERT = `INSERT INTO block_ip(ip) VALUES(?);`;
    const $INSERT = await pool($SQL_INSERT, [ip], req.originalUrl)
    if($INSERT.code) return res.json({code: 1, msg: `이미 차단된 IP(아이피)입니다.`})
    res.json({code: 0, msg: 'IP(아이피) 차단 완료!'})
})  
app.post('/ip/delete', async (req, res)=>{
    const { num } = req.body
    const $SQL_DELETE = `DELETE FROM block_ip WHERE num=?;`;
    const $DELETE = await pool($SQL_DELETE, [num], req.originalUrl)
    if($DELETE.code) return res.json({code: 2, msg: `차단 삭제 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code: 0, msg: '차단 삭제 완료!'})
})  

module.exports = app;