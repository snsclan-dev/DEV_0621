const fs = require('fs').promises;
const $PATH = require.main.path;
const { $REGEX } = require(`${$PATH}/modules/REGEX`);
const { checkError } = require(`${$PATH}/config/system`)

const $EDITOR_CHECK = [ // check length
    { type: 'user', text: 1000, html: 50000, image: 10 }, // admin user note
    { type: 'board', text: 10000, html: 50000, image: 50, video: 10 }, // board
    { type: 'comment', text: 1000, html: 10000, image: 3, video: 1 },
    { type: 'event', text: 500, html: 5000, image: 3 },
    { type: 'messenger', text: 5000, html: 50000, image: 20, video: 5 }, // messenger
]
// const editorCheck = async (folder, input, save)=>{
const editorCheck = async ({type, folder, input, save=null, id=null})=>{ // 객체로 받음 확인
    const $TEXT = input.replace(/<[^>]*>/g, ''); // 태그 제거
    const $CHECK = $EDITOR_CHECK.find((e)=>{ return e.type === type })
    if(type !== 'user'){
        if($TEXT.replace(/\s+/g, '').length < 6) return {code: 1, msg: '내용: 6자 이상 입력해 주세요.'}
    }
    if($TEXT.length > $CHECK.text || input.length > $CHECK.html) return {code: 1, msg: '내용(HTML)이 너무 많습니다.'}

    // check image length count
    const $FIND_IMAGE = input.match($REGEX.tag_image_url)?.length || 0;
    const $FIND_VIDEO = input.match($REGEX.url_video)?.length || 0;

    if($FIND_IMAGE > $CHECK.image) return { code: 1, msg: `이미지(파일 + 태그)는 최대 [ ${$CHECK.image} ]개까지 등록이 가능합니다.\n현재 등록된 이미지 [ ${$FIND_IMAGE} ]개`};
    if($FIND_VIDEO > $CHECK.video) return { code: 1, msg: `영상(파일 + 태그)는 최대 [ ${$CHECK.video} ]개까지 등록이 가능합니다.\n현재 등록된 영상 [ ${$FIND_VIDEO} ]개`};

    const $MATCH_IMAGE_TEMP = input.match($REGEX.editor_image_temp) || [];
    const $MATCH_IMAGE_INPUT = input.match($REGEX.editor_image_save) || [];
    const $MATCH_IMAGE_SAVE = save ? save.match($REGEX.editor_image_save) || [] : [];
    const $ARR_IMAGE_INPUT = [], $ARR_IMAGE_SAVE = []
    try{
        for (const e of $MATCH_IMAGE_TEMP) {
            const $FOLDER_TEMP = e.replace($REGEX.editor_image_temp, '$1');
            // const $FOLDER_IMAGE = $FOLDER_TEMP.replace($REGEX.editor_image_folder, `/${process.env.APP_NAME}/images/${folder}/`);
            const $FOLDER_IMAGE = folder === 'user' && id ? 
                $FOLDER_TEMP.replace($REGEX.editor_image_user, `/${process.env.APP_NAME}/images/${folder}/${id}/`) :
                $FOLDER_TEMP.replace($REGEX.editor_image_folder, `/${process.env.APP_NAME}/images/${folder}/`);
            const $FILE_NAME = e.replace($REGEX.editor_image_temp, '$2'); // file name
            $ARR_IMAGE_INPUT.push($FOLDER_IMAGE + $FILE_NAME);

            await fs.access($FOLDER_IMAGE).then(()=>{
                return fs.rename($FOLDER_TEMP + $FILE_NAME, $FOLDER_IMAGE + $FILE_NAME)
            }).catch(async ()=>{
                await fs.mkdir($FOLDER_IMAGE, { recursive: true });
                return fs.rename($FOLDER_TEMP + $FILE_NAME, $FOLDER_IMAGE + $FILE_NAME)
            })
        }
        for (const e of $MATCH_IMAGE_INPUT) {
            $ARR_IMAGE_INPUT.push(e.replace($REGEX.editor_image_save, '$1'));
        }
        for (const e of $MATCH_IMAGE_SAVE) {
            $ARR_IMAGE_SAVE.push(e.replace($REGEX.editor_image_save, '$1'));
        }
        const $MODIFY_IMAGE = $ARR_IMAGE_SAVE.filter(e => !$ARR_IMAGE_INPUT.includes(e));
        for (const e of $MODIFY_IMAGE) {
            await fs.access(e).then(()=> fs.unlink(e)).catch((err)=> checkError(err, 'modules/EDITOR.js, editorCheck() unlink') )
        }

        // const $HTML_REPLACE = input.replace($REGEX.editor_image_folder, `/${process.env.APP_NAME}/images/${folder}/`)
        const $HTML_REPLACE = folder === 'user' && id ? 
            input.replace($REGEX.editor_image_user, `/${process.env.APP_NAME}/images/${folder}/${id}/`) :
            input.replace($REGEX.editor_image_folder, `/${process.env.APP_NAME}/images/${folder}/`)

        // const $DATA = $HTML_REPLACE.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/g, (match, content)=>{ return /<[^>]+>/.test(content) ? content : match }).replace(/(<p><\/p>){3,}/g, '<p></p><p></p>')
        const $DATA = $HTML_REPLACE.replace(/(<p><\/p>){3,}/g, '<p></p><p></p>')
        
        // return { code: 0, data: $HTML_REPLACE };
        return { code: 0, data: $DATA };
    }catch(err){
        checkError(err, '/modules/EDITOR.js, editorCheck()');
        return { code: 1, msg:'에디터 이미지 등록(수정)이 실패하였습니다.' };
    }
}

module.exports = { editorCheck };