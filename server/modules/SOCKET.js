const $PATH = require.main.path;
const $REDIS = require(`${$PATH}/config/redis`);
const $REDIS_USER = `${process.env.APP_NAME.toUpperCase()}_USER`;

// status 0: 대기, 1: 방장(온라인), 2: 채팅(참여자)
const SOCKET_CREATE = async ({ socket, id, name, level, ip })=>{ // store
    try{
        await $REDIS.HSET($REDIS_USER, socket, JSON.stringify({socket, id, name, level, room: '', status: 0, ip}))
        return { code: 0 }
    }catch(err){
        return { code: 1 }
    }
}
const SOCKET_FIND = async (socketId) => {
    const $USER = await $REDIS.HGET($REDIS_USER, socketId);
    return $USER ? JSON.parse($USER) : null;
};
const SOCKET_LIST = async () => {
    const $LIST = await $REDIS.HVALS($REDIS_USER);
    return $LIST.map((e)=> JSON.parse(e));
};
const SOCKET_UPDATE = async ({socket, obj})=>{
    const $FIND = await SOCKET_FIND(socket)
    if($FIND){
        const $UPDATE = { ...$FIND, ...obj }
        await $REDIS.HSET($REDIS_USER, socket, JSON.stringify($UPDATE))
    }
}
const SOCKET_DELETE = async (socketId)=>{
    await $REDIS.HDEL($REDIS_USER, socketId)
}
const SOCKET_RESET = async (IO)=>{
    const $SOCKET = []
    const $SIDS = IO.sockets.adapter.sids
    $SIDS.forEach((e, value)=> $SOCKET.push(value));
    const $LIST = await $REDIS.HGETALL($REDIS_USER)
    const $DELETE = Object.keys($LIST).filter((e)=> !$SOCKET.includes(e))
    $DELETE.forEach((e) => { SOCKET_DELETE(e) })
    console.log('Socket Reset!');
}
const SOCKET_ROOM_USER = async (room)=>{ // room join count
    const $LIST = await SOCKET_LIST();
    const $HOST = $LIST.reduce((count, e)=>{ return (e.room === room && e.status === 1) ? count + 1 : count }, 0);
    const $USER = $LIST.reduce((count, e)=>{ return (e.room === room && e.status === 2) ? count + 1 : count }, 0);
    return { host: $HOST, user: $USER + 1 }  // 방장 자리 확보
}

module.exports = { SOCKET_CREATE, SOCKET_FIND, SOCKET_LIST, SOCKET_UPDATE, SOCKET_DELETE, SOCKET_RESET, SOCKET_ROOM_USER }