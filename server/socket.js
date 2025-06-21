require('dotenv').config();
const { createAdapter } = require("@socket.io/redis-adapter");

const $PATH = require.main.path;
const $REDIS = require(`${$PATH}/config/redis`);
const IO = require(`${$PATH}/config/socket`);
const { socket, socket_messenger, socket_dev, socket_room } = require(`${$PATH}/api/socket`);
const { room_socket } = require(`${$PATH}/api/room`);
const { SOCKET_RESET } = require(`${$PATH}/modules/SOCKET`);

const subClient = $REDIS.duplicate();
Promise.all([subClient.connect()]).then(() => {
    IO.adapter(createAdapter($REDIS, subClient));
});

SOCKET_RESET(IO)
socket(IO);
socket_room(IO);
socket_messenger(IO);

room_socket(IO);

if (process.env.NODE_ENV === 'development') socket_dev(IO);