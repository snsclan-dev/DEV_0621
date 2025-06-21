const express = require('express');
const app = express.Router();

const $PATH = require.main.path;
const { pool, pooling, transaction } = require(`${$PATH}/config/mysql`)
const { checkIp, dateFormat } = require(`${$PATH}/config/system`);
const { telegram, pagination } = require(`${$PATH}/modules`);
const { checkInput } = require(`${$PATH}/modules/REGEX`);
const { editorCheck } = require(`${$PATH}/modules/EDITOR`);
const { $BOARD_STATE, boardWriteCount, deleteImage } = require(`${$PATH}/modules/BOARD`);
const { checkAdmin } = require(`${$PATH}/modules/USER`);

// /comment/event/
app.use((req, res, next)=>{
    const { login_id } = req.user;
    if(!login_id) return res.json({code: 1, msg: '로그인이 필요합니다.'})
    next();
})
app.post('/write', async (req, res)=>{ // 입찰
    const { login_id } = req.user, { app, target_num, target_id, read_price, input_price, editor } = req.body;
    if(Number(read_price) > Number(input_price)) return res.json({code: 1, msg: '입찰 : 최소 금액보다 높거나 같아야 합니다.'})
    const $EDITOR = await editorCheck({type: 'event', folder: app, input: editor});
    if($EDITOR.code) return res.json($EDITOR);
    const $SQL_CHECK = `SELECT COUNT(*) AS count FROM ${app}_comment WHERE target_num=? AND user_id=?;`;
    const $CHECK = await pool($SQL_CHECK,  [target_num, login_id], req.originalUrl)
    if($CHECK[0].count) return res.json({ code: 1, msg: '댓글(입찰)은 한번만 가능합니다.\n등록한 댓글(입찰)을 삭제한 후 등록해 주세요.'})
    try{
        await transaction(async (conn)=>{
            const $SQL_ORDER = `SELECT MAX(order_num) AS count FROM ${app}_comment WHERE target_num=?;`;
            const $ORDER = await pooling(conn, $SQL_ORDER, [target_num], req.originalUrl)
            const order_num = !$ORDER[0].count ? 1 : $ORDER[0].count + 1;
            const $SQL_WRITE = `INSERT INTO ${app}_comment(target_num, target_id, user_id, price, note, order_num, order_sort, user_ip) VALUES(?, ?, ?, ?, ?, ?, ?, ?);`;
            await pooling(conn, $SQL_WRITE, [target_num, target_id || null, login_id, input_price, $EDITOR.data, order_num, order_num, checkIp(req)], req.originalUrl)
            res.json({code:0, msg: '댓글(입찰)을 등록하였습니다.'});
            const $SQL_MESSENGER = `SELECT B.menu, B.category, B.title, I.messenger FROM board B LEFT JOIN user_info I ON I.id = ? WHERE B.num = ?;`;
            const $MESSENGER = await pooling(conn, $SQL_MESSENGER, [target_id, target_num], req.originalUrl);
            if($MESSENGER[0]?.messenger){ // 메신저 알림
                const $URL = `${process.env.APP_URL}/${app}/read/${$MESSENGER[0].menu}/${$MESSENGER[0].category}/${target_num}`;
                telegram({id: $MESSENGER[0].messenger, msg: `[ 댓글(입찰) 알림 ]\n${$MESSENGER[0].title}\n${$URL}`})
            }
        })
    }catch(err){
        if(!res.headersSent) return res.json({ code: 2, msg: `댓글(입찰) 등록 오류\ntime : ${dateFormat()}\ncode : TRANSACTION` });
    }
})
app.post('/modify', async (req, res)=>{
    const { login_id } = req.user, { app, num, target_note, editor } = req.body;
    const $EDITOR = await editorCheck({type: 'comment', folder: app, input: editor, save: target_note});
    if($EDITOR.code) return res.json($EDITOR);
    const $SQL_MODIFY = `UPDATE ${app}_comment SET note=?, updated=NOW() WHERE num=?;`;
    const $MODIFY = await pool($SQL_MODIFY, [$EDITOR.data, num], req.originalUrl)
    if($MODIFY.code) return res.json({code: 2, msg: `댓글 수정 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code:0, msg: '댓글을 수정하였습니다.'});
})
app.post('/delete', async (req, res)=>{
    const { app, num } = req.body;
    const $SQL_DELETE = `DELETE FROM ${app}_comment WHERE num=?;`;
        const $DELETE = await pool($SQL_DELETE, [num], req.originalUrl)
        if($DELETE.code) return res.json($DELETE)
        res.json({code:0, msg: '댓글(입찰)을 삭제하였습니다.'});
    })

module.exports = app;