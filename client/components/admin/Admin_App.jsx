'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { storeApp, useAxios, View_Char, useInput } from "modules"
import { clickScroll } from "modules/SYSTEM"

export const Admin_App = ()=>{
    const { setPopup, setConfirm } = storeApp((state)=>state)
    const { refresh } = useRouter()
    const [info, setInfo] = useState([])
    const $FIND = info.find((e)=>{ return e.num === 0 }); // 메뉴 양식 0번
    const [input, setInput] = useInput($FIND)

    useEffect(()=>{
        const getInfo = async ()=>{
            const $DATA = await useAxios.get('/admin/menu')
            if($DATA) setInfo($DATA.info)
        }
        getInfo()
    }, [])

    const clickRefresh = async ()=>{
        const $DATA = await useAxios.get('/admin/menu')
        if($DATA) setInfo($DATA.info)
    }
    const clickApp = async ()=>{
        await useAxios.get('/admin/update/info')
    }
    const clickSelect = (obj)=>{ setInput({...obj, select: obj.num}), clickScroll('top') }
    const clickAdd = ()=>{ setInput({...$FIND, num: '', select: 'add'}) }
    const clickCreate = async ()=>{
        if(!input.num) return setPopup({msg: '메뉴 번호를 입력해 주세요.'})
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post(`/admin/menu/create`, input)
            if($DATA) clickRefresh(), setInput({select: false})
        }
        setConfirm({msg: '메뉴을 추가하시겠습니까?', confirm: $CONFIRM})
    }
    const clickModify = async ()=>{
        if(input.num === 0) return setPopup({msg: '0번은 수정이 불가능합니다.'})
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post(`/admin/menu/modify`, input)
            if($DATA) clickRefresh(), setInput({select: false})
        }
        setConfirm({msg: `${input.num}번 메뉴을 수정하시겠습니까?`, confirm: $CONFIRM})
    }
    const clickDelete = async ()=>{
        if(input.num === 0) return setPopup({msg: '0번은 삭제가 불가능합니다.'})
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post(`/admin/menu/delete`, { num: input.num })
            if($DATA) clickRefresh(), setInput({select: false})
        }
        setConfirm({msg: `${input.num}번 메뉴을 삭제하시겠습니까?`, confirm: $CONFIRM})
    }
    const $STATE = { 0: '표시', 1: '댓글 숨김', 7: '메뉴 숨김' }
    const $INPUT_FIELD = [ // state 0: 정상, 1: 댓글 숨김, 7: 메뉴 숨김
        { label: '번호', name: 'num' }, { label: '앱(라우터)', name: 'app' }, { label: '앱 타입(메뉴)', name: 'app_type' }, { label: '앱 이름(메뉴)', name: 'app_name' },
        { label: '메뉴', name: 'menu' }, { label: '메뉴 이름', name: 'menu_name' }, { label: '카테고리', name: 'category' }, { label: '카테고리 이름', name: 'category_name' },
        { label: '메뉴 설명', name: 'note' },
        { label: '작성 등급', name: 'level_create' }, { label: '읽기 등급', name: 'level_read' }, { label: '댓글 (0~2)', name: 'depth' }, { label: '표시 (0/1/7)', name: 'state' }
    ]
    const VIEW_INPUT = (fields) => {
        return fields.map((field, index) => (
            <div key={index} className={`grid_${field.name}`}>
                <p className="ta_c">{field.label}</p>
                <input className="input" type="text" name={field.name} onChange={setInput} value={input[field.name]?.toString() || ''}/>
            </div>
        ))
    }

    return(<>
        <div className="pd_h1 ta_c"><p className="fwb">메뉴 관리 및 수정</p></div>
        {input && <>
            <p className="c_green fwb pd_h2">선택한 게시판</p>
            <div className="admin_grid mg_b2">{VIEW_INPUT($INPUT_FIELD)}</div>
            <div className="ta_c pd_h1">
                {input.select === 'add' ? <>
                    <button className="bt_3m c_gray mg_l1" onClick={()=>setInput({select: false})}>취소</button>
                    <button className="bt_3m c_blue mg_l1" onClick={clickCreate}>게시판 생성</button>
                </> : <>
                    <button className="bt_3m c_blue" onClick={clickCreate}>추가</button>
                    <button className="bt_3m c_blue" onClick={clickModify}>수정</button>
                    <button className="bt_3m c_red mg_l1" onClick={clickDelete}>삭제</button>
                </>}
            </div>
        </>}

        <div className="pd_h1"><hr /></div>
        <div className="ta_c pd_h1">
            <button className="bt_3m c_blue" onClick={clickAdd}>게시판 추가</button>
            <button className="bt_3m c_blue" onClick={clickApp}>메뉴 업데이트</button>
        </div>

        <p className="c_green fwb pd_h2">수정할 게시판을 선택해 주세요.</p>

        {info.map((e)=>
            <div key={e.num} className={`box pd_1 mg_b2 ${e.app_type === 'menu' && 'bg'} ${e.state > 0 && 'bg_red'}`} onClick={()=>clickSelect(e)}>
                <p className="lh_1">
                    번호 : <span className="c_blue fwb">{e.num}</span><View_Char char='vl'/>앱(라우터) : <span className="c_blue fwb">{e.app}</span><View_Char char='vl'/>앱(메뉴) 이름 : <span className="c_blue fwb">{e.app_name}</span>
                </p>
                <p className="lh_1">
                    메뉴(이름) : <span className="c_blue fwb">{e.menu}</span> (<span className="c_blue fwb">{e.menu_name}</span>)<View_Char char='vl'/>
                    카테고리(이름) : <span className="c_blue fwb">{e.category}</span> (<span className="c_blue fwb">{e.category_name || '-'}</span>)
                </p>
                <p className="lh_1">메세지 : <span className="c_blue fwb">{e.note}</span></p>
                <p className="lh_1">
                    작성 등급 : <span className="c_blue fwb">{e.level_create}</span><View_Char char='vl'/>
                    읽기 등급 : <span className="c_blue fwb">{e.level_read}</span><View_Char char='vl'/>
                    댓글 단계 : <span className="c_blue fwb">{e.depth}</span><View_Char char='vl'/>
                    상태 : <span className={`${e.state === 0 ? 'c_green' : 'c_red'} fwb`}>{$STATE[e.state]}</span>
                </p>
            </div>
        )}
    </>)
}