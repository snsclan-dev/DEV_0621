const express = require('express');
const app = express();
const helmet = require('helmet');
const cors = require("cors");
const path = require('path')
const cookieParser = require('cookie-parser');

const $PATH = require.main.path;
const { $SYSTEM_CORS, checkToken } = require(`${$PATH}/config/system`);

app.set('trust proxy', true);
app.use(cors({ origin: $SYSTEM_CORS, credentials: true, exposedHeaders: '*' }));
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(checkToken);

app.use((req, res, next)=>{
    if(process.env.NODE_ENV === 'development') console.log(`[ ${process.env.APP_NAME} ] client request :`, req.url);
    next()
})
app.use(`/${process.env.FOLDER}/${process.env.APP_NAME}`, express.static(path.join('/', process.env.FOLDER, process.env.APP_NAME))); // public

app.use(`/${process.env.FOLDER}/${process.env.APP_NAME}/chat`, express.static(path.join('/', process.env.FOLDER, process.env.APP_NAME, 'chat')))
app.use(`/${process.env.FOLDER}/${process.env.APP_NAME}/video`, express.static(path.join('/', process.env.FOLDER, process.env.APP_NAME, 'video')))

app.use(`/${process.env.FOLDER}/${process.env.APP_NAME}`, (req, res, next) => {
    if (!req.user?.login_id) return res.status(403).send('<center><h1>403 Forbidden</h1></center><hr><center>nginx</center>');
    next();
}, express.static(path.join('/', process.env.FOLDER, process.env.APP_NAME)));

module.exports = app;