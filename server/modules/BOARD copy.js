// server <=> client 확인
const fs = require('fs').promises;

const $PATH = require.main.path;
const $REDIS = require(`${$PATH}/config/redis`);
const { pool } = require(`${$PATH}/config/mysql`)
const { checkError } = require(`${$PATH}/config/system`);
const { $REGEX } = require(`${$PATH}/modules/REGEX`);
const { checkAdmin, checkManager } = require(`${$PATH}/modules/USER`);

const $APP_NAME = process.env.APP_NAME.toUpperCase()
// APP_TYPE: menu, notice, private_board, private_comment, image, auction
const $BOARD_STATE = { '0_normal': 0, '1_notice': 1, '2_period': 2, '3_period_end': 3, '6_report': 6, '7_view': 7, '8_delete': 8, '9_delete_admin': 9, '10_delete_data': 10 }

const $BOARD_REPORT = 5;

const boardInfo = async (params)=>{
    const { app, menu, category } = params;
    const $APP_INFO = await $REDIS.GET(`${$APP_NAME}_INFO`);
    const $INFO = JSON.parse($APP_INFO).find((e)=>{ return e.app_type !== 'menu' && e.app === app && e.menu === menu && e.category === category });
    if(!$INFO) return [];
    return $INFO;
}
const boardLevel = (level)=>{ // level view
    if(checkAdmin(level)) return '';
    if(checkManager(level)) return `AND B.state <= ${$BOARD_STATE['6_report']}`;
    return `AND B.count_report < ${$BOARD_REPORT} AND B.state <= ${$BOARD_STATE['6_report']}`;
}
const boardSQL = (info, user)=>{ // MYSQL query WHERE
    const { app_type, level_read } = info, { login_id, user_level } = user;
    const $SQL = { type: '', level: '' }
    if(app_type === 'notice'){
        return { code: 0, data: checkAdmin(user_level) ? '' : ' AND B.state=0' } 
    }
    if(app_type === 'private_board'){
        $SQL.type = !checkManager(user_level) ? `AND B.user_id='${login_id}'` : '';
    }
    if(level_read > user_level) return { code: 1, msg: '등급 딸려!! 돌아가~'} // msg 수정
    $SQL.level = boardLevel(user_level)
    return { code: 0, data: `${$SQL.type} ${$SQL.level}` } 
}
const commentSQL = (app_type, user)=>{ // type: type_comment 타입 수정 대기
    const { login_id, user_level } = user;
    const $SQL = { type: '', level: '' }
    if(app_type === 'private_comment' || app_type === 'price'){
        $SQL.type = !checkManager(user_level) ? `AND (C.user_id='${login_id}' OR C.target_id='${login_id}')` : '';
        return { code: 0, data: `${$SQL.type} ${$SQL.level}` } 
    }
    return { code: 0, data: `${$SQL.type} ${$SQL.level}` } 
}
const boardHit = async (app, num, userId)=>{ // 조회수 > app: board table
    if(!userId) return;
    const $KEY = `${process.env.APP_NAME.toUpperCase()}_READ:${userId}`;
    const $CHECK_NUM = await $REDIS.SISMEMBER($KEY, num)
    if(!$CHECK_NUM){
        await $REDIS.SADD($KEY, num)
        const $CHECK_TTL = await $REDIS.TTL($KEY); // key 만료 시간 확인
        if($CHECK_TTL === -1){
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0); // 오늘 자정
            const $TIME = Math.floor((midnight.getTime()) / 1000);
            await $REDIS.EXPIREAT($KEY, $TIME);
        }
        const $SQL_UPDATE = `UPDATE ${app} SET count_hit=count_hit+1 WHERE num=?;`;
        await pool($SQL_UPDATE, [num]);
    }
}
const deleteImage = async (app, num)=>{ // board num
    try{
        const $SQL_NOTE = `SELECT image, note FROM ${app} WHERE num IN (${num});`;
        const $SQL = await pool($SQL_NOTE)
        if($SQL.code) throw new Error($SQL);
        if($SQL.length){
            const $IMAGE = [];
            for(const e of $SQL){
                if(e.image) $IMAGE.push(e.image)
                const $NOTE = e.note.match($REGEX.editor_image_save) || [];
                for(const f of $NOTE){
                    $IMAGE.push(f.replace($REGEX.editor_image_save, '$1'))
                }
            }
            for(const e of $IMAGE){
                await fs.access(e).then(()=>{ return fs.unlink(e) }).catch((err)=>{ return checkError(err, 'modules/BOARD.js, deleteImage > fs') })
            }
        }
    }catch(err){
        checkError(err, 'modules/BOARD.js, deleteImage > $SQL')
    }
}

module.exports = { $BOARD_STATE, $BOARD_REPORT, boardInfo, boardLevel, boardSQL, commentSQL, boardHit, deleteImage }