// server <=> client
// $REGEX_RULES, checkRule
const fs = require('fs').promises;

const $PATH = require.main.path;
const { checkError } = require(`${$PATH}/config/system`)

const $REGEX = {
    escape_check: /[`\\]/, 
    escape_replace: /[`\\]/gm,
    upload_image: new RegExp(`^\\s*|\/data\/${process.env.APP_NAME}\/(?:temp\/[\\d]{4}|images\/[^\\s]+)\/[^\\s]+?.(?:jpg|jpeg|png|gif|bmp|webp|svg)`, 'gmi'), // board upload
    tag_image_file: new RegExp(`<img[^>]*src=["']?(\/data\/${process.env.APP_NAME}\/(images)\/)+[^>"']+["']?[^>]*>`, 'gmi'),
    tag_image_url: /<img[^>]*src=["']?((https?:\/\/|\/\/|\/)[^"'>\s]+)["']?[^>]*>/gmi, // group $1: url
    url_image: /^(http(s)?:\/\/|\/\/)[^\s]+?\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?.*)?$/i,
    // url_image_file: /([^\/\s]+?\.(jpg|jpeg|png|gif|bmp|webp|svg))/i, // event filename.(ext) 
    url_image_file: /([^\/\s]+?\.(jpg|jpeg|png|gif|bmp|webp|svg))(?=\s|$)/i, // event filename.(ext)
    url_video: /((http(s)?:\/\/)+[^\]]*(\.(mp4)))/gmi,
    input_image: new RegExp(`(\/data\/${process.env.APP_NAME}\/temp\/[\\d]{4}\/)([^\\s]+?.(?:jpg|jpeg|png|gif|bmp|webp|svg))`, 'gmi'), // checkImage()
    editor_image_temp: new RegExp(`<img[^>]*src=["']?(\/data\/${process.env.APP_NAME}\/temp\/[\\d]{4}\/)([^>"']+)["']?[^>]*>`, 'gmi'), // editorCheck()
    editor_image_save: new RegExp(`<img[^>]*src=["']?(\/data\/${process.env.APP_NAME}\/images\/[^>"']+)["']+[^>]*>`, 'gmi'), // editorCheck()
    editor_image_folder: new RegExp(`\/${process.env.APP_NAME}\/temp\/`, 'gmi'), // editorCheck()
    editor_image_user: new RegExp(`\/${process.env.APP_NAME}\/temp\/[\\d]{4}\/`, 'gmi') // editorCheck() > admin user note
}
const checkLength = (input, min, max)=>{
    if(min !== 0 && input.length < min) return {code: 1, msg: `${min}자 이상 입력해 주세요. (${min}~${max})`}
    if(input && input.length > max) return {code: 1, msg: `${max}자 이하로 입력해 주세요. (${min}~${max})`}
    return { code: 0 }
}
const $REGEX_MSG = '양식에 맞게 입력해 주세요.';
const $REGEX_RULES = {
    // register
    id: { length: [6, 16], regex: /^[a-z]{4}[a-z_\d]{2,16}$/, msg: `아이디 : ${$REGEX_MSG}` },
    email: { length: [10, 50], regex: /^[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/, msg: `이메일 : ${$REGEX_MSG}` },
    name: { length: [2, 12], regex: /^(?!.*(운영|관리|대표))([가-힣]{2}[가-힣\w]{0,14}|[a-zA-Z]{4}[가-힣\w]{0,12})$/, msg: `별명 : ${$REGEX_MSG}` },
    passCode: { length: [6, 8], regex: /^[\d]{6,8}$/, msg: `본인 확인(인증) 번호 : ${$REGEX_MSG}` },
    pass: { length: [10, 20], regex: /^[\w!@#$%^&*()-=+~.]{10,20}$/, msg: `비밀번호 : ${$REGEX_MSG}` },
    passCheck: { length: [10, 20], regex: /^[\w!@#$%^&*()-=+~.]{10,20}$/, msg: `비밀번호 확인 : ${$REGEX_MSG}` },
    passConfirm: { check: (input) => input, msg: '비밀번호가 일치하지 않습니다.' },
    // user
    messenger: { length: [0, 12], regex: /^\s*$|[\d]{6,12}$/, msg: `메신저 아이디 : ${$REGEX_MSG}` },
    // board
    board_title: { length: [4, 100], msg: `글 제목 : ${$REGEX_MSG}` },
    notice_title: { length: [0, 200], msg: `글 제목 : ${$REGEX_MSG}` },
    image: { length: [0, 200], regex: $REGEX.upload_image, msg: `이미지 업로드 : ${$REGEX_MSG}` },
    price: { regex: /^\s*$|[1-9]{1}[0-9]{3,7}$/, msg: `가격 : ${$REGEX_MSG}` }, // board
    // price_check: { check: (input) => input, msg: '입찰 : 최소 금액보다 높거나 같아야 합니다.' },
    price_input: { // comment
        check: (input) => {
            const $NUM = Number(input);
            if($NUM >= 1000 && $NUM < 100000) return /^[1-9]\d*(000)$/.test(input);
            else if($NUM >= 100000) return /^[1-9]\d*(0000)$/.test(input);
            return false;
        }, regex: /^[1-9]\d*(0000|000)$/, msg: `입찰 단위 : ${$REGEX_MSG}\n1,000(천) 이상`,
    },
    // period: { regex: /^[0-9~.\s:-]{0,50}$/, msg: '기간(날짜)을 입력해 주세요. 숫자, 특수(~:.-) (0~50)' }, // event
    period: { regex: /^[0-9-]{0,10}$/, msg: '기간(날짜)을 입력해 주세요.' }, // Date_Picker
    link: { length: [0, 200], regex: /^\s*$|(https:\/\/[^\s]*)/, msg: `연결 주소(URL) : ${$REGEX_MSG}` },
    // tag: { length: [0, 30], regex: /^(?!,)(?!.*\s)(?!.*,$)(?!.*,,)[ㄱ-ㅎㅏ-ㅣ가-힣\d\w,]{0,50}$/, msg: '태그 : 한글, 영문, 숫자, 공백X, 콤마( , )로 구분 (0~30)' },
    tag: { length: [0, 30], regex: /^\s*$|(?!,)(?!.*\s)(?!.*,$)(?!.*,,)([가-힣\d\w]{2,10})(,[가-힣\d\w]{2,10})*$/, msg: '태그 : 한글, 영문, 숫자, 공백X, 콤마( , )로 구분\n각 태그는(2~10) 전체(0~30)' },
    search: { length: [2, 20], regex: /^[ㄱ-ㅎㅏ-ㅣ가-힣\w]{2,20}$/, msg: '검색 : 한글, 영문, 숫자만 가능합니다. (2~20)' },
    memo: { length: [0, 100], msg: `내용 : ${$REGEX_MSG}`, },
    note: { length: [0, 1000], msg: `내용 : ${$REGEX_MSG}`, },
    // chat
    chat_title: { length: [4, 20], msg: `대화방 제목 : ${$REGEX_MSG}` },
    room_code: { length: [4, 10], regex: /^[가-힣\w]{4,10}$/ , msg: `대화방 입장 코드 : ${$REGEX_MSG}` },
    room_type: { regex: /^[1-7]{1}$/ , msg: `대화방 종류를 선택해 주세요.` },
    room_max: { regex: /^[2-9]{1}$|^[1-9]{1}[0-9]{1}$/ , msg: `대화방 참여 인원을 선택해 주세요.` },
    // chat_message: { length: [1, 100], msg: `메세지 : ${$REGEX_MSG}` },
    // admin
    admin_block: { regex: /^[\d]{0,3}$/, msg: `차단 기간(일) : ${$REGEX_MSG}` },
};
const checkRule = (check, input) => {
    const $RULE = $REGEX_RULES[check];
    // console.log(check, input, $RULE); ///
    if(!$RULE) return { code: 0 }
    if($REGEX.escape_check.exec(input)) return { code: 1, msg: `${$RULE.msg}\n사용할 수 없는 문자가 포함되었습니다. ( ${$REGEX.escape_check.exec(input)[0]} )` }

    if(input === '' || input === undefined){
        if($RULE.length && input.length < $RULE.length[0]) return { code: 1, msg: `${$RULE.msg}\n${$RULE.length[0]}자 이상 입력해 주세요. (${ $RULE.length[0]}~${$RULE.length[1]})` };
        return { code: 0 };  
    }
    if($RULE.length){
        const $LENGTH = checkLength(input, $RULE.length[0], $RULE.length[1]);
        if($LENGTH.code) return { code: 1, msg: `${$RULE.msg}\n${$LENGTH.msg}` };
    }
    if($RULE.regex && !$RULE.regex.test(input)) return { code: 1, msg: $RULE.msg };
    if($RULE.check && !$RULE.check(input)) return { code: 1, msg: $RULE.msg };
    if($RULE.escape && $RULE.escape.exec(input)) return { code: 1, msg: `${$RULE.msg}\n사용할 수 없는 문자가 포함되었습니다. ( ${$RULE.escape.exec(input)[0]} )` };
    return { code: 0 };
};
const checkImage = async (folder, input, save)=>{ // input image(thumbnail)
        if(input === save) return { code: 0, data: input }
    let $URL;
    try{
        if(input){
            const $FOLDER_TEMP = input.replace($REGEX.input_image, '$1');
            const $FOLDER_IMAGE = $FOLDER_TEMP.replace(/\/temp\//g, `/images/${folder}/`);
            const $FOLDER_USER = $FOLDER_TEMP.replace(/\/temp\/[\d]{4}\//g, `/images/${folder}/`);
            const $FOLDER = folder === 'profile' ? $FOLDER_USER : $FOLDER_IMAGE;
            const $FILE_NAME = input.replace($REGEX.input_image, '$2'); // file name
            fs.access($FOLDER).then(()=>{
                return fs.rename($FOLDER_TEMP + $FILE_NAME, $FOLDER + $FILE_NAME)
            }).catch(async ()=>{
                await fs.mkdir($FOLDER, { recursive: true });
                return fs.rename($FOLDER_TEMP + $FILE_NAME, $FOLDER + $FILE_NAME)
            })
            $URL = $FOLDER + $FILE_NAME;
        }
        if(save && (!input || input !== save)){
            fs.access(save).then(()=>{ return fs.unlink(save) }).catch((err)=>{ return checkError(err, '/modules/REGEX.js, checkImage > unlink') })
        }
        return { code: 0, data: $URL ? $URL.replace(/\\+/g, '/') : null }
    }catch(err){
        checkError(err, '/modules/REGEX.js, checkImage');
        return { code: 1, msg:'이미지 등록(수정)이 실패하였습니다.' };
    }
}
// 작업 추가: client url input escape check `'", body pass: editor, params 
const checkInput = (inputs) => {
    const $OBJECT = Object.entries(inputs).reduce((acc, [key, value])=>{
        if(value !== undefined && value !== null){
            const $CHECK = checkRule(key, value);
            if($CHECK.code) return $CHECK;
        }
        acc[key] = (value === '' || value === undefined) ? null : value;
        return acc;
    }, {})
    return { code: 0, ...$OBJECT }
}
const checkNull = (input)=>{
    return Object.entries(input).reduce((acc, [key, value])=>{
        acc[key] = (value === '' || value === undefined) ? null : value;
        return acc;
    }, {})
}

module.exports = { $REGEX, checkImage, checkInput, checkNull };