const express = require('express');
const app = express.Router();
const cheerio = require('cheerio');

const $PATH = require.main.path;
const { checkError, checkIp, dateFormat } = require(`${$PATH}/config/system`);
const { pool, pooling, transaction } = require(`${$PATH}/config/mysql`)
const { telegram, pagination } = require(`${$PATH}/modules`);
const { editorCheck } = require(`${$PATH}/modules/EDITOR`);
const { checkAdmin } = require(`${$PATH}/modules/USER`);

const userList = async (listId, reqUrl) => {
    const $LIST = listId.map(id => `'${id}'`).join(',');
    const $SQL_USER = `SELECT id, name, level FROM user WHERE id IN (${$LIST});`;
    return await pool($SQL_USER, [null], reqUrl);
};

// /messenger
app.use((req, res, next)=>{
    const { login_id } = req.user;
    if(!login_id) return res.json({code:1, msg:'로그인이 필요합니다.'});
    next();
})
app.get('/admin/:page', async (req, res)=>{ // admin list
    const { user_level } = req.user, { page } = req.params
    if(!checkAdmin(user_level)) return res.json({ code: 1, msg: '관리자가 아닙니다.'})
    const $SQL_COUNT = `SELECT COUNT(DISTINCT room) AS count FROM messenger;`;
    const $COUNT = await pool($SQL_COUNT, [null], req.originalUrl)
    if($COUNT.code) return res.json($COUNT)
    const $PAGING = pagination($COUNT[0].count, page, 10, 10);
    // CREATE INDEX idx_room_created ON messenger(room, created); 인덱스 추가
    const $SQL_LIST = `SELECT M.*, U.name, U.level FROM messenger AS M INNER JOIN user AS U ON M.user_id = U.id
        INNER JOIN (SELECT room, MAX(created) AS created FROM messenger GROUP BY room) AS L ON M.room = L.room
        AND M.created = L.created ORDER BY M.created DESC LIMIT ${$PAGING.viewList} OFFSET ${$PAGING.offset};`;
    const $LIST = await pool($SQL_LIST, [null], req.originalUrl);
    if($LIST.code) return res.json($LIST)
    const userPromises = $LIST.map(async (e) => {
        const $DECODE = decodeURIComponent(atob(e.room)); 
        const $USER = $DECODE.split('-');
        const $ROOM_USER = await userList($USER, req.originalUrl); // 병렬로 처리
        const $ = cheerio.load(e.note);
        const $MESSAGE = $('p').filter((i, el) => $(el).text().trim() !== '').first().text().trim(); // 비어있지 않은 첫 번째 <p> 태그의 텍스트만 필터링
        return { ...e, note: $MESSAGE, user: $ROOM_USER };
    });
    const $NEW_LIST = await Promise.all(userPromises);  // 병렬로 처리
    return res.json({ code: 0, list: $NEW_LIST, paging: $PAGING });
})
app.get('/list/:page', async (req, res)=>{
    const { login_id } = req.user, { page } = req.params;
    const $SQL_COUNT = `SELECT COUNT(DISTINCT room) AS count FROM messenger WHERE state <=6 AND (target_id=? OR user_id=?);`;
    const $COUNT = await pool($SQL_COUNT, [login_id, login_id], req.originalUrl)
    if($COUNT.code) return res.json($COUNT)
    const $PAGING = pagination($COUNT[0].count, page, 10, 10);
    // CREATE INDEX idx_room_created ON messenger(room, created); 인덱스 추가
    const $SQL_LIST = `SELECT M.*, U.name, U.level FROM messenger AS M INNER JOIN user AS U ON M.user_id = U.id
        INNER JOIN (SELECT room, MAX(created) AS created FROM messenger WHERE target_id=? OR user_id=? GROUP BY room) AS L ON M.room = L.room
        AND M.created = L.created ORDER BY M.created DESC LIMIT ${$PAGING.viewList} OFFSET ${$PAGING.offset};`;
    const $LIST = await pool($SQL_LIST, [login_id, login_id], req.originalUrl);
    if($LIST.code) return res.json($LIST)
    const userPromises = $LIST.map(async (e) => {
        const $DECODE = decodeURIComponent(atob(e.room)); 
        const $USER = $DECODE.split('-');
        const $ROOM_USER = await userList($USER, req.originalUrl);  // 병렬로 처리
        const $ = cheerio.load(e.note);
        const $MESSAGE = $('p').filter((i, el) => $(el).text().trim() !== '').first().text().trim();
        return { ...e, note: $MESSAGE, user: $ROOM_USER };
    });
    const $NEW_LIST = await Promise.all(userPromises);  // 병렬로 처리
    return res.json({ code: 0, list: $NEW_LIST, paging: $PAGING });
})
app.get('/room/:room/:page', async (req, res)=>{
    const { login_id, user_level } = req.user, { room, page } = req.params
    const $ROOM = decodeURIComponent(room);
    const $DECODE = decodeURIComponent(atob(room));
    const $USER = $DECODE.split('-');
    const $ROOM_USER = await userList($USER, req.originalUrl);
    const $VIEW = checkAdmin(user_level) ? '' : 'AND M.state <= 6'
    try{
        await transaction(async (conn)=>{
            const $SQL_UPDATE = `UPDATE messenger SET state=1 WHERE room=? AND target_id=? AND state=0;`;
            await pooling(conn, $SQL_UPDATE, [$ROOM, login_id], req.originalUrl)
            const $SQL_COUNT = `SELECT COUNT(*) AS count FROM messenger AS M WHERE room=? ${$VIEW}`;
            const $COUNT = await pooling(conn, $SQL_COUNT, [$ROOM], req.originalUrl)
            const $PAGING = pagination($COUNT[0].count, page, 5, 10);
            const $SQL_LIST = `SELECT M.*, U.id, U.name, U.level FROM messenger AS M INNER JOIN user AS U ON M.user_id = U.id WHERE room=? ${$VIEW}
                ORDER BY M.created DESC LIMIT ${$PAGING.viewList} OFFSET ${$PAGING.offset};`;
            const $LIST = await pooling(conn, $SQL_LIST, [$ROOM], req.originalUrl)
            res.json({code: 0, room_user: $ROOM_USER, list: $LIST, paging: $PAGING})
        })
    }catch(err){
        return res.json({code: 2, msg: `메신저 불러오기 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    }
})
app.post('/write', async (req, res)=>{
    const { login_id, user_name } = req.user, { room, target_id, editor } = req.body; // type: notice
    const $EDITOR = await editorCheck({type: 'messenger', folder: 'messenger', input: editor});
    if($EDITOR.code) return res.json($EDITOR);
    const $SQL_WRITE = `INSERT INTO messenger(room, target_id, user_id, note, user_ip) VALUES(?, ?, ?, ?, ?);`;
    const $WRITE = await pool($SQL_WRITE, [room, target_id, login_id, $EDITOR.data, checkIp(req)], req.originalUrl)
    if($WRITE.code) return res.json($WRITE);
    res.json({code: 0, msg: '메세지를 등록(전송)하였습니다.'});
    try{
        const $SQL_MESSENGER = `SELECT messenger FROM user_info WHERE id=?;`;
        const $MESSENGER = await pool($SQL_MESSENGER, [target_id], req.originalUrl);
        if($MESSENGER[0]?.messenger){ // 메신저 알림
            const $URL = `${process.env.APP_URL}/messenger/list/1`;
            telegram({id: $MESSENGER[0].messenger, msg: `[ 메신저 알림 ]\n새로운 메세지가 도착했습니다.\n작성자 : ${user_name}\n${$URL}`})
        }
    }catch(err){
        checkError(err, '메신저 메세지 등록(전송) 알림 오류!')
    }
})

module.exports = app;