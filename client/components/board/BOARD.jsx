// server <=> client 확인
import Link from 'next/link';
import { checkAdmin, checkManager, dateNow } from 'modules/SYSTEM';

// APP_TYPE: menu, notice, private_board, private_comment, image, auction
export const $BOARD_STATE = { '0_normal': 0, '1_notice': 1, '2_period': 2, '3_period_end': 3, '4_price': 4, '6_report': 6, '7_view': 7, '8_delete': 8, '9_delete_admin': 9, '10_delete_data': 10 }
export const $BOARD_REPORT = 5;
const $STATE = {
    0: { title: '정상', tag: 'tag_green', color: 'c_green', text: '정상 게시물입니다.', style: '', bg: '' },
    1: { title: '공지', tag: 'tag_orange', color: 'c_orange', text: '중요 알림 게시물입니다.', style: '', bg: 'bg_orange' },
    2: { title: '이벤트', tag: 'tag_blue', color: 'c_blue', text: '이벤트가 진행중입니다.', style: 'state_list_blue', bg: 'bg_blue' },
    3: { title: '종료', tag: 'tag_gray', color: 'c_gray', text: '이벤트가 종료되었습니다.', style: '', bg: 'bg' },
    4: { title: '구매', tag: 'tag_pink', color: 'c_pink', text: '구매(낙찰) 성공!', style: 'state_list_pink', bg: 'bg_pink' },
    6: { title: '신고', tag: 'tag_red', color: 'c_orange', text: '신고된 게시물입니다.', style: 'state_list_orange', bg: 'bg_orange' },
    7: { title: '숨김', tag: 'tag_pink', color: 'c_pink', text: '숨겨진 게시물입니다.', style: 'state_list_pink', bg: 'bg_red' },
    8: { title: '삭제', tag: 'tag_red', color: 'c_red', text: '삭제된 게시물입니다.', style: 'state_list_red', bg: 'bg_red' },
    9: { title: '관리', tag: 'tag_red', color: 'c_red', text: '규칙 위반으로 삭제되었습니다.', style: 'state_list_red', bg: 'bg_red' },
};
export const boardState = (obj)=>{
    const { period, count_report, state } = obj;
    if(state >= $BOARD_STATE['7_view']) return state;
    if(count_report >= $BOARD_REPORT) return $BOARD_STATE['6_report']
    if(period && period < dateNow()) return $BOARD_STATE['3_period_end'];
    return state;
}
// obj: user_id, period, count_report, state
// user: id, level
export const boardStyle = (obj, user)=>{ // state style
    const $STATE_NUM = boardState(obj)
    const $FIND = $STATE[$STATE_NUM]
    const $WRITER = obj.user_id === user.id ? 'bg_blue' : '';
    if(checkAdmin(user.level) && $STATE_NUM >= $BOARD_STATE['6_report']) return `${$FIND.style} ${$WRITER}`
    if(checkManager(user.level) && $STATE_NUM === $BOARD_STATE['6_report']) return `${$FIND.style} ${$WRITER}`
    return $WRITER
}
export const Board_Info = ({info, children})=>{
    if(!info || !info.note) return null
    return(<div className="box pd_1 fs_13 mg_b2">
        <p className='line w_80'>{info.note}</p>
        <p className='line w_20 ta_r'>{children}</p>
    </div>)
}
export const Board_State = ({type, obj})=>{
    const $STATE_NUM = boardState(obj)
    const $FIND = $STATE[$STATE_NUM]
    if(type === 'list' && $STATE_NUM > 0) return(<button className={$FIND.tag}>{$FIND.title}</button>)
    if(type === 'read' && $STATE_NUM > 0) return(<div className={`${$FIND.bg} pd_1 ta_c mg_h2 align`}>
        <button className={$FIND.tag}>{$FIND.title}</button><span className={`${$FIND.color} mg_l`}>{$FIND.text}</span>
    </div>)
    if(type === 'popup') return(<><button className={`${$FIND.tag} `}>{$FIND.title}</button><span className={`${$FIND.color} mg_l1`}>{$FIND.text}</span></>)
    if(type === 'comment' && $STATE_NUM >= $BOARD_STATE['6_report']) return(<span className={`${$FIND.color} fs_13`}>{$FIND.text}</span>)
    return null;
}
export const Board_Check = ({id, list, checkList, clickCheck})=>{
    return(<input id={id} className="input_check" type="checkbox" name="checkbox[]" onChange={(el)=>clickCheck(el.target.checked, list.num)} checked={checkList.includes(list.num) ? true : false}/>)
}
export const Board_Tag = ({app, tag})=>{
    if(!tag) return null;
    const $TAG = tag ? tag.split(',') : []
    return $TAG.map((e, i)=> <Link key={i} className='mg_r2 tag_hover' href={`/${app}/search/${encodeURIComponent(e)}/1`}>
        <span className='c_gray fs_15 mg_r'>#</span><span className='c_green search'>{e}</span>
    </Link>)
}