const $PATH = require.main.path;
const { $FILE_UPLOAD, checkIp, dateFormat } = require(`${$PATH}/config/system`);
const { pool } = require(`${$PATH}/config/mysql`);
const { pagination } = require(`${$PATH}/modules`);
const { checkAdmin } = require(`${$PATH}/modules/USER`);
const { SOCKET_LIST, SOCKET_FIND, SOCKET_UPDATE, SOCKET_CREATE, SOCKET_DELETE, SOCKET_RESET } = require(`${$PATH}/modules/SOCKET`);

// socket router
const socket = (IO)=>{
    IO.on("connection", (socket) => {
        socket.on('SOCKET_CREATE', async ({ id, name, level }, cb)=>{ // store: id, level
            const $CREATE = await SOCKET_CREATE({ socket: socket.id, id, name, level, ip: checkIp(socket.request) }) // socket.handshake.address
            socket.user = { id, name: name || null, level }
            if(id){
                if(checkAdmin(level)) socket.join('admin') // admin room
                socket.join(id) // messenger room
            }
            IO.to('admin').emit('SOCKET_NOW', { socket: IO.sockets.sockets.size || 0 })
            cb($CREATE)
        })
        socket.on('USER_LOCATION', async ({ id, location })=>{ // location update
            if(id){
                const $SQL_LOCATION = `UPDATE user_info SET location=? WHERE id=?;`;
                await pool($SQL_LOCATION, [location, id], 'socket: SOCKET_LOCATION')
            }
        })
        socket.on('SOCKET_LOCATION', async ({ location })=>{ // location update
            await SOCKET_UPDATE({socket: socket.id, obj: { location: location ? location : null }})
            const { num, room } = socket.user;
            if(room || num){
                const $LIST = await SOCKET_LIST()
                const $USER = $LIST.filter((e)=> e.room === room && e.status > 0)
                if(room) return IO.to(room).emit('ROOM_USER', { user: $USER })
                if(num) IO.to(num).emit('ROOM_USER', { user: $USER })
            }
        })
        socket.on('USER_NAME', async ({ name, user }, cb)=>{ // user: check login
            // console.log('USER_NAME :', name, user); ///
            if(!user){ // login user
                const $LIST = await SOCKET_LIST()
                const $FIND = $LIST.find((e)=> e.name === name)
                if($FIND) return cb({ code: 1, msg: '이미 사용중인 대화명입니다.'})
                const $SQL_CHECK = `SELECT name FROM user WHERE name=?;`;
                const $CHECK = await pool($SQL_CHECK, [name], 'socket: USER_NAME')
                if($CHECK.code) return cb({ code: 1, msg: `대화명 입력 오류\ntime : ${dateFormat()}\ncode : POOL` })
                if($CHECK.length) return cb({ code: 1, msg: '이미 등록된 대화명입니다.' })
                await SOCKET_UPDATE({socket: socket.id, obj: { name }})
            }
            cb({code: 0})
        })
        socket.on('USER_LEAVE', async ()=>{ // 접속 종료
            const $FIND = await SOCKET_FIND(socket.id)
            if($FIND){
                const { room, name, status } = $FIND;
                if(room && status > 0) IO.to($FIND.room).emit('ROOM_STATUS', { status: 'LEAVE', notice: `[ ${name} ]님이 접속을 종료하였습니다.` })
                socket.leave(room)
            }
            await SOCKET_UPDATE({socket: socket.id, obj: { room: '', status: 0 }})
        })
        socket.on('USER_BLOCK', async ({ room, target_socket, target_name })=>{
            socket.to(target_socket).emit('USER_STATUS', { status: 'BLOCK' })
            IO.in(target_socket).socketsLeave(room);
            await SOCKET_UPDATE({ socket: target_socket, obj: { room: '', status: 0 } })
            IO.to(room).emit('ROOM_STATUS', { status: 'BLOCK', notice: `[ ${target_name} ]님을 차단하였습니다. (내보내기)` })
        })
        socket.on('CHAT_MESSAGE', async ({ message })=>{
            const $USER = await SOCKET_FIND(socket.id)
            if(!$USER) return socket.emit('ALERT', { code: 2, msg: '사용자 정보가 없습니다. 다시 접속해 주세요.'})
            const { room, id, name } = $USER;
            IO.to(room).emit('CHAT_MESSAGE', { id, name, message: message.substring(0, 100) });
        })
        socket.on('CHAT_IMAGE', async ({ image }) => {
            if(image.length > $FILE_UPLOAD.chat) return socket.emit('ALERT', {msg: `이미지는 최대 ${$FILE_UPLOAD.chat}개까지 동시에 전송이 가능합니다.`});
            const $USER = await SOCKET_FIND(socket.id)
            const { room, id, name } = $USER;
            IO.to(room).emit('CHAT_IMAGE', { id, name, image });
        })
        socket.on('CHAT_VIDEO', async ({ video }) => {
            if(video.length > $FILE_UPLOAD.chat) return socket.emit('ALERT', {msg: `동영상은 최대 ${$FILE_UPLOAD.chat}개까지 동시에 전송이 가능합니다.`});
            const $USER = await SOCKET_FIND(socket.id)
            const { room, id, name } = $USER;
            IO.to(room).emit('CHAT_VIDEO', { id, name, video });
        })
        
        // dev
        // const sockets = await IO.in(num).fetchSockets();
        // const count = sockets.length;
        socket.on('SOCKET_COUNT', async ({ page }, cb) => {
            // console.log('page :', page); ///
            const $SOCKET = IO.sockets.sockets.size || 0;
            const $LIST = await SOCKET_LIST();
            if(process.env.NODE_ENV === 'development'){
                console.log('소켓 :', $SOCKET, '등록된 이용자 :', $LIST.length);
                console.log('---------------------------------------');
            }
            const paging = pagination($LIST.length, page, 20, 10);
            const $USER = $LIST.slice(paging.offset, paging.viewList * page)
            cb({code: 0, socket: $SOCKET, list: $USER, paging})
        })
        socket.on('SOCKET_REFRESH', async (cb) => {
            SOCKET_RESET(IO)
            if(process.env.NODE_ENV === 'development'){
                console.log('소켓 정리 후 목록 :', await SOCKET_LIST());
                console.log('---------------------------------------');
            }
            cb({code: 0, msg: '동기화 완료'})
        })
        socket.on("disconnecting", (reason) => {
            // console.log('disconnecting :', reason);
            for (const room of socket.rooms) {
                if (room !== socket.id) {
                    socket.to(room).emit("user has left", socket.id);
                }
            }
        });
        socket.on('disconnect', async (reason)=>{
            // console.log(`disconnect: ${socket.id}, Reason: ${reason}`);
            // console.log('socket.user :', socket.user);
            IO.to('admin').emit('SOCKET_NOW', { socket: IO.sockets.sockets.size || 0 })
            const $FIND = await SOCKET_FIND(socket.id)
            await SOCKET_DELETE(socket.id)
            if($FIND) IO.to($FIND.room).emit('ROOM_STATUS', { status: 'LEAVE', notice: `[ ${$FIND.name} ]님이 접속을 종료하였습니다.` })
            if(socket.user?.num) IO.to(socket.user.num).emit('ROOM_STATUS', { status: 'LEAVE' })
        })
    })
}

module.exports = socket;