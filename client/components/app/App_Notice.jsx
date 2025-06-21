import { useEffect, useState } from "react";
import { useAxios, storeApp, useInput, useModal, View_Char, View_Date, View_Svg, Pagination_Click } from "modules"
import { checkAdmin } from "modules/SYSTEM";
import { checkInputColor, checkInput, $REGEX_GUIDE } from "modules/REGEX";
import { Modal } from "components/app";
import { Board_Info, $BOARD_STATE } from "components/board";
import { Tiptap_Editor, Tiptap_Note, editorCheck } from "components/editor";

export const App_Notice = ({info, user})=>{
    const { app, menu, category } = info;
    const { setPopup, setConfirm } = storeApp((state)=>state)
    const [modal, setModal] = useModal(false)
    const [write, setWrite] = useState(false);
    const [list, setList] = useState([])
    const [paging, setPaging] = useState([])
    const [page, setPage] = useState(1)
    const [input, setInput] = useInput({board_title: ''})
    const $ADMIN = checkAdmin(user.level)
    
    useEffect(()=>{
        const getNotice = async ()=>{
            const $DATA = await useAxios.get(`/app/notice/${app}/${menu}/${category}/${page}`)
            if($DATA) setPaging($DATA.paging), setList($DATA.list)
        }
        getNotice()
    },[page, user])

    const clickWrite = async (e)=>{
        e.target.blur()
        const $CHECK = checkInput(input)
        if($CHECK.code) return setPopup({msg: $CHECK.msg})
        const $EDITOR = editorCheck({type: 'board'})
        if($EDITOR.code) return setPopup($EDITOR)
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post(`/app/notice/write`, { app, menu, category, board_title: input.board_title, editor: $EDITOR.data })
            if($DATA) setWrite(false), setPage(!page)
        }
        setConfirm({msg: `글을 등록하시겠습니까?`, confirm: $CONFIRM})
    }
    const clickModify = async (e, obj)=>{
        e.target.blur()
        const $CHECK = checkInput(input)
        if($CHECK.code) return setPopup({msg: $CHECK.msg})
        const $EDITOR = editorCheck({type: 'board'})
        if($EDITOR.code) return setPopup($EDITOR)
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post(`/app/notice/modify`, { num: obj.num, board_title: input.board_title, target_note: obj.note, editor: $EDITOR.data })
            if($DATA) setModal(false), setPage(!page)
        }
        setConfirm({msg: `글을 수정하시겠습니까?`, confirm: $CONFIRM})
    }
    const clickState = async (num, state)=>{
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/app/notice/state', { check: num, value: state })
            if($DATA) setModal(false), setPage(!page)
        }
        setConfirm({msg: `${Number(state) === 10 ? '게시물을 삭제하겠습니까?' : '상태를 변경하시겠습니까?'}`, confirm: $CONFIRM})
    }
    const Notice_Popup = ({obj})=>{
        return(<>
            <p className='input ellipsis fwb mg_b2'><span className='c_blue'>{obj.title ? obj.title : '제목 없음'}</span></p>
            <p className='input fwb mg_b2'>
                번호&nbsp;{obj.num}<View_Char char='vl'/>{obj.state === 0 ? <span className='c_green'>정상 게시물입니다.</span> : <span className='c_red'>숨겨진 게시물입니다.</span>}
            </p>
            <div className='ta_c'>
                {obj.state === 0 ? 
                    <button className="bt_modal c_gray" onClick={()=>clickState(obj.num, $BOARD_STATE["7_view"])}>숨김</button> :
                    <button className="bt_modal c_green" onClick={()=>clickState(obj.num, $BOARD_STATE["0_normal"])}>표시</button>
                }
                <button className="bt_modal c_blue" onClick={()=>{ setModal({modify: obj.num}); setInput({board_title: obj.title || ''}); }}>수정</button>
                <button className="bt_modal c_red" onClick={()=>clickState(obj.num, $BOARD_STATE["10_delete_data"])}>삭제</button>
            </div>
        </>)
    }

    if(write) return <div className="max_w100">
        <Board_Info info={info}/>
        
        <div className="lh_1 ta_c"><p className="c_orange fwb">글(공지/안내) 쓰기</p></div>

        <p className="lh_1 fs_13 pd_l1">{$REGEX_GUIDE.board_title}</p>
        <input className="input mg_b1" type="text" name="board_title" placeholder="글 제목을 입력해 주세요" onChange={setInput} value={input.board_title}
        onKeyUp={()=>{ checkInputColor('board_title', input.board_title) }}/>

        <div className="pd_h1"><Tiptap_Editor upload={5}/></div>

        <div className="ta_c pd_1">
            <button className="bt_modal c_red" onClick={()=>{ setWrite(false); setInput({board_title: ''}); }}>글쓰기 취소</button>
            <button className="bt_modal c_blue" onClick={clickWrite}>글쓰기 완료</button>
        </div>
    </div>
    return(<div className="max_w100 mg_b2">

        {$ADMIN && <div className="box_orange pd_1 mg_b2">
            <p className="line w_70 pd_l fs_13 c_gray">공지 및 안내사항 {menu === 'guest' && <span className="c_green fwb">(손님 안내문)</span>}</p>
            <p className="line w_30 ta_r"><button className="bt_3 c_orange fwb" onClick={()=>{ setWrite(true); setInput({board_title: ''}); }}>공지 글쓰기</button></p>
        </div>}

        {modal.modify && <p className="lh_1 ta_c fwb mg_b1">글(공지/안내) 수정</p>}

        {list.length ? list.map((e)=> <div key={e.num}>
            {modal.menu === e.num && <Modal title='메뉴' setModal={setModal}><Notice_Popup obj={e} setModal={setModal}/></Modal>}

            {modal.modify === e.num ? <div className="box_blue pd_1 mg_b2">
                <p className="lh_1 fs_13 pd_l1">{$REGEX_GUIDE.board_title}</p>
                <input className="input mg_b1" type="text" name="board_title" placeholder="글 제목을 입력해 주세요" onChange={setInput} value={input.board_title}
                onKeyUp={()=>{ checkInputColor('board_title', input.board_title) }}/>

                <div className="pd_h1"><Tiptap_Editor value={e.note} upload={5}/></div>

                <div className="lh_1 ta_c pd_1">
                    <button className="bt_modal c_red" onClick={()=>setModal(false)}>수정 취소</button>
                    <button className="bt_modal c_blue" onClick={(el)=>clickModify(el, e)}>수정 완료</button>
                </div>
            </div> : <>
                <div className={`${e.state === $BOARD_STATE['7_view'] ? 'box_red state_bg_red' : 'box_lgray'} pd_1 mg_b2`}>
                    <h3 className="lh_1 pd_l c_blue fwb">{e.title}</h3>
                    {$ADMIN && <div className="box_orange pd_1 mg_t1">
                        <div className="line w_80 pd_l">
                            <p className="lh_1 fs_13 c_gray">
                                {e.state === 0 ? <span className='c_green fwb'>표시</span> : <span className='c_red fwb'>숨김</span>}
                                <View_Char char='vl'/>번호 <span className='fwb'>{e.num}</span><View_Char char='vl'/>등록 <View_Date date={e.created}/>
                            </p>
                        </div>
                        <div className='line w_20 ta_r' onClick={()=>setModal({menu: e.num})}><View_Svg name='menu' size={26} color="orange"/></div>
                    </div>}
                    <div className="pd_h1"><hr /></div>
                    <div className="min_h10 pd_w"><Tiptap_Note note={e.note}/></div>
                </div>
            </>}
        </div>) : <div className="box_lgray pd_h3 c_gray ta_c">작성된 공지 및 안내사항이 없습니다.</div>}

        <Pagination_Click paging={paging} page={setPage}/>

    </div>)
}