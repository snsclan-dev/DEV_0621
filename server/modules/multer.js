const path = require('path')
const fs = require('fs').promises;
const multer = require('multer');

const $PATH = require.main.path;
const { checkAdmin } = require(`${$PATH}/modules/USER`);
const { $FILE_UPLOAD, checkError } = require(`${$PATH}/config/system`);
const { dateFormat } = require(`${$PATH}/config/system`);

const folderPath = async (req)=>{
    // url: upload.js > /image/:folder > temp
    const $URL = req.url.split('/');
    const $FOLDER_NAME = $URL[$URL.length - 1]
    const $FOLDER_PATH = path.join('/', process.env.FOLDER, process.env.APP_NAME, $FOLDER_NAME, dateFormat('YYMM'))
    const $FOLDER_USER = path.join('/', process.env.FOLDER, process.env.APP_NAME, 'temp', $FOLDER_NAME) // temp/user
    try{
        if($FOLDER_NAME === 'user'){ // user profile
            await fs.access($FOLDER_USER).catch(async ()=>{ await fs.mkdir($FOLDER_USER, { recursive: true }) })
            return $FOLDER_USER;
        }
        await fs.access($FOLDER_PATH).catch(async ()=>{ await fs.mkdir($FOLDER_PATH, { recursive: true }) })
        return $FOLDER_PATH;
    }catch(err){
        checkError(err, 'modules/multer.js, folderPath')
        throw err;
    }
}
const storage = multer.diskStorage({
    destination: async (req, file, cb)=>{
        try{
            const $FOLDER_PATH = await folderPath(req);
            cb(null, $FOLDER_PATH);
        }catch(err){
            cb(err)
        }
    },
    filename: (req, file, cb)=>{
        const { login_id, user_level } = req.user;
        const $FILE_NAME = Math.random().toString(36).substring(2, 8);
        const $USER = checkAdmin(user_level) ? process.env.APP_NAME.toUpperCase() : login_id; // filename: login_id
        cb(null, `${dateFormat('YYMMDD_HHmmSSS')}_${$FILE_NAME}-${$USER}.${file.mimetype.split('/')[1]}`);
    },
});
const fileFilter = async (req, file, cb)=>{
    const { login_id } = req.user;
    if(file.mimetype.split('/')[0] !== 'image') return cb('FILE_TYPE', false);
    const $REGEX_ID = new RegExp(`${login_id}`)
    try{
        const $FOLDER_PATH = await folderPath(req)
        const $DIR = await fs.readdir($FOLDER_PATH);
        const $FILE = $DIR.filter(e => e.split('_')[0] === dateFormat('YYMMDD') && $REGEX_ID.test(e));
        if($FILE.length >= $FILE_UPLOAD.temp) return cb('FILE_LENGTH', false) // 하루 업로드(temp) 제한
        cb(null, true);
    }catch(err){
        checkError(err, 'modules/multer.js, fileFilter');
    }
}

module.exports = multer({ 
    storage: storage, fileFilter: fileFilter, limits: { files: 5, fileSize: $FILE_UPLOAD.fileSize } 
}).array('fileUpload')