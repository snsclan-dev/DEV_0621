require('dotenv').config
const express = require('express');
const app = express();

const $PATH = require.main.path;
const { dateFormat } = require(`${$PATH}/config/system`);
const { transaction, pooling, pool } = require(`${$PATH}/config/mysql`);
const { pagination } = require(`${$PATH}/modules`);
const { checkInput } = require(`${$PATH}/modules/REGEX`);
const { checkAdmin } = require(`${$PATH}/modules/USER`);
const { SOCKET_LIST, SOCKET_FIND } = require(`${$PATH}/modules/SOCKET`);
const { $CHAT_ROOM_TYPE, $CHAT_COUNT, chatList } = require(`${$PATH}/modules/CHAT`);

// /chat
app.get('/list/:page', async (req, res)=>{
    const { login_id, user_level } = req.user, { page } = req.params;
    const $SQL_VIEW = checkAdmin(user_level) ? '' : `WHERE C.user_id=?`;
    try {
        await transaction(async (conn)=>{
            const $SQL_COUNT = `SELECT COUNT(*) AS count FROM chat AS C ${$SQL_VIEW};`;
            const $COUNT = await pooling(conn, $SQL_COUNT, [login_id], req.originalUrl)
            const $PAGING = pagination($COUNT[0].count, page, 10, 10);
            const $SQL_LIST = `SELECT C.*, U.level, U.name FROM chat AS C LEFT JOIN user AS U ON C.user_id=U.id ${$SQL_VIEW} ORDER BY user_id LIMIT ${$PAGING.viewList} OFFSET ${$PAGING.offset};`
            const $LIST = await pooling(conn, $SQL_LIST, [login_id], req.originalUrl)
            const $REDIS = await SOCKET_LIST()
            const $DATA = chatList($LIST, $REDIS)
            res.json({code: 0, list: $DATA, paging: $PAGING})
        })
    } catch (error) {
        return res.json({code: 2, msg: `대화방 목록 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    }
})
app.get('/room/:room', async (req, res)=>{
    const { login_id, user_ip, user_level } = req.user, { room } = req.params;
    const $SQL_ROOM = `SELECT C.*, U.name, U.level FROM chat AS C INNER JOIN user AS U ON C.user_id = U.id WHERE room=?;`; // 셀렉터 줄이자
    const $ROOM = await pool($SQL_ROOM, [room], req.originalUrl)
    if($ROOM.code) return res.json({code: 2, msg: `대화방 정보 오류\ntime : ${dateFormat()}\ncode : POOL`})
    if(!$ROOM.length) return res.json({code:1, msg: '존재하지 않거나 삭제된 채팅방입니다.'});
    const { user_id, room_type, state, blocked } = $ROOM[0];
    if(!checkAdmin(user_level)){
        if(Number(room_type) === $CHAT_ROOM_TYPE['7_view'] && user_id !== login_id) return res.json({code: 1, msg: '참여할 수 없는 채팅방입니다. (상태 확인)'})
        const $BLOCK_LIST = blocked ? blocked.split(',') : [];
        const $FIND = $BLOCK_LIST.some((e)=> e === login_id || e === user_ip)
        if($FIND) return res.json({code:1, msg: '참여할 수 없는 채팅방입니다. (차단)'})
    }
    if(Number(room_type) === $CHAT_ROOM_TYPE['2_user'] && !login_id) return res.json({code:1, msg: '회원만 참여가 가능합니다. (로그인 필요)'})
    res.json({code: 0, room: $ROOM[0]})
})
app.post('/room/code', async (req, res)=>{ // check room join code
    const { room, room_code } = req.body
    const $CHECK = checkInput({ room_code: room_code })
    if($CHECK.code) return res.json($CHECK)
    const $SQL_CODE = `SELECT room_code FROM chat WHERE room=?;`;
    const $CODE = await pool($SQL_CODE, [room], req.originalUrl)
    if($CODE.code) return res.json({code: 2, msg: `대화방 비밀번호 입력 오류 \ntime : ${dateFormat()}\ncode : POOL`})
    if($CODE[0].room_code !== room_code) return res.json({ code: 1, msg: '대화방 비밀번호가 틀렸습니다.' })
    res.json({code: 0})
})
app.post('/room/create', async (req, res)=>{
    const { login_id, user_level } = req.user, { room_code, ...$INPUT } = req.body
    if(!checkAdmin(user_level)) return res.json({code: 1, msg: '대화방은 관리자만 만들 수 있습니다.'}) ///
    const $CHECK = checkInput($INPUT)
    if($CHECK.code) return res.json($CHECK)
    const { room, chat_title, room_type, room_max, memo } = $CHECK;
    if(Number(room_type) === $CHAT_ROOM_TYPE['3_secret']){
        const $CHECK = checkInput({ room_code: room_code })
        if($CHECK.code) return res.json($CHECK)
    }
    // unsg -----
    const $SQL_CREATE = `INSERT INTO chat(room, title, user_id, room_type, room_max, room_code, memo) VALUES(?, ?, ?, ?, ?, ?, ?);`;
    const $CREATE = await pool($SQL_CREATE, [room, chat_title, login_id, Number(room_type), room_max, room_code || null, memo], req.originalUrl)
    if($CREATE.code) return res.json($CREATE)
    res.json({ code: 0, msg: '대화방을 만들었습니다.', room: room })
    // ===== unsg
    // pzzdb -----
    // try{
    //     await transaction(async (conn)=>{
    //         const $SQL_COUNT = `SELECT COUNT(*) AS count FROM chat WHERE user_id=?;`;
    //         const $COUNT = await pooling(conn, $SQL_COUNT, [login_id], req.originalUrl)
    //         if(!checkAdmin(user_level) && $COUNT[0].count >= $CHAT_COUNT.create) return res.json({code: 1, msg: `대화방 만들기는 최대 ${$CHAT_COUNT.create}개까지 가능합니다.`})
    //         const $SQL_CREATE = `INSERT INTO chat(room, title, user_id, room_type, room_max, room_code, memo) VALUES(?, ?, ?, ?, ?, ?, ?);`;
    //         await pooling(conn, $SQL_CREATE, [room, chat_title, login_id, Number(room_type), room_max, room_code || null, memo], req.originalUrl)
    //         res.json({ code: 0, msg: '채팅방을 만들었습니다.', room: room })
    //     })
    // }catch(err){
    //     return res.json({code: 2, msg: `대화방 등록 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    // }
    // ===== pzzdb
})
app.post('/room/modify', async (req, res)=>{
    const { login_id, user_level } = req.user, { user_id, room_code, ...$INPUT } = req.body
    if(!checkAdmin(user_level) && user_id !== login_id) return res.json({code: 1, msg: '대화방 방장이 아닙니다.'})
    const $CHECK = checkInput($INPUT)
    if($CHECK.code) return res.json($CHECK)
    const { room, chat_title, room_type, room_max, memo } = $CHECK;
    if(Number(room_type) === $CHAT_ROOM_TYPE['3_secret']){
        const $CHECK = checkInput({ room_code: room_code })
        if($CHECK.code) return res.json($CHECK)
    }
    const $SQL_MODIFY = `UPDATE chat SET title=?, memo=?, room_type=?, room_max=?, room_code=? WHERE room=?;`;
    const $MODIFY = await pool($SQL_MODIFY, [chat_title, memo, room_type, room_max, room_code, room], req.originalUrl)
    if($MODIFY.code) return res.json({code: 2, msg: `대화방 수정 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code:0, msg:'채팅방이 수정되었습니다.'})
})
app.post('/room/block', async (req, res)=>{
    const { login_id, user_level } = req.user, { room, target_socket, host_id, name } = req.body;
    const $FIND = await SOCKET_FIND(target_socket)
    if(!$FIND) return res.json({ code: 1, msg: '해당하는 사용자 정보가 없습니다.'})
    if(!checkAdmin(user_level)){
        if(host_id !== login_id) return res.json({code: 1, msg: '방장이 아닙니다.'})
        if(host_id === $FIND.id || $FIND.name === name) return res.json({ code: 1, msg: '방장(본인)은 차단할 수 없습니다.'})
    }
    if(checkAdmin($FIND.level)) return res.json({ code: 1, msg: '관리자는 차단할 수 없습니다.'})
    try {
        await transaction(async (conn)=>{
            const $SQL_BLOCK = `SELECT blocked FROM chat WHERE room=?;`;
            const $BLOCK = await pooling(conn, $SQL_BLOCK, [room], req.originalUrl)
            const { blocked } = $BLOCK[0];
            const $BLOCK_LIST = blocked ? blocked.split(',') : [];
            if($BLOCK_LIST.length > $CHAT_COUNT.block) return res.json({code:1, msg:'차단 목록이 가득 찼습니다.'})
            const $INPUT = $FIND.id ? [ $FIND.id, $FIND.ip ] : [ $FIND.ip ]
            const $FILTER = $INPUT.filter((e)=> !$BLOCK_LIST.includes(e))
            if($FILTER.length){
                const $SQL_UPDATE = `UPDATE chat SET blocked=? WHERE room=?;`;
                await pooling(conn, $SQL_UPDATE, [$BLOCK_LIST.concat($FILTER).join(','), room], req.originalUrl)
            }
            res.json({code:0, msg: '차단하였습니다.'})
        })
    } catch (error) {
        return res.json({code: 2, msg: `차단 등록 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    }
    
})
app.post('/room/delete', async (req, res)=>{
    const { room } = req.body;
    const $SQL_DELETE = `DELETE FROM chat WHERE room=?;`;
    const $DELETE = await pool($SQL_DELETE, [room], req.originalUrl)
    if($DELETE.code) return res.json({code: 2, msg: `대화방 삭제 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({ code: 0, msg: '채팅방이 삭제되었습니다.' })
})

module.exports = app;