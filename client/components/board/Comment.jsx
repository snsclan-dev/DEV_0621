import React, { useEffect, useState } from "react";
import { useAxios, storeUser, useModal, storeApp,  View_Count, Pagination_Click, View_Svg, View_Char, View_Date } from "modules";
import { checkAdmin, checkManager, clickScroll, dateNow } from "modules/SYSTEM";
import { Message, Modal, App_Report } from "components/app";
import { User_Admin, User_Id, User_Ip, User_Level, User_Profile, User_Tag } from "components/user";
import { $BOARD_STATE, $BOARD_REPORT, Comment_Popup_Admin, Comment_Popup_Menu, Board_State, boardState, boardStyle } from "components/board";
import { Tiptap_Editor, Tiptap_Note, editorCheck } from "components/editor";

const VIEW_NOTE = React.memo(({obj, level})=>{ // note
    const { period, count_report, state } = obj;
    const $ADMIN = checkAdmin(level), $MANAGER = checkManager(level)
    const $STATE = boardState({ period, count_report, state })
    if(!$ADMIN){
        if($STATE >= $BOARD_STATE['7_view'] || !$MANAGER && $STATE >= $BOARD_STATE['6_report'])
        return <p className={`flex pd_l1 ${$STATE > $BOARD_STATE['6_report'] ? 'min_h5' : 'min_h3 mg_b'}`}><Board_State type='comment' obj={{ period, count_report, state }}/></p>
    }
    return(<>
        {$STATE >= $BOARD_STATE['6_report'] && <p className="lh_1 pd_l1"><Board_State type='comment' obj={{ period, count_report, state }}/></p>}
        <div className="pd_1"><Tiptap_Note type='comment' note={obj.note}/></div>
    </>)
})
VIEW_NOTE.displayName = 'VIEW_NOTE';

