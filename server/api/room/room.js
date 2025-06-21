require('dotenv').config
const express = require('express');
const app = express();

const $PATH = require.main.path;
const { dateFormat } = require(`${$PATH}/config/system`);
const { transaction, pooling, pool } = require(`${$PATH}/config/mysql`);
const { pagination } = require(`${$PATH}/modules`);
const { checkInput } = require(`${$PATH}/modules/REGEX`);
const { checkAdmin } = require(`${$PATH}/modules/USER`);
const { SOCKET_LIST, SOCKET_FIND } = require(`${$PATH}/modules/SOCKET`);
const { $CHAT_ROOM_TYPE, $CHAT_COUNT, chatList } = require(`${$PATH}/modules/CHAT`);

// /room
app.get('/list/:page', async (req, res)=>{

})

module.exports = app;