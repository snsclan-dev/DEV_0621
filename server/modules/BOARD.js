// server <=> client 확인
const fs = require('fs').promises;

const $PATH = require.main.path;
const $REDIS = require(`${$PATH}/config/redis`);
const { pool } = require(`${$PATH}/config/mysql`)
const { checkError } = require(`${$PATH}/config/system`);
const { $REGEX } = require(`${$PATH}/modules/REGEX`);
const { checkAdmin } = require(`${$PATH}/modules/USER`);

const $APP_NAME = process.env.APP_NAME.toUpperCase()
const $BOARD_STATE = { '0_normal': 0, '1_notice': 1, '2_period': 2, '3_period_end': 3, '6_report': 6, '7_view': 7, '8_delete': 8, '9_delete_admin': 9, '10_delete_data': 10 }
const $BOARD_WRITE = 20;
const $BOARD_REPORT = 5;

const boardInfo = async (params, user_level)=>{
    const { app, menu, category } = params;
    const $APP_INFO = await $REDIS.GET(`${$APP_NAME}_INFO`);
    const $INFO = JSON.parse($APP_INFO).find((e)=>{ return e.app_type !== 'menu' && e.app === app && e.menu === menu && e.category === category });
    if(!$INFO) return { code: 1, msg: '게시판 오류가 발생했습니다.' }
    if($INFO.level_read > user_level) return { code: 1, msg: `[ ${$INFO.level_read} ] 이상 이용이 가능합니다.\n나의 등급 [ ${user_level} ]`}
    return $INFO;
}
const boardView = (user_level)=>{
    return checkAdmin(user_level) ? '' : `AND B.state <= ${$BOARD_STATE['6_report']}`;
}
const boardWriteCount = async (info, userId)=>{ // 메뉴별(app) 하루 게시판 글(댓글)쓰기 제한
    const { app, app_name } = info;
    const $SQL_COUNT = `SELECT COUNT(*) AS count FROM ${app} WHERE user_id=? AND state < ${$BOARD_STATE['7_view']} AND DATE(created) = CURDATE();`;
    const $COUNT = await pool($SQL_COUNT, [userId], 'boardWriteCount()');
    if($COUNT.code) return { code: 1, msg: '게시물 작성 오류가 발생했습니다.' }
    if($COUNT[0].count >= $BOARD_WRITE) return { code: 1, msg: `[ ${app_name} / ${app.split('_')[1] ? '댓글' : '글'} ] 하루 최대 등록 ( ${$BOARD_WRITE}개 )` }
    return { code: 0 }
}
const boardHit = async (app, num, userId)=>{ // 조회수 > app: target board(table)
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

module.exports = { $BOARD_STATE, $BOARD_WRITE, $BOARD_REPORT, boardInfo, boardView, boardWriteCount, boardHit, deleteImage }