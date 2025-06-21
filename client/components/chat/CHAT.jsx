import Cookies from "js-cookie";
import { $USER_MANAGER, checkAdmin } from "modules/SYSTEM";

export const $CHAT_MESSAGE = { room: '', last: '', line: 0, max: 3 }

export const $CHAT_ROOM_TYPE = { '1_public': 1, '2_user': 2, '3_secret': 3, '7_view': 7 }
export const $CHAT_ROOM_SELECT = [ // chat room_type option select
    { value: '', select: '대화방 종류를 선택해 주세요' },
    { value: 1, name: '공개', select: '공개방 (손님도 참여가 가능합니다.)', text: '손님도 참여가 가능한 대화방입니다.', color: 'c_green' },
    { value: 2, name: '회원', select: '회원방 (회원만 참여가 가능합니다.)', text: '회원만 참여가 가능한 대화방입니다.', color: 'c_blue' },
    { value: 3, name: '비밀', select: '비밀방 (비밀번호가 필요합니다.)', text: '비밀번호가 필요한 대화방입니다.', color: 'c_pink' },
    { value: 7, name: '숨김', select: '대화방을 숨깁니다. (방장/관리자)', text: '숨겨진 대화방입니다.', color: 'c_lgray' }, // state
]
export const Chat_Room_Type = ({type, value})=>{
    const $FIND = $CHAT_ROOM_SELECT.find((e)=> e.value === value)
    if(type === 'info') return <p className="align"><button className={`bt_2m fs_13 ${$FIND.color}`}>{$FIND.name}</button><span className={`${$FIND.color} mg_l`}>{$FIND.text}</span></p>
    return(<button className={`bt_2m fs_13 ${$FIND.color}`}>{$FIND.name}</button>)
}
export const $CHAT_ROOM_MAX = [
    { value: '', level: 0, select: '대화방 최대 참여자 수를 선택해 주세요' },
    { value: 2, level: 1, select: '2명' }, { value: 3, level: 1, select: '3명' }, { value: 4, level: $USER_MANAGER, select: '4명 (관리자)' }
]
const $STATUS = { // 실시간 방장 접속(대화) 상태
    0: { title: '오프라인', color: 'c_lgray', text: '방장이 오프라인 상태입니다.' },
    1: { title: '온라인', color: 'c_green', text: '방장이 대화중입니다.' },
}
export const Chat_Status = ({status})=>{
    const $FIND = $STATUS[status]
    return(<button className={`bt_2m fs_13 ${$FIND.color}`}>{$FIND.title}</button>)
}
export const chatStyle = (obj, user)=>{
    const { user_id, room_type } = obj
    const $CREATE = user_id === user.id ? 'state_bg_blue' : '';
    if(room_type === $CHAT_ROOM_TYPE['7_view']) return `chat_state_pink ${$CREATE}`
    return `chat_list_box ${$CREATE}`
}
export const chatSound = () => {
    const $SOUND = Cookies.get('sound') ? true : false;
    if($SOUND){
        const sound = new Audio('/join.mp3');
        sound.loop = false, sound.volume = 1, sound.play();
    }
}
export const chatMessage = (message)=>{
    // const br = message.replace(/\[\]/g, '<br />');
    const regex = /(https:\/\/[^\s]+)/g;
    // return br.replace(regex, url => `<p><a href="${url}" target="_blank" rel="noopener noreferrer" class="c_green fwb">[ ${url} ]</a></p>` );
    return message.replace(regex, url => `<p><a href="${url}" target="_blank" rel="noopener noreferrer" class="c_green fwb">[ ${url} ]</a></p>` );
}
export const socketEvent = ({user, setView})=>{
    const checkLine = (name) => {
        if (name === user.name) {
            if (!checkAdmin(user.level)) $CHAT_MESSAGE.line += 1;
        } else {
            $CHAT_MESSAGE.line = 1;
        }
    };
    return {
        'CHAT_MESSAGE': (data) => {
            const { name, message } = data
            setView((state) => {
                const next = [...state, data];
                if(next.length > 50) return next.slice(-20);
                return next;
            });
            if(name === user.name) $CHAT_MESSAGE.last = message;
            checkLine(name);
        },
        'CHAT_IMAGE': (data) => {
            const { name } = data
            setView((state)=>[...state, data]);
            checkLine(name);
        },
        'CHAT_VIDEO': (data) => {
            const { name } = data
            setView((state)=>[...state, data]);
            checkLine(name);
        },
    }
}
export const chatSlider = (view)=>{
    const $SLIDER = document.getElementById('slider')
    if(!$SLIDER) return ()=>{};
    if(Cookies.get('chat_slider')) view.style.height = Cookies.get('chat_slider') + 'px';

    const move = (e)=>{
        const newY = e.touches ? e.touches[0].clientY : e.clientY;
        view.style.height = view.offsetHeight + newY - dragY + 'px';
        dragY = newY;
    }
    const end = ()=>{
        Cookies.set('chat_slider', view.offsetHeight);
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', end);
        document.removeEventListener('touchmove', move);
        document.removeEventListener('touchend', end);
    }
    let dragY = 0;
    const drag = (clientY)=>{
        dragY = clientY;
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', end);
        document.addEventListener('touchmove', move, { passive: false });
        document.addEventListener('touchend', end);
    }
    const touchStartHandler = (e) => {
        e.preventDefault();
        drag(e.touches[0].clientY);
    }
    $SLIDER.onmousedown = (e)=> drag(e.clientY);
    $SLIDER.addEventListener('touchstart', touchStartHandler, { passive: false });

    return ()=>{
        $SLIDER.onmousedown = null;
        $SLIDER.removeEventListener('touchstart', touchStartHandler);
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', end);
        document.removeEventListener('touchmove', move);
        document.removeEventListener('touchend', end);
    }
}