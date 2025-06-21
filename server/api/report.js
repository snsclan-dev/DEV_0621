const express = require('express');
const app = express.Router();

const $PATH = require.main.path;
const { pool, pooling, transaction } = require(`${$PATH}/config/mysql`)
const { checkToken, checkError, checkIp } = require(`${$PATH}/config/system`);
const { checkInput } = require(`${$PATH}/modules/REGEX`);

// /report > target_app
app.use(checkToken, (req, res, next)=>{
    const { login_id } = req.user;
    if(!login_id) return res.json({ code:3, msg:'로그인이 필요합니다.'});
    next();
})
app.post('/info', async (req, res)=>{ // like check 
    const { login_id } = req.user, { target_app, target_num } = req.body
    const $SQL_INFO = `SELECT type, created FROM report WHERE target_app=? AND target_num=? AND user_id=?;`;
    const $INFO = await pool($SQL_INFO, [target_app, target_num, login_id], req.originalUrl)
    if($INFO.code) return res.json({code: 2, msg: `좋아요 상태 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({ code: 0, info: $INFO, like: $INFO.length ? true : false })
})
app.post('/write', async (req, res)=>{ // target_app: table, table_comment
    const { login_id } = req.user, { type, target_app, target_num, target_id, report_note } = req.body;
    const $CHECK = checkInput({note: report_note})
    if($CHECK.code) return res.json($CHECK)
    try{
        await transaction(async (conn)=>{
            const $SQL_CHECK = `SELECT created FROM report WHERE type=? AND target_app=? AND target_num=? AND user_id=?;`;
            const $CHECK = await pooling(conn, $SQL_CHECK, [type, target_app, target_num, login_id], req.originalUrl)
            if($CHECK.length) return res.json({code: 1, msg: `신고한 게시물입니다.\n신고일 : ${$CHECK[0].created}`})
            if(target_app === 'messenger'){ // messenger report state 6
                const $SQL_MESSENGER =`INSERT INTO report(note, type, target_app, target_num, target_id, user_id, report_note)
                    SELECT note, ?, ?, ?, ?, ?, ? FROM ${target_app} WHERE num=?;`;
                await pooling(conn, $SQL_MESSENGER, [type, target_app, target_num, target_id, login_id, report_note, target_num], req.originalUrl)
                const $SQL_UPDATE = `UPDATE ${target_app} SET state=6 WHERE num=?;`;
                await pooling(conn, $SQL_UPDATE, [target_num], req.originalUrl);
                return res.json({code:0, msg: '신고가 접수되었습니다.'});
            }
            if(target_app.split('_')[1] === 'comment'){
                const $SQL_COMMENT = `INSERT INTO report(note, type, target_app, target_num, target_id, user_id, report_note) 
                    SELECT note, ?, ?, ?, ?, ?, ? FROM ${target_app} WHERE num=?;`;
                await pooling(conn, $SQL_COMMENT, [type, target_app, target_num, target_id, login_id, report_note, target_num], req.originalUrl)
            }else{ // board
                const $SQL_BOARD = `INSERT INTO report(title, image, note, link, tag, type, target_app, target_num, target_id, user_id, report_note) 
                    SELECT title, image, note, link, tag, ?, ?, ?, ?, ?, ? FROM ${target_app} WHERE num=?;`;
                await pooling(conn, $SQL_BOARD, [type, target_app, target_num, target_id, login_id, report_note, target_num], req.originalUrl)
            }
            // 신고수 증가 코드
            const $SQL_UPDATE = `UPDATE ${target_app} SET count_report=count_report+1 WHERE num=?;`;
            await pooling(conn, $SQL_UPDATE, [target_num], req.originalUrl);
            res.json({code:0, msg: '신고가 접수되었습니다.'});
        })
    }catch(err){
        return res.json({code: 2, msg: `신고 등록 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    }
})
app.post('/like', async (req, res)=>{ // target_app: table, table_comment
    const { login_id } = req.user, { type, target_app, target_num, target_id } = req.body;
    try{
        await transaction(async (conn)=>{
            const $SQL_CHECK = `SELECT num FROM report WHERE type=? AND target_app=? AND target_num=? AND user_id=?;`;
            const $CHECK = await pooling(conn, $SQL_CHECK, [type, target_app, target_num, login_id], req.originalUrl)
            if(!$CHECK.length){
                const $SQL_LIKE = `INSERT INTO report(type, target_app, target_num, target_id, user_id) VALUES(?, ?, ?, ?, ?);`;
                await pooling(conn, $SQL_LIKE, [type, target_app, target_num, target_id, login_id], req.originalUrl)
            }else{
                const $SQL_DELETE = `DELETE FROM report WHERE type=? AND target_app=? AND target_num=? AND user_id=?;`;
                await pooling(conn, $SQL_DELETE, [type, target_app, target_num, login_id], req.originalUrl)
            }
            const $SQL_UPDATE = `UPDATE ${target_app} SET count_like=${!$CHECK.length ? 'count_like+1' : 'count_like-1'} WHERE num=?;`;
            await pooling(conn, $SQL_UPDATE, [target_num], req.originalUrl);
            res.json({code:0, msg: `좋아요를 ${!$CHECK.length ? '등록' : '삭제'}하였습니다.`});
        })
    }catch(err){
        return res.json({code: 2, msg: `좋아요 등록(삭제) 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    }
})

module.exports = app;