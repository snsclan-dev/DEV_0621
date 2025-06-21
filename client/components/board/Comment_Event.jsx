import React, { useEffect, useState } from "react";
import { useAxios, storeUser, useModal, storeApp, Pagination_Click, View_Svg, View_Char, View_Date, useInput, View_Price, View_Price_Won, checkInputColor, checkInput, View_Timer } from "modules";
import { checkAdmin, checkManager, clickScroll, dateNow } from "modules/SYSTEM";
import { Message, Modal } from "components/app";
import { User_Admin, User_Id, User_Ip, User_Level, User_Profile, User_Tag } from "components/user";
import { $BOARD_STATE, Comment_Popup_Admin, boardStyle, Comment_Event_Menu } from "components/board";
import { Tiptap_Editor, Tiptap_Note, editorCheck } from "components/editor";

const VIEW_NOTE = React.memo(({obj})=>{ // note
    return(<div className="pd_1">
        {!obj.depth && <p className="mg_b1">
            <button className="bt_2m"><View_Price_Won price={obj.price}/></button>{obj.state === $BOARD_STATE["4_price"] && <button className="bt_2m c_pink">구매(낙찰) 성공!</button>}
        </p>}
        <Tiptap_Note type='comment' note={obj.note}/>
    </div>)
})
VIEW_NOTE.displayName = 'VIEW_NOTE';

