const express = require('express');
const app = express.Router();
const crypto = require('crypto-js');

const $PATH = require.main.path;
const { checkIp } = require(`${$PATH}/config/system`);
const { pool } = require(`${$PATH}/config/mysql`)
const { checkInput } = require(`${$PATH}/modules/REGEX`);
const { userUpdate } = require(`${$PATH}/modules/USER`);

// /user/auth
app.use((req, res, next)=>{
    const { login_id, user_ip } = req.user
    if(!login_id) return res.json({code:1, msg:'로그인이 필요합니다.'});
    if(user_ip !== checkIp(req)) return res.json({code:3, msg:'로그인 환경이 변경되었습니다.\n다시 로그인해 주세요.'});
    next()
})
app.post('/code', async (req, res)=>{ // code 인증
    const { login_id } = req.user, { passCode } = req.body;
    const $CHECK = checkInput({ passCode: passCode })
    if($CHECK.code) return res.json($CHECK);
    const $SQL_CODE = `SELECT pass_salt, pass_code, logined FROM user WHERE id=?;`;
    const $CODE = await pool($SQL_CODE, [login_id], req.originalUrl)
    if($CODE.code) return res.json($CODE)
    const { pass_salt, pass_code, logined } = $CODE[0];
    if(!logined) return res.json({code:3, msg:'로그인 환경이 변경되었습니다.\n다시 로그인해 주세요.'});
    const hashCode = crypto.PBKDF2(passCode, pass_salt, {keySize:process.env.CRYPTO_KEYSIZE, iterations:process.env.CRYPTO_ITERATIONS}).toString();
    if(hashCode !== pass_code) return res.json({code:1, msg:'본인 인증 문자가 틀립니다.'});
    const $USER_UPDATE = await userUpdate(login_id)
    if($USER_UPDATE.code) return res.json($USER_UPDATE)
    res.json({ code: 0 })
})
// app.post('/pass', async (req, res)=>{ // pass 인증
//     const { login_id } = req.user, { input_pass } = req.body;
//     const $CHECK = checkInput({ pass: input_pass })
//     if($CHECK.code) return res.json($CHECK)
//     const $SQL_PASS = `SELECT pass, pass_salt, logined FROM user WHERE id=?;`;
//     const $PASS = await pool($SQL_PASS, [login_id], req.originalUrl)
//     if($PASS.code) return res.json($PASS)
//     const { pass, pass_salt, logined } = $PASS[0];
//     if(!logined) return res.json({code:3, msg:'로그인 환경이 변경되었습니다.\n다시 로그인해 주세요.'});
//     const hashPass = crypto.PBKDF2(input_pass, pass_salt, {keySize:process.env.CRYPTO_KEYSIZE, iterations:process.env.CRYPTO_ITERATIONS}).toString();
//     if(hashPass !== pass) return res.json({code: 1, msg: '비밀번호가 틀립니다.'})
//     res.json({ code: 0 })
// })

module.exports = app;