require('dotenv').config();

const $PATH = require.main.path;
const app = require(`${$PATH}/config/express`);
const { checkError } = require(`${$PATH}/config/system`);

// app router
app.use('/admin', require(`${$PATH}/api/admin/admin`));
app.use('/admin', require(`${$PATH}/api/admin/admin_app`));
app.use('/admin/user', require(`${$PATH}/api/admin/admin_user`));
app.use('/admin/block', require(`${$PATH}/api/admin/admin_block_ip`));

app.use('/app', require(`${$PATH}/api/app`));
app.use('/app', require(`${$PATH}/api/app_notice`));
app.use('/report', require(`${$PATH}/api/report`));

app.use('/user', require(`${$PATH}/api/user/user`));
app.use('/user/auth', require(`${$PATH}/api/user/user_auth`));

app.use('/main', require(`${$PATH}/api/main`));
app.use('/upload', require(`${$PATH}/api/upload`));

app.use('/board', require(`${$PATH}/api/board/board`));
app.use('/comment', require(`${$PATH}/api/board/comment`));
app.use('/comment/event', require(`${$PATH}/api/board/comment_event`));

app.use('/messenger', require(`${$PATH}/api/messenger/messenger`));

app.use('/chat', require(`${$PATH}/api/chat/chat`));
app.use('/room', require(`${$PATH}/api/room/room`));

app.listen(process.env.PORT_SERVER, '0.0.0.0', (err)=>{
    if(err) throw checkError(err, 'SERVER ON ERROR');
    console.log(`[ ${process.env.APP_NAME} ] SERVER ON : ${process.env.PORT_SERVER} / MODE : ${process.env.NODE_ENV}`);
})
process.on('uncaughtException', (err) => {
    checkError(err, 'Server Uncaught Exception')
});
process.on('unhandledRejection', (reason, promise) => {
    checkError(reason, 'Server Unhandled Rejection')
});