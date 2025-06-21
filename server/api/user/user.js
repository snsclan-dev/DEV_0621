const express = require('express');
const app = express.Router();
const crypto = require('crypto-js');
const jwt = require('jsonwebtoken');

const $PATH = require.main.path;
const { transaction, pooling, pool } = require(`${$PATH}/config/mysql`)
const { checkError } = require(`${$PATH}/config/system`);
const { checkInput } = require(`${$PATH}/modules/REGEX`);
const { userUpdate } = require(`${$PATH}/modules/USER`);

// /user
// User_Profile
app.use((req, res, next)=>{
    const { login_id } = req.user
    if(!login_id) return res.json({code:1, msg:'로그인이 필요합니다.'});
    next()
})
app.post('/profile', async (req, res)=>{
    const { login_id } = req.user, { target_id } = req.body;
    const $SQL_USER = `SELECT U.num, U.id, U.name, U.level, U.blocked, U.state, U.updated, U.created, U.login_ip, 
        I.location, I.image, I.note, I.group_list, I.group_name, I.group_level, I.user_position, I.user_title, I.user_tag FROM user AS U LEFT JOIN user_info AS I ON U.id = I.id WHERE U.id=?;`;
    const $USER = await pool($SQL_USER, [target_id]);
    if($USER.code) return res.json($USER)
    if(!$USER.length) return res.json({code:1})
    const $SQL_MEMO = `SELECT memo FROM user_memo WHERE target_id=? AND user_id=?;`;
    const $MEMO = await pool($SQL_MEMO, [target_id, login_id])
    if($MEMO.code) return res.json($MEMO)
    const $IP = $USER[0].login_ip ? $USER[0].login_ip.split(',').shift() : null;
    res.json({code: 0, user: { ...$USER[0], memo: $MEMO.length ? $MEMO[0].memo : null, login_ip: $IP } })
})
app.post('/profile/memo', async (req, res)=>{ // User_Profile > memo
    const { login_id } = req.user, $CHECK = checkInput(req.body)
    if($CHECK.code) return res.json($CHECK);
    const { target_id, memo } = $CHECK;
    try{
        await transaction(async (conn)=>{
            const $SQL_CHECK = `SELECT COUNT(*) AS count FROM user_memo WHERE target_id=? AND user_id=?;`;
            const $CHECK = await pooling(conn, $SQL_CHECK, [target_id, login_id]);
            if($CHECK.code) return res.json($CHECK)
            if($CHECK[0].count){
                if(!memo){
                    const $SQL_MEMO = `DELETE FROM user_memo WHERE target_id=? AND user_id=?;`;
                    const $MEMO = await pooling(conn, $SQL_MEMO, [target_id, login_id])
                    if($MEMO.code) return res.json($MEMO)
                    return res.json({code: 0, msg: '메모를 삭제하였습니다.' })
                }
                const $SQL_UPDATE = `UPDATE user_memo SET memo=? WHERE target_id=? AND user_id=?;`;
                const $UPDATE = await pooling(conn, $SQL_UPDATE, [memo, target_id, login_id]);
                if($UPDATE.code) return res.json($UPDATE)
            }else{
                if(!memo) return res.json({code: 0, msg: '메모를 입력해 주세요.' })
                const $SQL_INSERT = `INSERT INTO user_memo(memo, target_id, user_id) VALUES(?, ?, ?);`;
                const $INSERT = await pooling(conn, $SQL_INSERT, [memo, target_id, login_id]);
                if($INSERT.code) return res.json($INSERT)
            }
            const $USER_UPDATE = await userUpdate(login_id)
            if($USER_UPDATE.code) return res.json($USER_UPDATE)
            res.json({code: 0, msg: '메모를 저장하였습니다.' })
        })
    }catch(err){
        checkError(err, `/app/app.js, /user/memo`);
        return res.json({code: 2, msg: '회원 메모 저장 오류가 발생했습니다.'})
    }
})
// pzzdb -------------------------------
app.post('/info', async (req, res)=> { // User_Modify
    const { login_id } = req.user, { user_id } = req.body;
    if(!login_id || login_id !== user_id) return res.json({code:1, msg:'로그인이 필요합니다.'});
    const $SQL_INFO = `SELECT U.id, email, name, name_history, name_updated, level, logined, updated, created, I.messenger FROM user AS U LEFT JOIN user_info AS I ON U.id = I.id WHERE U.id=?;`;
    const $INFO = await pool($SQL_INFO, [login_id])
    if($INFO.code) return res.json($INFO)
    if(!$INFO[0].logined) return res.json({code:1, msg:'로그인이 필요합니다.'});
    res.json({ code: 0, user: $INFO[0] });
})
app.post('/modify/name', async (req, res)=> {
    const { login_id, user_ip } = req.user, { user_name } = req.body;
    const $CHECK = checkInput({ name: user_name });
    if($CHECK.code) return res.json($CHECK)
    try{
        await transaction(async (conn)=>{
            const $SQL_USER = `SELECT DATE_ADD(name_updated, INTERVAL 7 DAY) AS modify, DATE_ADD(name_updated, INTERVAL 7 DAY) < NOW() AS now, id, logined, name, name_history, name_updated FROM user WHERE id=?;`;
            const $USER = await pooling(conn, $SQL_USER, [login_id], req.originalUrl)
            const { name, modify, now, logined, name_history, name_updated } = $USER[0];
            if(!$USER.length || !logined) return res.json({code:1, msg:'로그인이 필요합니다.'});
            const $HISTORY = name_history ? name_history.split(',') : [];
            if(user_name !== name){
                if(name_updated && !now) return res.json({code: 1, msg: `별명은 ${modify} 이후에 수정이 가능합니다.`})
                if($HISTORY.length >= 5) $HISTORY.pop()
                $HISTORY.unshift(user_name)
                const $SQL_UPDATE = `UPDATE user SET name=?, name_history=? WHERE id=?;`;
                await pooling(conn, $SQL_UPDATE, [user_name, $HISTORY.join(), login_id], req.originalUrl)
                const token = jwt.sign({ login_id: login_id, user_ip: user_ip, user_name: user_name, user_level: user_level }, process.env.JWT_KEY, { algorithm:"HS512", expiresIn: '1d' });
                res.cookie(process.env.APP_NAME, token, {
                    maxAge: 1 * 24 * 60 * 60 * 1000, // 1day
                    httpOnly: process.env.NODE_ENV === 'production', secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : false
                });
            }
            res.json({code: 0, msg:'별명을 수정하였습니다.'});
        })
    }catch(err){
        checkError(err, '/main/main.js, /user/modify/name')
        return res.json({code: 2, msg: '별명 수정 오류가 발생했습니다.'})
    }
})
// ------------------------------- pzzdb
app.post('/messenger', async (req, res)=> {
    const { login_id } = req.user, { messenger } = req.body;
    const $SQL_MESSENGER = `UPDATE user_info SET messenger=? WHERE id=?;`;
    const $MESSENGER = await pool($SQL_MESSENGER, [messenger, login_id], req.originalUrl)
    if($MESSENGER.code) return res.json($MESSENGER)
    res.json({code: 0, msg: '메신저 정보를 수정하였습니다.'});
})
app.post('/modify/pass', async (req, res)=> {
    const { login_id } = req.user, { passCode, pass, passCheck } = req.body;
    const $CHECK = checkInput({ passCode, passConfirm: pass === passCheck});
    if($CHECK.code) return res.json($CHECK)
    const pass_salt = crypto.lib.WordArray.random(16).toString();
    const pass_code = crypto.PBKDF2(passCode, pass_salt, { keySize: process.env.CRYPTO_KEYSIZE, iterations: process.env.CRYPTO_ITERATIONS }).toString();
    const hashPass = crypto.PBKDF2(pass, pass_salt, { keySize: process.env.CRYPTO_KEYSIZE, iterations: process.env.CRYPTO_ITERATIONS }).toString();
    const $SQL_PASS = `UPDATE user SET pass_salt=?, pass=?, pass_code=? WHERE id=?;`;
    const $PASS = await pool($SQL_PASS, [pass_salt, hashPass, pass_code, login_id], req.originalUrl)
    if($PASS.code) return res.json({code: 2, msg: `비밀(인증)번호 수정 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code:0, msg:'비밀(인증)번호 수정 완료.'});
})

module.exports = app;