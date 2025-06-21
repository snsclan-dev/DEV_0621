const $PATH = require.main.path;
const $REDIS = require(`${$PATH}/config/redis`);
const $REDIS_USER = `${process.env.APP_NAME.toUpperCase()}_USER`;
const { SOCKET_LIST, SOCKET_DELETE } = require(`${$PATH}/modules/SOCKET`);

// dev
const socket_dev = (IO) => {
    IO.on("connection", (socket) => {

        socket.onAny((eventName) => {
            console.log(`[ ${process.env.APP_NAME} : socket ] event request:`, eventName);
        });

        socket.on('user', async () => {
            const $LIST = await SOCKET_LIST();
            console.log('user list', $LIST);
            console.log('socket.user :', socket.user);
            console.log('참여 :', socket.rooms);
            const $SOCKET = IO.sockets.sockets.size || 0;
            console.log('소켓 :', $SOCKET, '등록된 이용자 :', $LIST.length);
            console.log('---------------------------------------');
        })
    })
}

module.exports = socket_dev;

// const $COUNT = IO.sockets.adapter.rooms.get($NUM).size || 0;
