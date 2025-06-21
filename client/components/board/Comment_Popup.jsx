import { useEffect, useState } from "react";
import { useAxios, storeApp, useInput, storeUser, View_Char, View_Date } from "modules"
import { checkAdmin } from "modules/SYSTEM";
import { $BOARD_STATE, Board_State } from 'components/board';
import { Message } from 'components/app';

// obj: comment
export const Comment_Popup_Admin = ({info, obj, checkList, setCheckList, setPage, setModal})=>{
    const { app, menu, menu_name, category, category_name } = info
    const { setPopup, setConfirm } = storeApp((state)=>state)
    const [input, setInput] = useInput({select: '', state: ''})

    const clickState = async ()=>{
        if(!input.state) return setPopup({msg: '댓글 상태를 선택해 주세요.'})
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/comment/state', { app, check: checkList, value: input.state })
            if($DATA){
                if(setCheckList) setCheckList([])
                return setModal(false), setPage()
            }
        }
        setConfirm({msg: `${(Number(input.state) === 10 ? '댓글을 삭제하겠습니까?' : '댓글 상태를 변경하시겠습니까?')}`, confirm: $CONFIRM})
    }

    if(!checkList.length) return <Message>댓글을 선택해 주세요.</Message>
    return(<>
        {obj ? <>
            <p className='box_input mg_b2 fwb'><span className='c_blue'>{menu_name}<View_Char char='vl'/>{category_name}</span><View_Char char='vl'/>글 {obj.target_num}<View_Char char='vl'/>댓글 {obj.num}</p>
            <p className='box_input mg_b2 align'><Board_State type='popup' obj={{ count_report: obj.count_report, state: obj.state }}/></p>
        </> : <p className='box_input mg_b2'>선택한 댓글 : <span className='c_blue fwb'>{checkList.length}개</span><View_Char char='vl'/>번호 : <span className='c_blue fwb'>{checkList.join(', ')}</span></p>}

        <select className="select_left mg_b2" name="state" onChange={setInput} value={input.state}>
            <option value="">댓글 상태를 선택해 주세요</option>
            {Object.entries($BOARD_STATE).map(([key, value])=>(<option key={value} value={value}>{key}</option>))}
        </select>
        <button className='select_bt c_blue mg_b2' onClick={clickState}>변경</button>
        
        <div className='ta_c'>
            {obj ? <>
                <button className='bt_modal c_gray' onClick={()=>setModal({menu: obj.num})}>뒤로가기 (메뉴)</button>
                <button className='bt_modal c_blue' onClick={()=>setModal({modify: obj.num})}>수정</button>
            </> : <button className='bt_modal c_gray' onClick={()=>setModal({menu: false})}>닫기</button>}
        </div>
    </>)
}
export const Comment_Popup_Menu = ({info, obj, boardState, setPage, setModal})=>{
    const { app, menu_name, category_name, depth } = info, target_app = `${app}_comment`;
    const { count_report, state } = obj;
    const user = storeUser((state)=>state.user)
    const { setPopup, setConfirm } = storeApp((state)=>state)
    const [report, setReport] = useState([])

    const $REPORT = { like: '❤️ 좋아요를 등록한 댓글입니다.', report: '🚨 신고한 댓글입니다.'}

    useEffect(()=>{
        const getReport = async ()=>{
            const $DATA = await useAxios.post('/report/info', { target_app, target_num: obj.num })
            if($DATA) return setReport($DATA.info)
        }
        getReport()
    },[obj.num, target_app])

    const clickLike = async ()=>{ // 좋아요
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/report/like', { type: 'like', target_app, target_num: obj.num, target_id: obj.user_id })
            if($DATA) return setModal(false), setPage()
        }
        setConfirm({msg: '좋아요를 등록하시겠습니까?', confirm: $CONFIRM})
    }
    const clickDelete = async ()=>{
        if(obj.user_id !== user.id) return setPopup({msg: '글쓴이가 아닙니다.'})
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/comment/delete', { app, num: obj.num, target_num: obj.target_num, order_sort: obj.order_sort })
            if($DATA) return setModal(false), setPage()
        }
        setConfirm({msg: '댓글을 삭제하겠습니까?', confirm: $CONFIRM})
    }
    
    return(<>
        <p className='box_input mg_b2 fwb'><span className='c_blue'>{menu_name}<View_Char char='vl'/>{category_name}</span><View_Char char='vl'/>{obj.num}</p>
        <p className='box_input mg_b2 align'><Board_State type='popup' obj={{ count_report, state }}/></p>
        <p className='box_input mg_b2'>등록 <span className="c_blue">{obj.created.substring(2,16)}</span> ( <View_Date date={obj.created}/> )</p>
        {obj.updated && <p className='input mg_b2'>수정 <span className="c_green">{obj.updated.substring(2,16)}</span> ( <View_Date date={obj.updated}/> )</p>}
        
        {report.map((e, i)=> <p key={i} className='input mg_b2'>{$REPORT[e.type]} ( <View_Date date={e.created}/> )</p>)}

        <div className='ta_c'>
            {obj.user_id === user.id ? <>
                {boardState < $BOARD_STATE['3_period_end'] && <>
                    <button className='bt_modal c_blue' onClick={()=>setModal({modify: obj.num})}>수정</button>
                    <button className='bt_modal c_red' onClick={clickDelete}>삭제</button>
                </>}
            </> : <>
                <button className='bt_modal c_blue' onClick={clickLike}>{report.find((e)=> e.type === 'like') ? '좋아요 ❌' : '❤️ 좋아요'}</button>
                {obj.depth < depth && obj.state < $BOARD_STATE["6_report"] && <button className='bt_modal c_blue mg_r1' onClick={()=>setModal({reply: obj.num})}>답글</button>}
                {!report.find((e)=> e.type === 'report') && <button className='bt_modal c_red' onClick={()=>setModal({report: obj.num})}>신고</button>}
            </>}
            {checkAdmin(user.level) && <button className='bt_modal c_orange mg_l1' onClick={()=>setModal({admin: obj.num})}>⚙️관리</button>}
        </div>
    </>)
}
export const Comment_Event_Menu = ({info, obj, setPage, selectModify, setModal})=>{
    const { app } = info
    const user = storeUser((state)=>state.user)
    const { setPopup, setConfirm } = storeApp((state)=>state)

    const clickDelete = async ()=>{
        if(obj.user_id !== user.id) return setPopup({msg: '글쓴이가 아닙니다.'})
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/comment/event/delete', { app, num: obj.num })
            if($DATA) return setModal(false), setPage()
        }
        setConfirm({msg: '댓글(입찰)을 삭제하겠습니까?', confirm: $CONFIRM})
    }

    return(<div className='ta_c'>
        {obj.user_id === user.id ? <>
            <button className='bt_modal c_blue' onClick={()=>selectModify(obj.num, obj.price)}>수정</button>
            <button className='bt_modal c_red' onClick={clickDelete}>삭제</button>
        </> : checkAdmin(user.level) && <>
            <button className='bt_modal c_orange mg_r1' onClick={()=>setModal({reply: obj.num})}>답글</button>
            <button className='bt_modal c_orange mg_l1' onClick={()=>setModal({admin: obj.num})}>⚙️관리</button>
        </>}
    </div>)
}