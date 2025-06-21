const $PATH = require.main.path;
const $REDIS = require(`${$PATH}/config/redis`);

const $APP_NAME = process.env.APP_NAME.toUpperCase()
const $CHAT_COUNT = { create: 2, block: 100 }
const $CHAT_ROOM_TYPE = { '1_public': 1, '2_user': 2, '3_secret': 3, '7_view': 7 }

const chatList = (mysql, redis)=>{
    return mysql.map((e)=>{ 
        const $HOST = redis.filter((r)=> r.room === e.room && r.status === 1)
        const $NOW = redis.filter((r)=> r.room === e.room && r.status > 0)
        return { ...e, status: $HOST.length ? 1 : 0, room_now: $NOW.length }
    })
}
const chatInfo = async ({menu, category, level})=>{ // check level
    const $APP_INFO = await $REDIS.GET(`${$APP_NAME}_INFO`);
    const $INFO = JSON.parse($APP_INFO).find((e)=>{ return e.app_type !== 'menu' && e.app === 'chat' && e.menu === menu && e.category === category });
    if(!$INFO) return { code: 1, msg: '채팅 오류가 발생했습니다.' }
    if($INFO.level_read > level) return { code: 1, msg: `[ ${$INFO.level_create} ] 등급 이상 이용이 가능합니다.\n나의 등급 [ ${level} ]`} // 멘트 수정
    return { code: 0 };
}

module.exports = { $CHAT_COUNT, $CHAT_ROOM_TYPE, chatInfo, chatList }