const express = require('express');
const app = express.Router();

const $PATH = require.main.path;
const { pool, pooling, transaction } = require(`${$PATH}/config/mysql`)
const { telegram, pagination } = require(`${$PATH}/modules`);
const { checkIp, dateFormat } = require(`${$PATH}/config/system`);
const { checkImage, checkInput } = require(`${$PATH}/modules/REGEX`);
const { editorCheck } = require(`${$PATH}/modules/EDITOR`);
const { checkAdmin, checkManager, userUpdate } = require(`${$PATH}/modules/USER`);
const { $BOARD_STATE, $BOARD_REPORT, boardWriteCount, boardInfo, boardView, boardHit, deleteImage } = require(`${$PATH}/modules/BOARD`);

app.get('/list/:app/:menu/:category/:page', async (req, res)=>{
    const { user_level } = req.user, { app, menu, category, page } = req.params;
    const $INFO = await boardInfo({app, menu, category}, user_level);
    if($INFO.code) return res.json($INFO)
    const $SQL_VIEW = boardView(user_level); // manager state <= report
    try{
        await transaction(async (conn)=>{
            const $SQL_COUNT = `SELECT count(num) AS count FROM ${app} AS B WHERE menu=? AND category=? ${$SQL_VIEW};`;
            const $COUNT = await pooling(conn, $SQL_COUNT, [menu, category], req.originalUrl)
            const $PAGING = pagination($COUNT[0].count, page, 20, 10);
            const $SQL_LIST = `SELECT B.num, menu, category, user_id, U.name, U.level, image, title, price, period, tag, B.created, count_like, count_report, count_hit, B.state,
                COALESCE(C.comment_count, 0) AS comment FROM ${app} AS B LEFT JOIN user AS U ON B.user_id = U.id
                LEFT JOIN (SELECT target_num, COUNT(*) AS comment_count FROM ${app}_comment WHERE state <= ${$BOARD_STATE['6_report']} GROUP BY target_num) AS C ON B.num = C.target_num
                WHERE menu=? AND category=? ${$SQL_VIEW} ORDER BY B.state = ${$BOARD_STATE['1_notice']} DESC, B.created DESC LIMIT ${$PAGING.viewList} OFFSET ${$PAGING.offset};`
            const $LIST = await pooling(conn, $SQL_LIST, [menu, category], req.originalUrl)
            res.json({code: 0, list: $LIST, paging: $PAGING})
        })
    }catch(err){
        return res.json({code: 2, msg: `게시판 목록 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    }
})
app.get('/read/:app/:menu/:category/:num', async (req, res)=>{
    const { login_id, user_level } = req.user, { app, menu, category, num } = req.params;
    const $INFO = await boardInfo({app, menu, category}, user_level);
    if($INFO.code) return res.json($INFO)
    const $SQL_READ = `SELECT B.*, U.name, U.level, I.user_position, I.user_title, I.user_tag, COALESCE(C.comment_count, 0) AS comment FROM ${app} AS B
        LEFT JOIN user AS U ON U.id = B.user_id LEFT JOIN user_info AS I ON B.user_id = I.id
        LEFT JOIN (SELECT target_num, COUNT(*) AS comment_count FROM ${app}_comment WHERE state <= ${$BOARD_STATE['6_report']} GROUP BY target_num) AS C ON B.num = C.target_num WHERE B.num=?;`
    const $READ = await pool($SQL_READ, [num], req.originalUrl)
    if($READ.code) return res.json({code: 2, msg: `게시판 읽기 오류\ntime : ${dateFormat()}\ncode : POOL`})
    if(!$READ.length) return res.json({code: 1, msg: '없거나 삭제된 글입니다.'});
    const { user_id, state, count_report } = $READ[0];
    if(!checkManager(user_level) && (state === $BOARD_STATE['6_report'] || count_report >= $BOARD_REPORT)) return res.json({code: 1, msg: '신고된 글입니다.'})
    if(!checkAdmin(user_level) && state >= $BOARD_STATE['7_view']) return res.json({code: 1, msg: '없거나 삭제된 글입니다.'})
    if(login_id !== user_id) await boardHit(app, num, login_id) // 조회수
    res.json({code: 0, read: $READ[0]});
});
app.use((req, res, next)=>{
    const { login_id } = req.user;
    if(!login_id) return res.json({code:1, msg:'로그인이 필요합니다.'});
    next();
})
app.get('/search/:app/:search/:page', async (req, res)=>{
    const { user_level } = req.user, { app, search, page } = req.params;
    const $CHECK = checkInput({search: search})
    if($CHECK.code) return res.json($CHECK)
    const $BOARD_VIEW = boardView(user_level);
    const $SQL_VIEW = `(B.num LIKE ? OR U.name LIKE ? OR tag LIKE ? OR title LIKE ? OR note LIKE ?) ${$BOARD_VIEW}`;
    const $VALUES = Array(5).fill(`%${search}%`);
    try{
        await transaction(async (conn)=>{
            const $SQL_COUNT = `SELECT count(B.num) AS count FROM ${app} AS B LEFT JOIN user AS U ON user_id = U.id WHERE ${$SQL_VIEW}`;
            const $COUNT = await pooling(conn, $SQL_COUNT, $VALUES, req.originalUrl)
            const $PAGING = pagination($COUNT[0].count, page, 20, 10);
            const $SQL_LIST = `SELECT B.num, menu, category, user_id, image, title, B.period, tag, B.created, count_like, count_report, B.state, U.name, U.level,
                (SELECT count(num) FROM ${app}_comment WHERE target_num = B.num AND state <= ${$BOARD_STATE['6_report']}) AS comment FROM ${app} AS B LEFT JOIN user AS U ON user_id = U.id 
                WHERE ${$SQL_VIEW} ORDER BY B.state = ${$BOARD_STATE['1_notice']} DESC, B.created DESC LIMIT ${$PAGING.viewList} OFFSET ${$PAGING.offset};`;
            const $LIST = await pooling(conn, $SQL_LIST, $VALUES, req.originalUrl)
            res.json({code: 0, list: $LIST, paging: $PAGING})
        })
    }catch(err){
        return res.json({code: 2, msg: `게시판 검색 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    }
})
app.post('/write', async (req, res)=>{
    const { login_id, user_level } = req.user, { app, menu, category, editor } = req.body;
    const $INFO = await boardInfo({app, menu, category});
    if($INFO.code) return res.json($INFO)
    const $COUNT = await boardWriteCount($INFO, login_id);
    if($COUNT.code) return res.json($COUNT)
    if($INFO.level_create > user_level) return { code: 1, msg: `글쓰기 등급 [ ${$INFO.level_create} ]\n나의 등급 [ ${user_level} ]`}
    const $CHECK = checkInput(req.body)
    if($CHECK.code) return res.json($CHECK)
    const { board_title, price, period, image, tag, state } = $CHECK;
    const $IMAGE = await checkImage(app, image, false)
    if($IMAGE.code) return res.json($IMAGE)
    const $EDITOR = await editorCheck({type: 'board', folder: app, input: editor});
    if($EDITOR.code) return res.json($EDITOR);
    try{
        await transaction(async (conn)=>{
            const $SQL_WRITE = `INSERT INTO ${app}(app, menu, category, user_id, title, image, price, period, note, tag, state, user_ip) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
            await pooling(conn, $SQL_WRITE, [app, menu, category, login_id, board_title, $IMAGE.data, price, period, $EDITOR.data, tag, state, checkIp(req)], req.originalUrl)
            const $NUM = await pooling(conn, `SELECT LAST_INSERT_ID() AS num;`)
            if(!$NUM.length) return res.json({ code: 2, msg: '게시판 글 등록 오류!' })
            if($NUM.length){
                setTimeout(()=>{ res.json({code:0, msg: '글을 등록하였습니다.', num: $NUM[0].num}) }, 600)
                const $URL = `${process.env.APP_URL}/${app}/read/${menu}/${category}/${$NUM[0].num}`;
                telegram({ msg: `[ 새로운 글 알림 ] ${$INFO.app_name} > ${$INFO.menu_name} > ${$INFO.category_name} > ${$NUM[0].num}\n${board_title}\n${$URL}`})
            }
        })
    }catch(err){
        if(!res.headersSent) return res.json({ code: 2, msg: `게시판 글 등록 오류\ntime : ${dateFormat()}\ncode : TRANSACTION` });
        // return res.json({code: 2, msg: `게시판 글 등록 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    }
})
app.post('/modify', async (req, res)=>{
    const { login_id, user_level } = req.user, { app, user_id, editor, target_note } = req.body;
    if(!checkAdmin(user_level) && user_id !== login_id) return res.json({code: 1, msg: '작성자가 아닙니다.'})
    const $CHECK = checkInput(req.body)
    if($CHECK.code) return res.json($CHECK)
    const { num, board_title, image, target_image, price, period, tag, state } = $CHECK;
    const $IMAGE = await checkImage(app, image, target_image)
    if($IMAGE.code) return res.json($IMAGE)
    const $EDITOR = await editorCheck({type: 'board', folder: app, input: editor, save: target_note});
    if($EDITOR.code) return res.json($EDITOR);
    const $SQL_MODIFY = `UPDATE ${app} SET title=?, image=?, price=?, period=?, note=?, tag=?, state=?, updated=NOW() WHERE num=?;`;
    const $MODIFY = await pool($SQL_MODIFY, [board_title, $IMAGE.data, price, period, $EDITOR.data, tag, state, num], req.originalUrl)
    if($MODIFY.code) return res.json({code: 2, msg: `게시판 글 수정 오류\ntime : ${dateFormat()}\ncode : POOL`})
    const $USER_UPDATE = await userUpdate(login_id)
    if($USER_UPDATE.code) return res.json($USER_UPDATE)
    res.json({ code: 0, msg: '글을 수정하였습니다.' });
})
app.post('/delete', async (req, res)=>{
    const { login_id } = req.user, { app, num } = req.body
    const $SQL_DELETE = `UPDATE ${app} SET state=${$BOARD_STATE['8_delete']} WHERE num=?;`;
    const $DELETE = await pool($SQL_DELETE, [num], req.originalUrl)
    if($DELETE.code) return res.json({code: 2, msg: `게시판 글 삭제 오류\ntime : ${dateFormat()}\ncode : POOL`})
    await userUpdate(login_id)
    res.json({code:0, msg: '글을 삭제하였습니다.'});
})
// admin
app.post('/state', async (req, res)=>{
    const { app, check, value } = req.body
    if(Number(value) === 10){
        const $SQL_DELETE = `DELETE FROM ${app} WHERE num IN (${check});`;
        const $DELETE = await pool($SQL_DELETE, [null], req.originalUrl)
        if($DELETE.code) return res.json({code: 2, msg: `게시판 글 삭제 오류\ntime : ${dateFormat()}\ncode : POOL`})
        await deleteImage(app, check); // app, board num
    }else{
        const $SQL_UPDATE = `UPDATE ${app} SET state=? ${Number(value) === 0 ? ', count_report=0' : ''} WHERE num IN (${check});`;
        const $UPDATE = await pool($SQL_UPDATE, [value], req.originalUrl)
        if($UPDATE.code) return res.json({code: 2, msg: `게시판 글 수정 오류\ntime : ${dateFormat()}\ncode : POOL`})
    }
    res.json({code:0, msg: Number(value) >= $BOARD_STATE['8_delete'] ? '글을 삭제하였습니다.' : '글을 수정하였습니다.'});
})
app.post('/move', async (req, res)=>{
    const { user_level } = req.user, { app, menu, category, check } = req.body;
    if(!checkAdmin(user_level)) return res.json({code: 1, msg: '운영자가 아닙니다.'})
    const $SQL_MOVE = `UPDATE ${app} SET menu=?, category=? WHERE num IN (${check});`;
    const $MOVE = await pool($SQL_MOVE, [menu, category], req.originalUrl)
    if($MOVE.code) return res.json({code: 2, msg: `게시판 글 이동 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code:0, msg: '글을 이동하였습니다.'});
})

module.exports = app;