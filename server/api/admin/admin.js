const express = require('express');
const app = express.Router();
const path = require('path');
const fs = require('fs');

const $PATH = require.main.path;
const { checkToken, checkError, dateFormat } = require(`${$PATH}/config/system`);
const { pool } = require(`${$PATH}/config/mysql`)
const { pagination } = require(`${$PATH}/modules`);
const { checkAdmin } = require(`${$PATH}/modules/USER`);

app.use(checkToken, (req, res, next)=>{
    const { login_id, user_level } = req.user;
    if(!login_id) return res.json({code:3, msg:'로그인이 필요합니다.'});
    if(!checkAdmin(user_level)) return res.json({code:3, msg:'운영자가 아닙니다.'})
    next();
})
app.get('/monitor', async (req, res)=>{
    const $SQL_EVENT = `SELECT EVENT_NAME, EVENT_DEFINITION, STATUS FROM information_schema.events WHERE EVENT_SCHEMA=?;`;
    const $EVENT = await pool($SQL_EVENT, [process.env.APP_NAME], req.originalUrl)
    if($EVENT.code) return res.json({code: 2, msg: `모니터링 정보 오류\ntime : ${dateFormat()}\ncode : POOL`})
    const $SQL_USER = `SELECT SUM(CASE WHEN state = 0 THEN 1 ELSE 0 END) AS user, SUM(CASE WHEN state = 1 THEN 1 ELSE 0 END) AS wait, SUM(CASE WHEN blocked IS NOT NULL THEN 1 ELSE 0 END) AS blocked FROM user`;
    const $USER = await pool($SQL_USER, [null], req.originalUrl)
    if($USER.code) return res.json({code: 2, msg: `모니터링 정보 오류\ntime : ${dateFormat()}\ncode : POOL`})
    res.json({ code: 0, event: $EVENT, user: $USER[0] });
})
app.post('/log/list', (req, res)=>{
    try{
        const $PATH = path.join('/', process.env.FOLDER, process.env.APP_NAME, 'logs')
        fs.readdir($PATH, (err, file)=>{
            const list = file.filter((e)=>{ return /_server.log/g.test(e) })
            const sort = list.sort((a, b) => {
                if(a < b) return 1;
                if(a === b) return 0;
                if(a > b) return -1;
            }) || []
            res.json({code: 0, list: sort})
        })
    }catch(err){
        return checkError(err, `Url: ${req.originalUrl}`);
    }
})
app.post('/log/file', (req, res)=>{
    const { file } = req.body;
    const $PATH = path.join('/', process.env.FOLDER, process.env.APP_NAME, 'logs', file)
    try{
        if(!fs.existsSync($PATH)) return res.json({code: 1, log: '파일이 존재하지 않습니다.'})
        fs.readFile($PATH, 'utf-8', (err, data)=>{
            res.json({code: 0, log: data})
        })
    }catch(err){
        return checkError(err, `Url: ${req.originalUrl}`);
    }
})
app.post('/log/delete', (req, res)=>{
    const { file } = req.body;
    const $PATH = path.join('/', process.env.FOLDER, process.env.APP_NAME, 'logs', file)
    try{
        if(!fs.existsSync($PATH)) return res.json({code: 1, msg: '파일이 존재하지 않습니다.'})
        if(fs.existsSync($PATH)) fs.unlink($PATH, (err)=>{
            res.json({code: 0, msg: '로그 파일 삭제 완료.'})
        })
    }catch(err){
        return checkError(err, `Url: ${req.originalUrl}`);
    }
})
app.get('/folder', (req, res)=>{
    try{
        const $TEMP = path.join('/', process.env.FOLDER, process.env.APP_NAME, 'temp')
        if(!fs.existsSync($TEMP)) fs.mkdirSync($TEMP, { recursive: true });
        const $BOARD = path.join('/', process.env.FOLDER, process.env.APP_NAME, 'images/board')
        if(!fs.existsSync($BOARD)) fs.mkdirSync($BOARD, { recursive: true });
        const $CHAT = path.join('/', process.env.FOLDER, process.env.APP_NAME, 'images/chat')
        if(!fs.existsSync($CHAT)) fs.mkdirSync($CHAT, { recursive: true });
        const $FOLDER = { temp: fs.readdirSync($TEMP), board: fs.readdirSync($BOARD), chat: fs.readdirSync($CHAT) }
        res.json({code: 0, folder: $FOLDER})
    }catch(err){
        return checkError(err, `Url: ${req.originalUrl}`);
    }
})
app.post('/folder/list', (req, res)=>{
    const { folder, date } = req.body;
    const $USER = []
    try{
        const $path = path.join('/', process.env.FOLDER, process.env.APP_NAME, folder, date)
        fs.readdir($path, (err, list)=>{
            list.forEach((e)=>{ $USER.push(e.split('-')[1]?.replace(/.[^.]+$/gmi, '')) })
            const count = $USER.reduce((acc, cur) => {
                acc[cur] = (acc[cur] || 0) + 1
                return acc
            }, {})
            res.json({code: 0, total: list.length, count: count});
        })
    }catch(err){
        return checkError(err, `Url: ${req.originalUrl}`);
    }
})
app.post('/folder/image', (req, res)=>{
    const { folder, date, userId, page } = req.body;
    const $path = path.join('/', process.env.FOLDER, process.env.APP_NAME, folder, date)
    try{
        fs.readdir($path, (err, image)=>{
            const $ARR = [];
            image.forEach((e, i)=>{ $ARR.push({num: i, file: e}) })
            if(!userId){
                const paging = pagination(image.length, page, 50, 10);
                const $LIST = $ARR.slice(paging.offset, paging.viewList * page)
                return res.json({code: 0, image: $LIST, paging});
            }
            const $USER = $ARR.filter((e)=>{ return e.file.split('-')[1]?.replace(/.[^.]+$/gmi, '') === userId })
            const paging = pagination($USER.length, page, 50, 10);
            const $LIST = $USER.slice(paging.offset, paging.viewList * page)
            return res.json({code: 0, image: $LIST, paging});
        })
    }catch(err){
        return checkError(err, `Url: ${req.originalUrl}`);
    }
})
app.post('/folder/delete', (req, res)=>{
    const { folder, date, userId } = req.body;
    const $path = path.join('/', process.env.FOLDER, process.env.APP_NAME, folder, date)
    try{
        if(!userId){
            fs.rm($path, { recursive: true }, (err)=>{})
            return res.json({code: 0, msg: '폴더 삭제 완료.'})
        }
        fs.readdir($path, (err, list)=>{
            list.forEach((e)=>{
                if(e.split('-')[1]?.replace(/.[^.]+$/gmi, '') === userId) fs.unlinkSync(path.join($path, e))
            })
            return res.json({code: 0, msg: `${userId} 파일 삭제 완료.`})
        })
    }catch(err){
        return checkError(err, `Url: ${req.originalUrl}`);
    }
})

module.exports = app;