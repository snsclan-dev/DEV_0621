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

app.get('/:app/list/:num/:page', async (req, res)=>{
    const { login_id, user_level } = req.user, { app, num, page } = req.params, { app_type } = req.query;
    // const $SQL_VIEW = checkAdmin(user_level) ? '' : `AND C.state != ${$BOARD_STATE['7_view']}`;
    const $SQL_VIEW = checkAdmin(user_level) ? '' : app_type === 'event' ? `AND user_id='${login_id}' OR target_id='${login_id}'` : `AND C.state != ${$BOARD_STATE['7_view']}`;
    try{
        await transaction(async (conn)=>{
            const $SQL_COUNT = `SELECT count(num) AS count FROM ${app}_comment AS C WHERE target_num=? ${$SQL_VIEW}`;
            const $COUNT = await pooling(conn, $SQL_COUNT, [num], req.originalUrl)
            const $PAGING = pagination($COUNT[0].count, page, 20, 10);
            const $SQL_COMMENT = `SELECT C.*, U.name, U.level, I.user_position, I.user_title, I.user_tag FROM ${app}_comment AS C
                INNER JOIN user AS U ON C.user_id = U.id LEFT JOIN user_info AS I ON C.user_id = I.id
                WHERE target_num=? ${$SQL_VIEW} ORDER BY order_num, order_sort LIMIT ${$PAGING.viewList} OFFSET ${$PAGING.offset};`;
            const $COMMENT = await pooling(conn, $SQL_COMMENT, [num], req.originalUrl)
            res.json({code: 0, list: $COMMENT, paging: $PAGING })
        })
    }catch(err){
        return res.json({code: 2, msg: `댓글 목록 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    }
})
app.use((req, res, next)=>{
    const { login_id } = req.user;
    if(!login_id) return res.json({code: 1, msg: '로그인이 필요합니다.'})
    next();
})
app.post('/write', async (req, res)=>{
    const { login_id } = req.user, { app, app_name, target_num, target_id, editor } = req.body;
    const $COUNT = await boardWriteCount({ app: `${app}_comment`, app_name }, login_id);
    if($COUNT.code) return res.json($COUNT)
    const $EDITOR = await editorCheck({type: 'comment', folder: app, input: editor});
    if($EDITOR.code) return res.json($EDITOR);
    try{
        await transaction(async (conn)=>{
            const $SQL_ORDER = `SELECT MAX(order_num) AS count FROM ${app}_comment WHERE target_num=?;`;
            const $ORDER = await pooling(conn, $SQL_ORDER, [target_num], req.originalUrl)
            const order_num = !$ORDER[0].count ? 1 : $ORDER[0].count + 1;
            const $SQL_WRITE = `INSERT INTO ${app}_comment(target_num, target_id, user_id, note, order_num, order_sort, user_ip) VALUES(?, ?, ?, ?, ?, ?, ?);`;
            await pooling(conn, $SQL_WRITE, [target_num, target_id || null, login_id, $EDITOR.data, order_num, order_num, checkIp(req)], req.originalUrl)
            res.json({code:0, msg: '댓글을 등록하였습니다.'});
            const $SQL_MESSENGER = `SELECT B.menu, B.category, B.title, I.messenger FROM board B LEFT JOIN user_info I ON I.id = ? WHERE B.num = ?;`;
            const $MESSENGER = await pooling(conn, $SQL_MESSENGER, [target_id, target_num], req.originalUrl);
            if($MESSENGER[0]?.messenger){ // 메신저 알림
                const $URL = `${process.env.APP_URL}/${app}/read/${$MESSENGER[0].menu}/${$MESSENGER[0].category}/${target_num}`;
                telegram({id: $MESSENGER[0].messenger, msg: `[ 댓글 알림 ]\n${$MESSENGER[0].title}\n${$URL}`})
            }
        })
    }catch(err){
        if(!res.headersSent) return res.json({ code: 2, msg: `댓글 등록 오류\ntime : ${dateFormat()}\ncode : TRANSACTION` });
    }
})
app.post('/reply', async (req, res)=>{
    const { login_id } = req.user, $CHECK = checkInput(req.body);
    if($CHECK.code) return res.json($CHECK)
    const { app, target_num, target_id, editor, order_num, order_sort, depth } = $CHECK;
    if(depth >= 2) return res.json({code: 1, msg: '답변을 등록할 수 없습니다.'})
    const $EDITOR = await editorCheck({type: 'comment', folder: app, input: editor});
    if($EDITOR.code) return res.json($EDITOR);
    try{
        await transaction(async (conn)=>{
            const $SQL_CHECK = `SELECT MAX(CAST(SUBSTRING_INDEX(order_sort, '_', -1) AS UNSIGNED)) AS last_order FROM ${app}_comment
            WHERE target_num = ? AND order_num = ? AND order_sort LIKE CONCAT(?, '_%');`;
            const $CHECK = await pooling(conn, $SQL_CHECK, [target_num, order_num, order_sort], req.originalUrl);
            const $ORDER_LAST = $CHECK[0].last_order
            let $ORDER_SORT = `${order_sort}_${$ORDER_LAST + 1}`
            const $SQL_REPLY = `INSERT INTO ${app}_comment(target_num, target_id, user_id, note, order_num, order_sort, depth, user_ip) VALUES(?, ?, ?, ?, ?, ?, ?, ?);`;
            await pooling(conn, $SQL_REPLY, [target_num, target_id, login_id, $EDITOR.data, order_num, $ORDER_SORT, depth + 1, checkIp(req)], req.originalUrl) 
            res.json({code:0, msg:'답변을 등록하였습니다.'})
            const $SQL_MESSENGER = `SELECT B.menu, B.category, B.title, I.messenger FROM board B LEFT JOIN user_info I ON I.id = ? WHERE B.num = ?;`;
            const $MESSENGER = await pooling(conn, $SQL_MESSENGER, [target_id, target_num], req.originalUrl);
            if($MESSENGER[0]?.messenger){ // 메신저 알림
                const $URL = `${process.env.APP_URL}/${app}/read/${$MESSENGER[0].menu}/${$MESSENGER[0].category}/${target_num}`;
                telegram({id: $MESSENGER[0].messenger, msg: `[ 댓글 답변 알림 ]\n${$MESSENGER[0].title}\n${$URL}`})
            }
        })
    }catch(err){
        if(!res.headersSent) return res.json({ code: 2, msg: `답변 등록 오류\ntime : ${dateFormat()}\ncode : TRANSACTION` });
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
// /delete
app.post('/delete', async (req, res)=>{
    const { app, num, target_num, order_sort } = req.body;
    try{
        await transaction(async (conn)=>{
            const $SQL_CHECK = `SELECT COUNT(num) AS count FROM ${app}_comment WHERE target_num=? AND order_sort LIKE CONCAT(?, '_%');`;
            const $CHECK = await pooling(conn, $SQL_CHECK, [target_num, order_sort], req.originalUrl)
            if(!$CHECK[0].count){
                const $SQL_DELETE = `DELETE FROM ${app}_comment WHERE num=?;`;
                await pooling(conn, $SQL_DELETE, [num], req.originalUrl)
                return res.json({code:0, msg: '댓글을 삭제하였습니다.'});
            }
            const $SQL_UPDATE = `UPDATE ${app}_comment SET state=${$BOARD_STATE['8_delete']} WHERE num=?;`;
            await pooling(conn, $SQL_UPDATE, [num], req.originalUrl)
            res.json({code:0, msg: '댓글을 삭제하였습니다.'});
        })
    }catch(err){
        return res.json({code: 2, msg: `댓글 삭제 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    }
})
// admin
app.post('/state', async (req, res)=>{
    const { app, check, value } = req.body
    if(Number(value) === 10){
        const $SQL_DELETE = `DELETE FROM ${app}_comment WHERE nums IN (${check});`;
        const $DELETE = await pool($SQL_DELETE, [null], req.originalUrl)
        if($DELETE.code) return res.json({code: 2, msg: `댓글 수정 오류\ntime : ${dateFormat()}\ncode : POOL`})
        await deleteImage(app, check); // app, board num
    }else{
        const $SQL_UPDATE = `UPDATE ${app}_comment SET state=? ${Number(value) === 0 ? ', count_report=0' : ''} WHERE num IN (${check});`;
        const $UPDATE = await pool($SQL_UPDATE, [value], req.originalUrl)
        if($UPDATE.code) return res.json({code: 2, msg: `댓글 수정 오류\ntime : ${dateFormat()}\ncode : POOL`})
    }
    res.json({code:0, msg: Number(value) >= $BOARD_STATE['8_delete'] ? '댓글을 삭제하였습니다.' : '댓글을 수정하였습니다.'});
})
module.exports = app;