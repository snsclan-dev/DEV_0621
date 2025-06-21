const $PATH = require.main.path;
const { pool } = require(`${$PATH}/config/mysql`);

// socket router
const socket_messenger = (IO)=>{
    IO.on("connection", (socket) => {
        socket.on('MESSENGER_CHECK', async ({ id })=>{ // STORE > 새로운 메세지(메신저) 확인
            const $SQL_COUNT = `SELECT COUNT(*) AS count FROM messenger WHERE target_id=? AND state=0`;
            const $COUNT = await pool($SQL_COUNT, [id], 'socket: MESSENGER_CHECK');
            if($COUNT.code) return socket.emit('MESSENGER_NOTICE', { code: 2, msg: '메신저 오류\ncode : MESSENGER_CHECK' })
            IO.to(id).emit('MESSENGER_NOTICE', { code: 0, count: $COUNT[0].count ? true : false, msg: $COUNT[0].count ? '새로운 메세지가 도착했습니다.' : false })
        })
        socket.on('MESSENGER_JOIN', async ({ id })=>{ // MESSENGER ROOM > 메세지 읽음 업데이트
            IO.to(id).emit('MESSENGER_NOTICE', { code: 0, count: false })
        })
        socket.on('MESSENGER_WRITE', async ({ target_id })=>{
            IO.to(target_id).emit('MESSENGER_NOTICE', { code: 0, count: true, msg: '새로운 메세지가 도착했습니다.' })
            IO.to(target_id).emit('MESSENGER_ROOM', { code: 0 })
        })
    })
}

module.exports = socket_messenger;