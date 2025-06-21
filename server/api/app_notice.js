const express = require('express');
const app = express.Router();

const $PATH = require.main.path;
const { pool, pooling, transaction } = require(`${$PATH}/config/mysql`)
const { checkError, dateFormat } = require(`${$PATH}/config/system`);
const { pagination } = require(`${$PATH}/modules`);
const { checkInput } = require(`${$PATH}/modules/REGEX`);
const { checkAdmin } = require(`${$PATH}/modules/USER`);
const { boardView, deleteImage } = require(`${$PATH}/modules/BOARD`)
const { editorCheck } = require(`${$PATH}/modules/EDITOR`);

app.get('/notice/:app/:menu/:category/:page', async (req, res)=>{
    const { user_level } = req.user, { app, menu, category, page } = req.params;
    const $SQL = boardView(user_level)
    try{
        await transaction(async (conn)=>{
            const $SQL_COUNT = `SELECT count(num) AS count FROM app_notice AS B WHERE app=? AND menu=? AND category=? ${$SQL}`;
            const $COUNT = await pooling(conn, $SQL_COUNT, [app, menu, category], req.originalUrl)
            const $PAGING = pagination($COUNT[0].count, page, 10, 10);
            const $SQL_NOTICE = `SELECT * FROM app_notice AS B WHERE app=? AND menu=? AND category=? ${$SQL} ORDER BY created DESC LIMIT ${$PAGING.viewList} OFFSET ${$PAGING.offset};`;
            const $NOTICE = await pooling(conn, $SQL_NOTICE, [app, menu, category], req.originalUrl)
            res.json({code: 0, list: $NOTICE, paging: []})
        })
    }catch(err){
        return res.json({code: 2, msg: `공지사항 목록 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    }
})
app.use((req, res, next)=>{
    const { login_id, user_level } = req.user;
    if(!login_id) return res.json({code:3, msg:'로그인이 필요합니다.'});
    if(!checkAdmin(user_level)) return res.json({code:3, msg:'운영자가 아닙니다.'})
    next();
})
app.post('/notice/write', async (req, res)=>{
    const { editor } = req.body; // type: notice
    const $CHECK = checkInput(req.body)
    if($CHECK.code) return res.json($CHECK)
    const { app, menu, category, board_title } = $CHECK;
    const $EDITOR = await editorCheck({type: 'board', folder: 'notice', input: editor});
    if($EDITOR.code) return res.json($EDITOR);
    const $SQL_WRITE = `INSERT INTO app_notice(app, menu, category, title, note) VALUES(?, ?, ?, ?, ?);`;
    const $WRITE = await pool($SQL_WRITE, [app, menu, category, board_title, $EDITOR.data])
    if($WRITE.code) return res.json({code: 2, msg: `공지사항 등록 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code: 0, msg: '공지사항을 등록하였습니다.'});
})
app.post('/notice/modify', async (req, res)=>{
    const { target_note, editor } = req.body;
    const $CHECK = checkInput(req.body)
    if($CHECK.code) return res.json($CHECK)
    const { num, board_title } = $CHECK;
    const $EDITOR = await editorCheck({type: 'board', folder: 'notice', input: editor, save: target_note});
    if($EDITOR.code) return res.json($EDITOR);
    const $SQL_MODIFY = `UPDATE app_notice SET title=?, note=? WHERE num=?;`;
    const $MODIFY = await pool($SQL_MODIFY, [board_title, $EDITOR.data, num], req.originalUrl)
    if($MODIFY.code) return res.json({code: 2, msg: `공지사항 수정 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code:0, msg: '공지사항을 수정하였습니다.'});
})
app.post('/notice/state', async (req, res)=>{
    const { check, value } = req.body
    if(Number(value) === 10){
        const $SQL_DELETE = `DELETE FROM app_notice WHERE num IN (${check});`;
        const $DELETE = await pool($SQL_DELETE, [null], req.originalUrl)
        if($DELETE.code) return res.json({code: 2, msg: `공지사항 삭제 오류\ntime : ${dateFormat()}\ncode : POOL`})
        await deleteImage('notice', check); // app, board num
    }else{
        const $SQL_UPDATE = `UPDATE app_notice SET state=? WHERE num IN (${check});`;
        const $UPDATE = await pool($SQL_UPDATE, [value], req.originalUrl)
        if($UPDATE.code) return res.json({code: 2, msg: `공지사항 수정 오류\ntime : ${dateFormat()}\ncode : POOL`})
    }
    res.json({code:0, msg: Number(value) === 10 ? '공지사항을 삭제하였습니다.' : '공지사항을 수정하였습니다.'});
})

module.exports = app;