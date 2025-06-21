const { Server } = require("socket.io");

const $PATH = require.main.path;
const app = require(`${$PATH}/config/express`);
const { $SYSTEM_CORS } = require(`${$PATH}/config/system`);

const SOCKET_SERVER = app.listen(process.env.PORT_SOCKET, '0.0.0.0', (err)=>{
    if(err) throw checkError(err, 'SOCKET ON ERROR');
    console.log(`[ ${process.env.APP_NAME} ] SOCKET ON : ${process.env.PORT_SOCKET} / MODE : ${process.env.NODE_ENV}`);
})

const IO = new Server(SOCKET_SERVER , {
    cors: { origin: $SYSTEM_CORS, methods: ["GET", "POST"], credentials: true },
    path: '/socket/', transports: ["websocket"],
    pingInterval: 10000, pingTimeout: 5000
});

module.exports = IO;