export const Comment = ({info, read})=>{
    const { app, app_name } = info, { period, count_report, state } = read;
    const { setPopup, setConfirm } = storeApp((state)=>state)
    const { user } = storeUser.getState()
    const [modal, setModal] = useModal(false)
    const [list, setList] = useState([])
    const [paging, setPaging] = useState([])
    const [page, setPage] = useState(1)
    const [checkList, setCheckList] = useState([])
    const $ADMIN = checkAdmin(user.level), $MANAGER = checkManager(user.level)
    // const $PERIOD = app === 'event' || !read.period || new Date(read.period) >= new Date(dateNow());
    const $COMMENT = !modal.modify && user.id && read.user_id !== user.id && read.state === $BOARD_STATE["0_normal"]

    useEffect(()=>{
        const getComment = async ()=>{
            const $DATA = await useAxios.get(`/comment/${app}/list/${read.num}/${page}`)
            if($DATA) setPaging($DATA.paging), setList($DATA.list)
        }
        getComment()
    },[app, read.num, page])

    const clickCheck = (check, num)=>{
        if(check) setCheckList([...checkList, num])
        else setCheckList(checkList.filter((e)=> e !== num))
    }
    const clickCheckAll = ()=>{
        const $checkAll = []
        if(!checkList.length) list.forEach(e => $checkAll.push(e.num));
        setCheckList($checkAll)
    }
    const clickWrite = async (e)=>{
        e.target.blur()
        const $EDITOR = editorCheck({type: 'comment', selector: '#comment'})
        if($EDITOR.code) return setPopup($EDITOR)
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/comment/write', { app, app_name, target_num: read.num, target_id: read.user_id, editor: $EDITOR.data })
            if($DATA) return $EDITOR.editor.clearContent(), setPage(!page), clickScroll('bottom')
        }
        setConfirm({msg: '댓글을 등록하시겠습니까?', confirm: $CONFIRM})
    }
    const clickReply = async (e, obj)=>{
        e.target.blur() 
        const $EDITOR = editorCheck({type: 'comment', selector: '#reply'})
        if($EDITOR.code) return setPopup($EDITOR)
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/comment/reply', { 
                app, target_num: obj.target_num, target_id: obj.user_id, editor: $EDITOR.data, order_num: obj.order_num, order_sort: obj.order_sort, depth: obj.depth 
            })
            if($DATA) return setModal(false), setPage(!page)
        }
        setConfirm({msg: '답글을 등록하시겠습니까?', confirm: $CONFIRM})
    }
    const clickModify = async (e, obj)=>{
        e.target.blur()
        const $EDITOR = editorCheck({type: 'comment', selector: '#modify'})
        if($EDITOR.code) return setPopup($EDITOR)
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/comment/modify', { app, num: obj.num, target_note: obj.note, editor: $EDITOR.data})
            if($DATA){
                setTimeout(()=>{
                    setModal(false)
                    return setPage(!page)
                }, 600)
            }
        }
        setConfirm({msg: '댓글을 수정하시겠습니까?', confirm: $CONFIRM})
    }
    const VIEW_USER = ({obj})=>{
        const { user_position, user_title, user_tag } = obj
        if(!$ADMIN && obj.state >= $BOARD_STATE["7_view"]) return null
        return(<div className="line w_90 fs_13 pd_l">
            <div tabIndex={0} className="popup">
                <User_Level level={obj.level}/><span className="c_gray fwb pd_l">{obj.name}</span>
                {user.id && <div className="popup_l" onClick={()=>setModal({profile: obj.num})}>
                    <p className="fs_13 c_gray mg_b">회원 정보 보기</p>
                    {$MANAGER && <p className="fs_13 mg_b"><User_Id id={obj.user_id} level={obj.level} user={user}/><View_Char char='vl'/><User_Ip ip={obj.user_ip} level={obj.level} user={user}/></p>}
                    <div className="lh_2"><User_Tag type='line' obj={{ user_position, user_title, user_tag }}/></div>
                </div>}
            </div>
            <p className='lh_1 c_gray align'>
                {$ADMIN && <input id={`check_${obj.num}`} className="input_check" type="checkbox" name="checkbox[]" onChange={(el)=>clickCheck(el.target.checked, obj.num)} checked={checkList.includes(obj.num) ? true : false}/>}
                <label htmlFor={`check_${obj.num}`} className='fs_13 c_gray'>번호 <span className="c_black">{obj.num}</span><View_Char char='vl'/>좋아요 <View_Count count={obj.count_like}/><View_Char char='vl'/>
                {obj.updated ? <><View_Date date={obj.updated}/>&nbsp;<span className="c_gray">(수정)</span></> : <View_Date date={obj.created}/>}
                </label>
            </p>
        </div>)
    }
    const VIEW_MENU = ({obj})=>{
        const { num, state, count_report, user_id } = obj
        if(!$ADMIN){
            if(!user.id) return null;
            if(state >= $BOARD_STATE["6_report"] || count_report >= $BOARD_REPORT) return null
            if(state === $BOARD_STATE["3_period_end"] || period && period < dateNow()) return null
        }
        return(<div className='line w_10 lh_2 ta_r pd_r1' onClick={()=>setModal({menu: num})}>
            <View_Svg name='menu' size={24} color={user_id === user.id ? "blue" : "lgray"}/>
        </div>)
    }

    return(<div className="pd_h5">
        {modal.admin === true && <Modal title='⚙️댓글 목록 관리' setModal={setModal}><Comment_Popup_Admin info={info} checkList={checkList} setCheckList={setCheckList} setPage={()=>setPage(!page)} setModal={setModal} /></Modal>}

        {/* comment write */}
        {$COMMENT && <div className="box pd_2 mg_h3">
            <Tiptap_Editor id='comment' upload={3}/>
            <div className="ta_c pd_t2">
                <button className="bt_modal c_blue" onClick={clickWrite}>댓글 등록</button>
            </div>
        </div>}

        {$ADMIN && <div className='box_orange pd_1 mg_b3'>
            <div className='line w_50'><User_Admin level={user.level}/></div>
            {$ADMIN && <div className='line w_50 ta_r'>
                <button className="bt_modal mg_r1 c_green" onClick={clickCheckAll}>전체 선택</button><button className="bt_modal c_orange" onClick={()=>setModal({admin: true})}>관리</button>
            </div>}
        </div>}

        {list.length ? <div className="board_wrap_list">
            {list.map((e)=> <div key={e.num} className={`comment_list ${boardStyle(e, user)}`}>
                {modal.admin === e.num && <Modal title='⚙️댓글 관리 메뉴' setModal={setModal}><Comment_Popup_Admin checkList={[e.num]} info={info} obj={e} setPage={()=>setPage(!page)} setModal={setModal}/></Modal>}
                {modal.menu === e.num && <Modal title='댓글 메뉴' setModal={setModal}><Comment_Popup_Menu info={info} obj={e} boardState={boardState({ period, count_report, state})} setPage={()=>setPage(!page)} setModal={setModal}/></Modal>}
                {modal.report === e.num  && <Modal title='🚨 신고 (호출)' setModal={setModal}><App_Report target_app={`${app}_comment`} obj={e} setModal={setModal}/></Modal>}
                {modal.profile === e.num && <Modal title='회원 정보' setModal={setModal}><User_Profile target_id={e.user_id} user={user}/></Modal>}

                {e.depth === 1 && <div className="depth_1"></div>}
                {e.depth === 2 && <><div className="depth_1"></div><div className="depth_2"></div></>}

                <div className="w_100">
                    <VIEW_USER obj={e}/><VIEW_MENU obj={{ num: e.num, state: e.state, count_report: e.count_report, user_id: e.user_id}}/>

                    {modal.modify === e.num ? <div className="comment_write pd_1">
                        <Tiptap_Editor id='modify' value={e.note} upload={3}/>
                        <div className="ta_c pd_t1">
                            <button className="bt_modal c_gray" onClick={()=> setModal(false)}>취소</button>
                            <button className="bt_modal c_blue" onClick={(el)=>clickModify(el, e)}>댓글 수정</button>
                        </div>
                    </div> : <VIEW_NOTE obj={e} level={user.level}/>}

                    {modal.reply === e.num && <div className="comment_write pd_2 mg_h1">
                        <Tiptap_Editor id='reply' upload={3}/>
                        <div className="ta_c pd_t2">
                            <button className="bt_modal c_red" onClick={()=> setModal(false)}>취소</button>
                            <button className="bt_modal c_blue" onClick={(el)=> clickReply(el, e)}>답변 등록</button>
                        </div>
                    </div>}

                </div>
            </div>)}
        </div> : <div className="box"><Message><span className="c_lgray fwb">작성된 댓글이 없습니다.</span></Message></div>}

        <Pagination_Click paging={paging} page={setPage}/>
    </div>)
}