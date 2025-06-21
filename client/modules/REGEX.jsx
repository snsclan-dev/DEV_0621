// client <=> server
// $REGEX_RULES, checkRule

export const $REGEX = {
    escape_check: /[`\\]/, 
    escape_replace: /[`\\]/gm,
    upload_image: new RegExp(`^\\s*|\/data\/${process.env.NEXT_PUBLIC_APP_NAME}\/(?:temp\/[\\d]{4}|images\/[^\\s]+)\/[^\\s]+?.(?:jpg|jpeg|png|gif|bmp|webp|svg)`, 'gmi'),
    url_image: /(http(s)?:\/\/[^\s]+?\.(bmp|png|gif|jpe?g|webp))/gi,
    url_video: /(http(s)?:\/\/[^\s]+?\.(mp4))/gi,
}
export const $REGEX_GUIDE = {
    pass: <span id="pass" className="c_gray">숫자 위 특수 문자, -_=+~. 가능 (10~20)</span>,
    board_title: <span id="board_title">&#x2714; 글 제목을 입력해 주세요 (4~100)</span>,
    image: <span id="image">&#x2714; 대표 이미지 등록 (0~200)</span>,
    price: <span id="price">&#x2714; <span className="fwb">1,000</span> 이상 숫자만 입력해 주세요.</span>,
    period: <span id="period">&#x2714; 이벤트 기간을 입력(선택)해 주세요.</span>, // event
    link: <span id="link">&#x2714; 연결 주소(URL)를 입력해 주세요. (https만 가능)</span>,
    tag: <span id="tag">&#x2714; 태그를 입력해 주세요. 공백X, 콤마( , )로 구분, 각 태그는(2~10) (0~30)</span>,
    chat_title: <span id="chat_title">&#x2714; 대화방 제목을 입력해 주세요 (4~20)</span>,
    room_code: <span id="room_code">&#x2714; 대화방 입장코드(암호)를 입력해 주세요. 한/영, 숫자 (4~10)</span>,
    room_max: <span id="room_max">&#x2714; 대화방 참여자를 입력해 주세요 (2~99)</span>,
}
const checkLength = (input, min, max)=>{
    if(min !== 0 && input.length < min) return {code: 8, msg: `${min}자 이상 입력해 주세요. (${min}~${max})`}
    if(input && input.length > max) return {code: 8, msg: `${max}자 이하로 입력해 주세요. (${min}~${max})`}
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
    if(!$RULE) return { code: 0 }
    if($REGEX.escape_check.exec(input)) return { code: 8, msg: `${$RULE.msg}\n사용할 수 없는 문자가 포함되었습니다. ( ${$REGEX.escape_check.exec(input)[0]} )` }
    
    if(input === '' || input === undefined){
        if ($RULE.length && input.length < $RULE.length[0]) return { code: 8, msg: `${$RULE.msg}\n${$RULE.length[0]}자 이상 입력해 주세요. (${ $RULE.length[0]}~${$RULE.length[1]})` };
    }
    if ($RULE.length) {
        const $LENGTH = checkLength(input, $RULE.length[0], $RULE.length[1]);
        if ($LENGTH.code) return { code: 8, msg: `${$RULE.msg}\n${$LENGTH.msg}` };
    }
    if ($RULE.check && !$RULE.check(input)) {
        return { code: 8, msg: $RULE.msg };
    }
    if ($RULE.regex && !$RULE.regex.test(input)) {
        return { code: 8, msg: $RULE.msg };
    }
    return { code: 0 };
};
export const checkInput = (inputs) => {
    for (const [field, value] of Object.entries(inputs)) {
        if(value !== undefined && value !== null){
            const $CHECK = checkRule(field, value);
            if ($CHECK.code) return $CHECK;
        }
    }
    return { code: 0 };
};
export const checkInputColor = (check, input)=>{
    return document.getElementById(check).setAttribute('style', `color:${checkRule(check, input).code === 0 ? '#090' : '#f00'}`)
}