export const Comment_Event = ({info, read})=>{
    const { app, app_type } = info, { period } = read;
    const { setPopup, setConfirm } = storeApp((state)=>state)
    const { user } = storeUser.getState()
    const [input, setInput] = useInput({price: ''})
    const [modal, setModal] = useModal(false)
    const [list, setList] = useState([])
    const [paging, setPaging] = useState([])
    const [page, setPage] = useState(1)
    const [checkList, setCheckList] = useState([])
    const $ADMIN = checkAdmin(user.level), $MANAGER = checkManager(user.level)
    const $PERIOD = app_type === 'event' && !read.period || new Date(read.period) >= new Date(dateNow());
    const $COMMENT = !modal.modify && user.id && read.user_id !== user.id && read.state === $BOARD_STATE["0_normal"] && $PERIOD
    // const $COMMENT = true ///

    useEffect(()=>{
        const getComment = async ()=>{
            const $DATA = await useAxios.get(`/comment/${app}/list/${read.num}/${page}`, { app_type })
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
        if(!$ADMIN && list.length) return setPopup({ msg: '댓글(입찰)은 한번만 가능합니다.\n등록한 댓글(입찰)을 삭제한 후 등록해 주세요.'})
        const $PRICE = checkInput({price_input: input.price})
        if($PRICE.code) return setPopup($PRICE)
        if(Number(read.price) > Number(input.price)) return setPopup({msg: '입찰 : 최소 금액보다 높거나 같아야 합니다.'})
        const $EDITOR = editorCheck({type: 'event', selector: '#comment', line: 10})
        if($EDITOR.code) return setPopup($EDITOR)
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/comment/event/write', { app, target_num: read.num, target_id: read.user_id, read_price: read.price, input_price: input.price, editor: $EDITOR.data })
            if($DATA) return setInput({price: ''}), $EDITOR.editor.clearContent(), setPage(!page), clickScroll('bottom')
        }
        setConfirm({msg: '댓글(입찰)을 등록하시겠습니까?', confirm: $CONFIRM})
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
    const selectModify = (num, price)=>{
        setInput({price: price}), setModal({modify: num})
    }
    const clickModify = async (e, obj)=>{
        e.target.blur()
        const $EDITOR = editorCheck({type: 'event', selector: '#modify'})
        if($EDITOR.code) return setPopup($EDITOR)
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/comment/event/modify', { app, num: obj.num, target_note: obj.note, read_price: read.price, input_price: input.price, editor: $EDITOR.data})
            if($DATA){
                setTimeout(()=>{
                    setModal(false)
                    return setPage(!page)
                }, 600)
            }
        }
        setConfirm({msg: '댓글(입찰)을 수정하시겠습니까?', confirm: $CONFIRM})
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
                <label htmlFor={`check_${obj.num}`} className='fs_13 c_gray'>번호 <span className="c_black">{obj.num}</span><View_Char char='vl'/>
                {obj.updated ? <><View_Date date={obj.updated}/>&nbsp;<span className="c_gray">(수정)</span></> : <View_Date date={obj.created}/>}
                </label>
            </p>
        </div>)
    }
    const VIEW_MENU = ({obj})=>{
        const { num, state, user_id } = obj
        if(!$ADMIN){
            if(!user.id) return null;
            if(state === $BOARD_STATE["3_period_end"] || period && period < dateNow()) return null
        }
        return(<div className='line w_10 lh_2 ta_r pd_r1' onClick={()=>setModal({menu: num})}>
            {($ADMIN || obj.user_id === user.id) && <View_Svg name='menu' size={24} color={user_id === user.id ? "blue" : "lgray"}/>}
        </div>)
    }

    return(<div className="pd_h5">
        {modal.admin === true && <Modal title='⚙️댓글 목록 관리' setModal={setModal}><Comment_Popup_Admin info={info} checkList={checkList} setCheckList={setCheckList} setPage={()=>setPage(!page)} setModal={setModal} /></Modal>}

        {info.app_type === 'event' && (read.price || read.period) && <div className='box bg pd_1 mg_h2 ta_c'>
            {read.price && <button className="bt_3m fs_15"><View_Price_Won price={read.price}/></button>}
            {read.period && <button className="bt_3m fs_15"><View_Timer time={read.period}/></button>}
        </div>}

        {/* comment event write */}
        {$COMMENT && <div className="box pd_2 mg_h3">
            <div className="mg_b2">
                <p className="lh_1 fs_13 pd_l c_pink fwb">🔒 댓글(입찰)은 공개되지 않습니다.</p>
                <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">입찰(구매) : </span><span id="price_input" className="c_gray">구매를 원하시면 금액을 입력해 주세요.</span></p>
                <p className="lh_1 pd_l1"><span className='c_red'><View_Price price={input.price}/></span>&nbsp;(&nbsp;<View_Price_Won price={input.price}/>&nbsp;)</p>
                <input className="input mg_b2" type="number" name="price" maxLength={8} placeholder="숫자만 입력해 주세요" onChange={setInput} value={input.price} onKeyUp={()=>{ checkInputColor('price_input', input.price) }}/>
            </div>
            <Tiptap_Editor id='comment' upload={3}/>
            <div className="ta_c pd_t2">
                <button className="bt_modal c_blue" onClick={clickWrite}>댓글(입찰) 등록</button>
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
                {modal.menu === e.num && <Modal title='댓글(입찰) 메뉴' setModal={setModal}><Comment_Event_Menu info={info} obj={e} setPage={()=>setPage(!page)} selectModify={selectModify} setModal={setModal}/></Modal>}
                {modal.profile === e.num && <Modal title='회원 정보' setModal={setModal}><User_Profile target_id={e.user_id} user={user}/></Modal>}

                {e.depth === 1 && <div className="depth_1"></div>}
                {e.depth === 2 && <><div className="depth_1"></div><div className="depth_2"></div></>}

                <div className="w_100">
                    <VIEW_USER obj={e}/><VIEW_MENU obj={{ num: e.num, state: e.state, count_report: e.count_report, user_id: e.user_id}}/>

                    {modal.modify === e.num ? <div className="comment_write pd_1">
                        {!e.depth && <div className="mg_b2">
                            <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">입찰 : </span><span id="price_input" className="c_gray">입찰(구매) 금액을 입력해 주세요.</span></p>
                            <p className="lh_1 pd_l1"><span className='c_red'><View_Price price={input.price}/></span>&nbsp;(&nbsp;<View_Price_Won price={input.price}/>&nbsp;)</p>
                            <input className="input mg_b2" type="number" name="price" maxLength={8} placeholder="숫자만 입력해 주세요" onChange={setInput} value={input.price} onKeyUp={()=>{ checkInputColor('price_input', input.price) }}/>
                        </div>}
                        <Tiptap_Editor id='modify' value={e.note} upload={3}/>
                        <div className="ta_c pd_t1">
                            <button className="bt_modal c_gray" onClick={()=> setModal(false)}>취소</button>
                            <button className="bt_modal c_blue" onClick={(el)=>clickModify(el, e)}>댓글(입찰) 수정</button>
                        </div>
                    </div> : <VIEW_NOTE obj={e}/>}

                    {$ADMIN && modal.reply === e.num && <div className="comment_write pd_2 mg_h1">
                        <Tiptap_Editor id='reply' upload={3}/>
                        <div className="ta_c pd_t2">
                            <button className="bt_modal c_red" onClick={()=> setModal(false)}>취소</button>
                            <button className="bt_modal c_blue" onClick={(el)=> clickReply(el, e)}>답변 등록</button>
                        </div>
                    </div>}

                </div>
            </div>)}
        </div> : $MANAGER && <div className="box_orange"><Message><span className="c_lgray fwb">댓글(입찰)이 없습니다.</span></Message></div>}

        <Pagination_Click paging={paging} page={setPage}/>
    </div>)
}