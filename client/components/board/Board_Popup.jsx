import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAxios, storeApp, useInput, storeUser, View_Char, View_Date } from "modules"
import { checkAdmin } from 'modules/SYSTEM';
import { Message } from "components/app";
import { $BOARD_STATE, Board_State, boardState } from 'components/board';

// obj: read
export const Board_Popup_Admin = ({info, obj, checkList, setCheckList, setModify, setModal})=>{ // obj: read
    const { app, menu_name, category_name } = info;
    const { info: $INFO, setPopup, setConfirm } = storeApp.getState()
    const { refresh, replace } = useRouter()
    const [input, setInput] = useInput({select: '', state: ''})
    
    const clickMove = async ()=>{
        if(!input.select) return setPopup({msg: '이동 위치를 선택해 주세요.'})
        const $SELECT = JSON.parse(input.select)
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post(`/board/move`, { ...JSON.parse(input.select), check: checkList })
            if($DATA) return replace(obj ? `/${app}/read/${$SELECT.menu}/${$SELECT.category}/${obj.num}` : `/${app}/list/${$SELECT.menu}/${$SELECT.category}/1`)
        }
        setConfirm({msg: '이동하시겠습니까?', confirm: $CONFIRM})
    }
    const clickState = async ()=>{
        if(!input.state) return setPopup({msg: '게시물 상태를 선택해 주세요.'})
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/board/state', { app, check: checkList, value: input.state })
            if($DATA){
                if(setCheckList) setCheckList([])
                if(obj && Number(input.state) === $BOARD_STATE['10_delete_data']) replace(`/${app}/list/${obj.menu}/${obj.category}/1`)
                return setModal(false), refresh()
            }
        }
        setConfirm({msg: `${(Number(input.state) === 10 ? '게시물을 삭제하겠습니까?' : '상태를 변경하시겠습니까?')}`, confirm: $CONFIRM})
    }

    if(!checkList.length) return <Message>게시물을 선택해 주세요.</Message>
    return(<>
        {obj ? <>
            <p className='input mg_b2 fwb'><span className='c_blue'>{menu_name}<View_Char char='vl'/>{category_name}</span><View_Char char='vl'/>{obj.num}</p>
            <p className='input mg_b2 align'><Board_State type='popup' obj={{ period: obj.period, count_report: obj.count_report, state: obj.state }}/></p>
            <p className='input ellipsis mg_b2'><span className='c_green fwb'>{obj.title}</span></p>
        </> : <>
            <p className='input mg_b2 fwb'><span className='c_blue'>{menu_name}<View_Char char='vl'/>{category_name}</span></p>
            <p className='input mg_b2'>선택한 게시물 : <span className='c_blue fwb'>{checkList.length}개</span><View_Char char='vl'/>번호 : <span className='c_blue fwb'>{checkList.join(', ')}</span></p>
        </>}

        <select className="select_left mg_b2" name="select" onChange={setInput} value={input.select}>
            <option value="">이동 위치를 선택해 주세요</option>
            {$INFO.map((e)=> e.app_type !== 'menu' && e.app === app && <option key={e.num} value={`{"app": "${e.app}", "menu": "${e.menu}", "category": "${e.category}"}`}>[{e.app}] {e.menu_name} / {e.category_name} ( {e.app} / {e.menu} / {e.category} )</option> )}
        </select>
        <button className='select_bt c_green mg_b2' onClick={clickMove}>이동</button>

        <select className="select_left mg_b2" name="state" onChange={setInput} value={input.state}>
            <option value="">게시물 상태를 선택해 주세요</option>
            {Object.entries($BOARD_STATE).map(([key, value])=>(<option key={value} value={value}>{key}</option>))}
        </select>
        <button className='select_bt c_blue mg_b2' onClick={clickState}>변경</button>

        <div className='ta_c'>
            {obj ? <>
                <button className='bt_modal c_gray' onClick={()=>setModal({menu: true})}>뒤로가기 (메뉴)</button> 
                <button className='bt_modal c_orange' onClick={()=>setModify(true)}>⚙️수정</button>
            </> : <button className='bt_modal c_gray' onClick={()=>setModal({menu: false})}>닫기</button>}
        </div>
    </>)
}
export const Board_Popup_Menu = ({info, obj, setModify, setModal})=>{
    const { app, menu, menu_name, category, category_name } = info, target_app = app;
    const { num, period, count_report, state } = obj;
    const user = storeUser((state)=>state.user)
    const { setPopup, setConfirm } = storeApp.getState()
    const { refresh, replace } = useRouter()
    const [report, setReport] = useState([])
    const $REPORT = { like: '❤️ 좋아요를 등록한 글입니다.', report: '🚨 신고한 글입니다.'}

    useEffect(()=>{
        const getReport = async ()=>{
            const $DATA = await useAxios.post('/report/info', { target_app, target_num: obj.num })
            if($DATA) setReport($DATA.info)
        }
        getReport()
    },[obj.num, target_app])
    
    const clickLike = async ()=>{ // 좋아요
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/report/like', { type: 'like', target_app, target_num: obj.num, target_id: obj.user_id })
            if($DATA) return setModal(false), refresh()
        }
        setConfirm({msg: '좋아요를 등록하시겠습니까?', confirm: $CONFIRM})
    }
    const clickDelete = async ()=>{
        if(obj.user_id !== user.id) return setPopup({msg: '글쓴이가 아닙니다.'})
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post(`/board/delete`, { app, num: obj.num })
            if($DATA){
                setModal(false), replace(`/${app}/list/${menu}/${category}/1`)
                refresh()
            }
        }
        setConfirm({msg: `글을 삭제하시곘습니까?`, confirm: $CONFIRM})
    }

    return(<>
        <p className='input mg_b2 fwb'><span className='c_blue'>{menu_name}<View_Char char='vl'/>{category_name}</span><View_Char char='vl'/>{obj.num}</p>
        <p className='input ellipsis mg_b2'><span className='c_green fwb'>{obj.title}</span></p>
        <p className='input mg_b2 align'><Board_State type='popup' obj={{ period, count_report, state }}/></p>

        {report.map((e, i)=> <p key={i} className='input mg_b2'>{$REPORT[e.type]} ( <View_Date date={e.created}/> )</p>)}

        <div className='ta_c'>
            {obj.user_id === user.id ? <>
                {boardState({period, count_report, state}) < $BOARD_STATE['3_period_end'] && <>
                    <button className='bt_modal c_blue' onClick={()=>setModify(true)}>수정</button>
                    <button className='bt_modal c_red' onClick={clickDelete}>삭제</button>
                </>}
            </> : <>
                <button className='bt_modal c_blue' onClick={clickLike}>{report.find((e)=> e.type === 'like') ? '❌ 좋아요 삭제' : '❤️ 좋아요'}</button>
                {!report.find((e)=> e.type === 'report') && <button className='bt_modal c_red' onClick={()=>setModal({report: true})}>신고</button>}
            </>}
            {checkAdmin(user.level) && <button className='bt_modal c_orange' onClick={()=>setModal({admin: true})}>⚙️관리</button>}
        </div>
    </>)
}