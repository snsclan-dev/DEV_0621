const express = require('express');
const app = express.Router();

const $PATH = require.main.path;
const { dateFormat } = require(`${$PATH}/config/system`);
const { pool } = require(`${$PATH}/config/mysql`)
const appInfo = require(`${$PATH}/modules/APP`);
const { checkNull } = require(`${$PATH}/modules/REGEX`);

app.get('/update/:params', async (req, res)=>{
    const { params } = req.params;
    if(params === 'info'){
        await appInfo()
        res.json({code: 0, msg: '앱 메뉴 업데이트 완료!'})
    }
})
app.get('/menu', async (req, res)=>{
    const $SQL_INFO = `SELECT * FROM app;`;
    const $INFO = await pool($SQL_INFO, [null], req.originalUrl)
    if($INFO.code) return res.json($INFO)
    res.json({code: 0, info: $INFO})
})
app.post('/menu/create', async (req, res)=>{
    const { num, app, app_type, app_name, menu, menu_name, category, category_name, note, level_create, level_read, depth, state } = checkNull(req.body);
    const $SQL_INSERT = `INSERT INTO app(num, app, app_type, app_name, menu, menu_name, category, category_name, note, level_create, level_read, depth, state) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    const $INSERT = await pool($SQL_INSERT, [num, app, app_type, app_name, menu, menu_name, category, category_name, note, level_create, level_read, depth, state], req.originalUrl)
    if($INSERT.code) return res.json({code: 2, msg: `메뉴 추가 오류\ntime : ${dateFormat()}\ncode : POOL`})
    await appInfo();
    res.json({code: 0, msg: '메뉴가 추가되었습니다.'})
})
app.post('/menu/modify', async (req, res)=>{
    const { select, num, app, app_type, app_name, menu, menu_name, category, category_name, note, level_create, level_read, depth, state } = checkNull(req.body);
    if(Number(num) === 0) return res.json({code: 1, msg: '0번 메뉴는 수정할 수 없습니다.'})
    const $SQL_UPDATE = `UPDATE app SET num=?, app=?, app_type=?, app_name=?, menu=?, menu_name=?, category=?, category_name=?, note=?, level_create=?, level_read=?, depth=?, state=? WHERE num=?;`;
    const $UPDATE = await pool($SQL_UPDATE, [num, app, app_type, app_name, menu, menu_name, category, category_name, note, level_create, level_read, depth, state, select], req.originalUrl)
    if($UPDATE.code) return res.json({code: 2, msg: `메뉴 수정 오류\ntime : ${dateFormat()}\ncode : POOL`})
    await appInfo();
    res.json({code: 0, msg: '메뉴가 수정되었습니다.'})
})
app.post('/menu/delete', async (req, res)=>{
    const { num } = req.body;
    if(Number(num) === 0) return res.json({code: 1, msg: '0번 메뉴는 삭제할 수 없습니다.'})
    const $SQL_DELETE = `DELETE FROM app WHERE num=?;`;
    const $DELETE = await pool($SQL_DELETE, [num], req.originalUrl)
    if($DELETE.code) return res.json({code: 2, msg: `메뉴 삭제 오류\ntime : ${dateFormat()}\ncode : POOL`})
    await appInfo();
    res.json({code: 0, msg: '메뉴가 삭제되었습니다.'})
})

module.exports = app;