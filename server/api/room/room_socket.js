const $PATH = require.main.path;
const { pool } = require(`${$PATH}/config/mysql`);
const { dateFormat } = require(`${$PATH}/config/system`);
const { SOCKET_LIST, SOCKET_UPDATE, SOCKET_FIND, SOCKET_ROOM_USER } = require(`${$PATH}/modules/SOCKET`);
const { chatList } = require(`${$PATH}/modules/CHAT`);

// dev
const room_socket = (IO) => {
    IO.on("connection", (socket) => {

        socket.on('MAP', (data) => {

            console.log('MAP :', data);
        });
    })
}

module.exports = room_socket;