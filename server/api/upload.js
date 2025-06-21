require('dotenv').config
const express = require('express');
const app = express.Router();

const $PATH = require.main.path;
const { $FILE_UPLOAD, checkError } = require(`${$PATH}/config/system`);
const upload = require(`${$PATH}/modules/multer`);

app.post('/image/:folder', (req, res)=>{ // folder: image upload temp
    const { login_id } = req.user, { folder } = req.params; // folder: temp 5, chat 3
    if(!login_id) return res.json({code: 1, msg: '로그인이 필요합니다.'})
    const images = [];
    upload(req, res, async function (err){
        if(err){
            checkError(err, 'main/upload.js, /image')
            if(err === 'FILE_TYPE') return res.json({code: 1, msg: '이미지 형식이 아닙니다.'})
            if(err === 'FILE_LENGTH') return res.json({code:1, msg: `이미지 업로드 허용 개수를 초과하였습니다.\n하루(0시) 마다 초기화 됩니다.`})
            if(err.code === 'LIMIT_FILE_SIZE') return res.json({code:1, msg: `이미지 용량(${$FILE_UPLOAD.maxSize}MB)이 초과되었습니다.`})
        }
        const { files } = req;
        if(files.length > $FILE_UPLOAD[folder]) return res.json({code:1, msg: `사진은 최대 ${$FILE_UPLOAD[folder]}장까지 동시에 등록이 가능합니다.`});
        for(const e of files){
            if(e.size > $FILE_UPLOAD.size) return res.json({code: 1, msg: `이미지 용량(${$FILE_UPLOAD.maxSize}MB)이 초과되었습니다.`})
            images.push(e.path.replace(/[\\]/g, '/'));
        }
        res.json({code:0, image: images});
    })
})

module.exports = app;