const express = require('express');
const app = express.Router();
const crypto = require('crypto-js');

const $PATH = require.main.path;
const { checkError, checkToken, dateFormat } = require(`${$PATH}/config/system`);
const { pool, pooling, transaction } = require(`${$PATH}/config/mysql`)
const { mailer, pagination } = require(`${$PATH}/modules`);
const { checkNull, checkInput, checkImage } = require(`${$PATH}/modules/REGEX`);
const { $USER_STATE, checkAdmin } = require(`${$PATH}/modules/USER`);
const { editorCheck } = require(`${$PATH}/modules/EDITOR`);

// /admin/user
app.use(checkToken, (req, res, next)=>{
    const { login_id, user_level } = req.user;
    if(!login_id) return res.json({code:3, msg:'로그인이 필요합니다.'});
    if(!checkAdmin(user_level)) return res.json({code:3, msg:'운영자가 아닙니다.'})
    next();
})
app.post('/search', async (req, res)=>{
    const { search, page } = req.body;
    try{
        await transaction(async (conn)=>{
            const $SQL_VIEW = `U.id LIKE ? OR email LIKE ? OR name LIKE ? OR name_history LIKE ? OR level LIKE ? OR login_ip LIKE ? OR 
                I.group_list LIKE ? OR I.group_name LIKE ? OR I.user_position LIKE ? OR I.user_title LIKE ? OR I.user_tag LIKE ?`;
            const $SQL_COUNT = `SELECT COUNT(num) AS count FROM user AS U LEFT JOIN user_info AS I ON U.id = I.id WHERE ${$SQL_VIEW};`;
            const $VALUES = Array(11).fill(`%${search}%`);
            const $COUNT = await pooling(conn, $SQL_COUNT, $VALUES, req.originalUrl)
            const $PAGING = pagination($COUNT[0].count, page, 5, 10);
            const $SQL_USER = `SELECT U.num, U.id, U.email, U.level, U.name, U.name_history, U.name_updated, U.blocked, U.state, U.updated, U.created, U.login_ip, I.*
                FROM user AS U LEFT JOIN user_info AS I ON U.id = I.id WHERE ${$SQL_VIEW} ORDER BY level DESC LIMIT ${$PAGING.viewList} OFFSET ${$PAGING.offset};`;
            const $USER = await pooling(conn, $SQL_USER, $VALUES, req.originalUrl)
            res.json({code:0, list: $USER, paging: $PAGING})
        })
    }catch(err){
        checkError(err, `/admin/admin_user.js, /search`);
        return res.json({code: 2, msg: `회원 검색 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    }
})
app.post('/modify/profile', async (req, res)=>{
    const { id, target_image, image } = req.body;
    const $IMAGE = await checkImage('profile', image, target_image)
    if($IMAGE.code) return res.json($IMAGE)
    const $SQL_UPDATE = `UPDATE user_info SET image=? WHERE id=?;`;
    const $UPDATE = await pool($SQL_UPDATE, [$IMAGE.data, id], req.originalUrl)
    if($UPDATE.code) return res.json({code: 2, msg: `프로필 이미지 등록(수정) 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code:0, msg: '프로필 이미지를 등록(수정)했습니다.'})
})
app.post('/modify/memo', async (req, res)=>{
    const { id, editor, target_note } = req.body;
    const $EDITOR = await editorCheck({type: 'user', folder: 'user', input: editor, save: target_note, id: id});
    if($EDITOR.code) return res.json($EDITOR);
    const $SQL_UPDATE = `UPDATE user_info SET note=? WHERE id=?;`;
    const $UPDATE = await pool($SQL_UPDATE, [$EDITOR.data, id], req.originalUrl)
    if($UPDATE.code) return res.json({code: 2, msg: `관리자 메모 등록(수정) 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code:0, msg: '관리자 메모를 등록(수정)했습니다.'})
})
app.post('/modify/email', async (req, res)=>{
    const { id, email } = req.body;
    try{
        await transaction(async (conn)=>{
            const $SQL_FIND = `SELECT pass_salt FROM user WHERE id=?;`;
            const $FIND = await pooling(conn, $SQL_FIND, [id], req.originalUrl);
            const { pass_salt } = $FIND[0];
            const $SQL_UPDATE = `UPDATE user SET email=?, state=1 WHERE id=?;`;
            await pooling(conn, $SQL_UPDATE, [email, id], req.originalUrl);
            const $MAILER = await mailer(id, email, pass_salt)
            if($MAILER.code) return res.json($MAILER)
            res.json({code: 0, msg: '이메일을 발송했습니다.'})
        })
    }catch(err){
        checkError(err, `/admin/admin_user.js, /modify/email`);
        return res.json({code: 2, msg: `이메일 발송 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    }
})
app.post('/modify/name', async (req, res)=>{
    const { id, name } = req.body;
    const $CHECK = checkInput(name);
    if($CHECK.code) return res.json($CHECK)
    const $SQL_NAME = `UPDATE user SET name=? WHERE id=?;`;
    const $NAME = await pool($SQL_NAME, [name, id]);
    if($NAME.code) return res.json({code: 2, msg: `별명 수정 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code:0, msg:'별명 수정 완료.'});
})
app.post('/modify/pass', async (req, res)=>{
    const { id, code, pass } = req.body;
    const pass_salt = crypto.lib.WordArray.random(16).toString();
    const pass_code = crypto.PBKDF2(code, pass_salt, { keySize: process.env.CRYPTO_KEYSIZE, iterations: process.env.CRYPTO_ITERATIONS }).toString();
    const hashPass = crypto.PBKDF2(pass, pass_salt, { keySize: process.env.CRYPTO_KEYSIZE, iterations: process.env.CRYPTO_ITERATIONS }).toString();
    const $SQL_PASS = `UPDATE user SET pass_salt=?, pass=?, pass_code=? WHERE id=?;`;
    const $PASS = await pool($SQL_PASS, [pass_salt, hashPass, pass_code, id], req.originalUrl)
    if($PASS.code) return res.json({code: 2, msg: `비밀(인증)번호 수정 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code:0, msg:'비밀(인증)번호 수정 완료.'});
})
app.post('/modify/level', async (req, res)=>{
    const { id, level } = req.body;
    const $SQL_LEVEL = `UPDATE user SET level=? WHERE id=?;`;
    const $LEVEL = await pool($SQL_LEVEL, [Number(level), id], req.originalUrl)
    if($LEVEL.code) return res.json({code: 2, msg: `등급(레벨) 수정 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code:0, msg: '등급(레벨) 수정 완료.'})
})
app.post('/modify/group', async (req, res)=>{
    const { id } = req.body, { group_list, group_name, group_level } = checkNull(req.body)
    const $SQL_GROUP = `UPDATE user_info SET group_list=?, group_name=?, group_level=? WHERE id=?;`;
    const $GROUP = await pool($SQL_GROUP, [group_list, group_name, Number(group_level), id], req.originalUrl)
    if($GROUP.code) return res.json({code: 2, msg: `그룹 수정 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code:0, msg: '그룹 수정 완료.'})
})
app.post('/modify/tag', async (req, res)=>{
    const { id } = req.body, { user_position, user_title, user_tag } = checkNull(req.body)
    const $SQL_TAG = `UPDATE user_info SET user_position=?, user_title=?, user_tag=? WHERE id=?;`;
    const $TAG = await pool($SQL_TAG, [user_position, user_title, user_tag, id], req.originalUrl)
    if($TAG.code) return res.json({code: 2, msg: `태그 수정 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code:0, msg: '태그 수정 완료.'})
})
app.post('/modify/state', async (req, res)=>{
    const { target_id, state } = req.body;
    const $SQL_UPDATE = `UPDATE user SET state=? WHERE id=?;`;
    const $UPDATE = await pool($SQL_UPDATE, [state, target_id])
    if($UPDATE.code) return res.json({code: 2, msg: `회원 상태 수정 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code:0, msg: '회원 상태 수정 완료.'})
})
app.get('/block/list/:page', async (req, res)=>{
    const { page } = req.params;
    try{
        await transaction(async (conn)=>{
            const $SQL_COUNT = `SELECT COUNT(num) AS count FROM user WHERE blocked IS NOT NULL OR state=?;`;
            const $COUNT = await pooling(conn, $SQL_COUNT, [$USER_STATE['7_block']], req.originalUrl)
            const $PAGING = pagination($COUNT[0].count, page, 20, 10);
            const $SQL_LIST = `SELECT * FROM user WHERE blocked IS NOT NULL OR state=? LIMIT ${$PAGING.viewList} OFFSET ${$PAGING.offset};`;
            const $LIST = await pooling(conn, $SQL_LIST, [$USER_STATE['7_block']], req.originalUrl)
            res.json({ code: 0, list: $LIST, paging: $PAGING })
        })
    }catch(err){
        checkError(err, `/admin/admin_user.js, /block/list`);
        return res.json({code: 2, msg: `차단 목록 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    }
})
app.post('/block/period', async (req, res)=>{
    const { target_id, period } = req.body;
    const $SQL_BLOCK = `UPDATE user SET blocked=DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL ? DAY), '%Y-%m-%d 00:00:00') WHERE id=?;`;
    const $BLOCK = await pool($SQL_BLOCK, [Number(period) === 0 ? null : Number(period) + 1, target_id], req.originalUrl)
    if($BLOCK.code) return res.json({code: 2, msg: `회원 차단(수정) 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code:0, msg: '회원 차단(수정) 완료.'})
})

module.exports = app;