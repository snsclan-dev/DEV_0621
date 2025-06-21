const $PATH = require.main.path;
const { pool } = require(`${$PATH}/config/mysql`);
const { dateFormat } = require(`${$PATH}/config/system`);
const { SOCKET_LIST, SOCKET_UPDATE, SOCKET_FIND, SOCKET_ROOM_USER } = require(`${$PATH}/modules/SOCKET`);
const { chatList } = require(`${$PATH}/modules/CHAT`);

// dev
const socket_chat = (IO) => {
    IO.on("connection", (socket) => {
        socket.on('ROOM', async ({ num, room })=>{ // Chat_Room 대화방(대기실) 정보
            const $NUM = String(num)
            socket.join($NUM) // 대기실 참여
            socket.user = { ...socket.user, num: $NUM, room } // 세션 저장
            const $LIST = await SOCKET_LIST()
            const $USER = $LIST.filter((e)=> e.room === room && e.status > 0) // 대화방 참여자
            IO.to($NUM).emit('ROOM', { user: $USER })
        })
        socket.on('ROOM_MODIFY', async ({ num, room })=>{ // 대화방 수정
            const $SQL_ROOM = `SELECT C.*, U.name, U.level FROM chat AS C INNER JOIN user AS U ON C.user_id = U.id WHERE room=?;`;
            const $ROOM = await pool($SQL_ROOM, [room], 'socket: ROOM_MODIFY')
            if($ROOM.code) return socket.emit('ALERT', {code: 2, msg: `대화방 수정 오류\ntime : ${dateFormat()}\ncode : POOL`})
            const $LIST = await SOCKET_LIST()
            const $DATA = chatList($ROOM, $LIST)
            const $NUM = String(num)
            IO.to($NUM).emit(`ROOM_MODIFY`, { room: $DATA[0] })
            IO.to(room).emit(`ROOM_MODIFY`, { room: $DATA[0] })
        })
        socket.on('ROOM_DELETE', async ({ num, room })=>{
            IO.to(room).emit('USER_STATUS', { status: 'DELETE' })
            IO.socketsLeave(num); // 방 안의 모든 소켓을 방에서 나가기
            IO.socketsLeave(room);
            const $LIST = await SOCKET_LIST()
            const $USER = $LIST.filter((e)=> e.room === room)
            for (const e of $USER) {
                await SOCKET_UPDATE({ socket: e.socket, obj: { room: '', status: 0 } });
            }
        })

        socket.on('ROOM_JOIN_ADMIN', async ({ num, room })=>{ // 관리자 모니터링
            const $NUM = String(num)
            socket.leave($NUM)
            socket.join(room)
            socket.emit('ROOM_STATUS', { status: 'ADMIN', notice: `관리자 모니터링을 시작합니다.`})
        })
        socket.on('ROOM_ADMIN_LEAVE', ({ num, room }, cb)=>{
            const $NUM = String(num)
            socket.join($NUM)
            socket.leave(room)
            cb({code: 0})
        })
        socket.on('ROOM_JOIN_HOST', async ({ num, room, name }, cb)=>{ // 방장 입장 status: 1
            const $CHECK = await SOCKET_ROOM_USER(room)
            if($CHECK.host) return socket.emit('ALERT', { code: 1, msg: '대화방에 참여할 수 없습니다. (방장 중복)\n방장은 한명만 입장할 수 있습니다.' })
            const $SQL_UPDATE = `UPDATE chat SET updated=NOW() WHERE room=?;`;
            const $UPDATE = await pool($SQL_UPDATE, [room], 'socket: ROOM_JOIN_HOST')
            if($UPDATE.code) return socket.emit('ALERT', {code: 2, msg: `대화방 입장 오류\ntime : ${dateFormat()}\ncode : POOL`})
            await SOCKET_UPDATE({socket: socket.id, obj: { room, status: 1 }})
            const $NUM = String(num)
            socket.leave($NUM) // 대기실 나가기
            socket.join(room)
            IO.to(room).emit('ROOM_STATUS', { status: 'JOIN', notice: `[ ${name} ]님이 입장하였습니다.`})
            cb({ code: 0 })
        })
        socket.on('ROOM_JOIN_USER', async ({ num, room, name }, cb)=>{ // 유저 입장 status: 2
            const $SQL_ROOM = `SELECT room_max, blocked FROM chat WHERE room=?;`;
            const $ROOM = await pool($SQL_ROOM, [room], 'socket: ROOM_JOIN_USER')
            if($ROOM.code) return socket.emit('ALERT', {code: 2, msg: `대화방 정보 오류\ntime : ${dateFormat()}\ncode : POOL`})
            const { room_max, blocked } = $ROOM[0];
            if(!$ROOM.length) return socket.emit('ALERT', { code: 1, msg: '대화방 정보가 없습니다.' })
            const $BLOCK_LIST = blocked ? blocked.split(',') : [];
            if($BLOCK_LIST.length){
                const $USER = await SOCKET_FIND(socket.id)
                const $FIND = $BLOCK_LIST.some((e)=> e === $USER.id || e === $USER.ip)
                if($FIND) return socket.emit('ALERT', { code: 1, msg: '참여할 수 없는 채팅방입니다. (차단)' })
            }
            const $CHECK = await SOCKET_ROOM_USER(room)
            if(room_max <= $CHECK.user) return socket.emit('ALERT', { code: 1, msg: '대화방에 참여할 수 없습니다. (참여자 수)\n방장만 참여가 가능합니다.' })
            await SOCKET_UPDATE({socket: socket.id, obj: { room, status: 2 }})
            const $NUM = String(num)
            socket.leave($NUM) // 대기실 나가기
            socket.join(room)
            IO.to(room).emit('ROOM_STATUS', { status: 'JOIN', notice: `[ ${name} ]님이 입장하였습니다.`})
            cb({ code: 0 })
        })

        socket.on('ROOM_USER', async ({ num, room })=>{ // 대화방 참여자
            const $LIST = await SOCKET_LIST()
            const $USER = $LIST.filter((e)=> e.room === room && e.status > 0)
            if(num){
                const $NUM = String(num)
                IO.to($NUM).emit('ROOM_USER', { user: $USER })
            }
            IO.to(room).emit('ROOM_USER', { user: $USER })
        })
        socket.on('ROOM_LEAVE', async ({ room, name }, cb)=>{
            IO.to(room).emit(`ROOM_STATUS`, { status: 'LEAVE', notice: `[ ${name} ]님이 채팅방을 나갔습니다.` })
            socket.leave(room)
            await SOCKET_UPDATE({socket: socket.id, obj: { room: '', status: 0 }})
            cb({ code: 0, msg: '채팅방을 나갔습니다.' })
        })
    })
}

module.exports = socket_chat;