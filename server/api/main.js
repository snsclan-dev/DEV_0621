const express = require('express');
const app = express.Router();
const crypto = require('crypto-js');
const jwt = require('jsonwebtoken');

const $PATH = require.main.path;
const { transaction, pooling, pool } = require(`${$PATH}/config/mysql`)
const { checkIp, dateFormat } = require(`${$PATH}/config/system`);
const { mailer, telegram } = require(`${$PATH}/modules`);
const { checkInput } = require(`${$PATH}/modules/REGEX`);
const { $USER_STATE, checkManager } = require(`${$PATH}/modules/USER`);

app.get('/email/:id/:code', async (req, res)=>{ // auth: register email
    const { id, code } = req.params;
    if(/[^\w]/.test(id) || /[^\w]/.test(code)) return res.json({code: 1, msg: '올바르지 않은 경로입니다.'})
    const $SQL_CHECK = `SELECT pass_salt, state FROM user WHERE id=?;`;
    const $CHECK = await pool($SQL_CHECK, [id], req.originalUrl)
    if($CHECK.code) return res.json({code: 2, msg: `이메일 인증 오류\ntime : ${dateFormat()}\ncode : POOL`})
    const { pass_salt, state } = $CHECK[0];
    if(!$CHECK.length) return res.json({code: 1, msg: '올바르지 않은 접근입니다.'})
    if(state !== 1) return res.json({code: 1, msg: '올바르지 않은 접근입니다.'})
    if(pass_salt !== code) return res.json({code: 1, msg: '이메일 인증이 실패하였습니다.'});
    const $SQL_UPDATE = `UPDATE user SET state=0 WHERE id=?;`;
    const $UPDATE = await pool($SQL_UPDATE, [id], req.originalUrl)
    if($UPDATE.code) return res.json({code: 2, msg: `이메일 인증 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code: 0, msg: '이메일 인증 성공!'})
})
app.get('/guest', async (req, res)=>{ // check guest ip
    const $SQL_CHECK = `SELECT ip FROM block_ip WHERE ip=?;`;
    const $CHECK = await pool($SQL_CHECK, [checkIp(req)], req.originalUrl)
    if($CHECK.code) return res.json({code: 2, msg: `손님 로그인 오류!\ntime : ${dateFormat()}\ncode : POOL`})
    if($CHECK.length) return res.json({code: 1, msg: `손님 로그인 실패!\n관리자에게 문의해 주세요!`})
    res.json({ code: 0, msg: '손님 로그인 성공!' })
})
app.post('/login', async (req, res)=>{
    const { input_id, input_pass } = req.body;
    const $CHECK = checkInput({ id: input_id, pass: input_pass })
    if($CHECK.code) return res.json($CHECK)
    try{
        await transaction(async (conn)=>{
            const $SQL = `SELECT id, name, level, pass, pass_salt, blocked, state, login_ip FROM user WHERE id=?;`;
            const $LOGIN = await pooling(conn, $SQL, [input_id], req.originalUrl)
            if(!$LOGIN.length) return res.json({code:1, msg:'회원이 아니거나 아이디 또는 비밀번호가 틀립니다.'});
            if($LOGIN[0].state === $USER_STATE['1_wait']) return res.json({code:1, msg:'이메일 인증이 필요합니다.'});
            const { id, name, level, pass, pass_salt, blocked, state, login_ip } = $LOGIN[0];
            const hashPass = crypto.PBKDF2(input_pass, pass_salt, { keySize:process.env.CRYPTO_KEYSIZE, iterations:process.env.CRYPTO_ITERATIONS }).toString();
            if(hashPass === pass) {
                const $LOGIN_IP = login_ip ? login_ip.split(',') : [];
                const $CHECK_IP = $LOGIN_IP.some((e)=>{ return e === checkIp(req) })
                if(!$CHECK_IP){
                    if($LOGIN_IP.length >= 5) $LOGIN_IP.pop()
                    $LOGIN_IP.unshift(checkIp(req))
                }
                if(state >= $USER_STATE['8_delete']) return res.json({code:1, msg:'탈퇴 또는 강제 퇴출된 회원입니다.'});
                if(state === $USER_STATE['7_block']) return res.json({code:1, msg:'이용이 중지된 회원입니다.'});
                if(blocked){
                    if(blocked > dateFormat('YYYY-MM-DD HH:mm:ss')) return res.json({code:1, msg:`이용 규칙 위반으로 이용이 중지되었습니다.\n해제 : ${blocked}`});
                    await pooling(conn, 'UPDATE user SET blocked=NULL WHERE id=?;', [input_id], req.originalUrl)
                }
                const $SQL_UPDATE = `UPDATE user SET logined=1, updated=now(), login_ip=? WHERE id=?;`;
                await pooling(conn, $SQL_UPDATE, [$LOGIN_IP.join(), input_id], req.originalUrl)
                const token = jwt.sign({ login_id: id, user_name: name, user_level: level, user_ip: checkIp(req)}, process.env.JWT_KEY, { algorithm:"HS512", expiresIn: '1d' });
                res.cookie(process.env.APP_NAME, token, {
                    path: '/', maxAge: 10 * 24 * 60 * 60 * 1000, // 1day
                    httpOnly: process.env.NODE_ENV === 'production', secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : false
                });
                if(checkManager(level)) telegram({ msg: `[ 관리자 로그인 ]\n${name} ( ${id} )\n${checkIp(req)}` });
                res.json({code:0});
            }else{
                if(checkManager(level)) telegram({ msg: `[ 관리자 로그인 실패 ]\n${name} ( ${id} )\n${checkIp(req)}` });
                res.json({code:1, msg:'회원이 아니거나 아이디 또는 비밀번호가 틀립니다.'});
            }
        })
    }catch(err){
        // checkError(err, '회원 로그인 오류')
        if(!res.headersSent) return res.json({ code: 2, msg: `회원 로그인 오류\ntime : ${dateFormat()}\ncode : TRANSACTION` });
        // return res.json({code: 2, msg: `회원 로그인 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    }
})
app.post('/register', async (req, res)=>{
    const { pass, passCheck } = req.body;
    const $CHECK = checkInput({ ...req.body, passConfirm: pass === passCheck });
    if($CHECK.code) return res.json($CHECK)
    const { id, name, email, passCode } = $CHECK;
    try{
        await transaction(async (conn)=>{
            const $SQL_FIND = `SELECT id, name, email FROM user WHERE (id LIKE ? OR name LIKE ? OR email LIKE ? OR login_ip LIKE ?);`;
            const $FIND = await pooling(conn, $SQL_FIND, [id, name, email, checkIp(req)], req.originalUrl)
            if($FIND.length){
                if($FIND[0].id === id || $FIND[0].email === email) return res.json({code:1, msg:'이미 존재하는 아이디 또는 이메일입니다.'});
                if($FIND[0].name === name) return res.json({code:1, msg:'이미 사용중인 별명입니다.'});
            }
            const pass_salt = crypto.lib.WordArray.random(16).toString();
            const pass_code = crypto.PBKDF2(passCode, pass_salt, { keySize: process.env.CRYPTO_KEYSIZE, iterations: process.env.CRYPTO_ITERATIONS }).toString();
            const hashPass = crypto.PBKDF2(pass, pass_salt, { keySize: process.env.CRYPTO_KEYSIZE, iterations: process.env.CRYPTO_ITERATIONS }).toString();
            const $SQL_INSERT = `INSERT INTO user(id, email, name, pass, pass_salt, pass_code) VALUES(?, ?, ?, ?, ?, ?);`;
            await pooling(conn, $SQL_INSERT, [id, email, name, hashPass, pass_salt, pass_code], req.originalUrl)
            const $SQL_INSERT_INFO = `INSERT INTO user_info(id) VALUES(?);`;
            await pooling(conn, $SQL_INSERT_INFO, [id], req.originalUrl)
            if(process.env.NODE_ENV === 'production'){
                telegram({ msg: `[ 회원 가입 ]\n${name} ( ${id} )\n${email}` });
                mailer(id, email, pass_salt)
            }
            res.json({code:0, msg:'회원가입이 완료되었습니다.'});
        })
    }catch(err){
        // checkError(err, '회원 가입 오류')
        if(!res.headersSent) return res.json({ code: 2, msg: `회원 가입 오류\ntime : ${dateFormat()}\ncode : TRANSACTION` });
        // return res.json({code: 2, msg: `회원 가입 오류\ntime : ${dateFormat()}\ncode : TRANSACTION`})
    }
})
app.get('/logout', async (req, res)=> {
    const { login_id } = req.user;
    if(login_id){
        const $SQL_LOGOUT = `UPDATE user SET logined=0 WHERE id=?;`;
        const $LOGOUT = await pool($SQL_LOGOUT, [login_id], req.originalUrl)
        if($LOGOUT.code) return res.json({code: 2, msg: `회원 로그아웃 오류\ntime : ${dateFormat()}\ncode : POOL`})
    }
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.cookie(process.env.APP_NAME, '', { maxAge: 0 });
    res.clearCookie(process.env.APP_NAME);
    res.json({code: 0});
});
// PZZDB -----
app.get('/sitemap', async (req, res)=>{ // sitemap.xml
    const $SQL_SITEMAP = `SELECT num, menu, category FROM event ORDER BY created DESC;`;
    const $SITEMAP = await pool($SQL_SITEMAP, [null], req.originalUrl)
    if($SITEMAP.code) return res.json({code: 2, msg: `사이트 맵 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({code: 0, list: $SITEMAP})
})
// ===== PZZDB
module.exports = app;