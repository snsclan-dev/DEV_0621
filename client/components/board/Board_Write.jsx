import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAxios, storeApp, useInput, useModal, View_Char, View_Price_Won, View_Price, Date_Picker } from "modules";
import { checkManager, onClickImage, onErrorImage } from "modules/SYSTEM";
import { $REGEX_GUIDE, checkInput, checkInputColor } from "modules/REGEX";
import { Modal, Modal_Image } from "components/app";
import { Board_Info, $BOARD_STATE, Board_Upload } from "components/board";
import { editorCheck, Tiptap_Editor } from "components/editor";

export const Board_Write = ({info, user})=>{
    const { app, menu, category } = info
    const { setConfirm, setPopup } = storeApp((state)=>state)
    const refNotice = useRef()
    const { replace } = useRouter()
    const [modal, setModal] = useModal(false)
    const [input, setInput] = useInput({board_title: '', image: '', price: '', period: '', tag: ''})
    const $MANAGER = checkManager(user.level)

    const clickWrite = async (e)=>{
        e.target.blur()
        const $CHECK = checkInput(input)
        if($CHECK.code) return setPopup({msg: $CHECK.msg})
        const $EDITOR = editorCheck({type: 'board'})
        if($EDITOR.code) return setPopup($EDITOR)
        const $CONFIRM = async ()=>{
            setConfirm(null)
            const $DATA = await useAxios.post(`/board/write`, { ...input, app, menu, category, editor: $EDITOR.data, state: refNotice.current?.checked ? $BOARD_STATE["1_notice"] : 0 })
            if($DATA) setTimeout(()=>{ replace(`/${app}/read/${menu}/${category}/${$DATA.num}`) }, 600)
        }
        setConfirm({msg: '글을 등록하시겠습니까?', confirm: $CONFIRM})
    }
    const clickDelete = ()=>{ setInput({image: ''}) }

    return(<div className="max_w100 pd_w1">
        {modal.image && <Modal_Image src={modal.image} setModal={setModal}/>}
        {modal.upload && <Modal title='대표 이미지 등록' setModal={setModal}><Board_Upload setInput={setInput} setModal={setModal}/></Modal>}

        <Board_Info info={info}/>
        <div className="pd_h1 ta_c mg_b2"><p className="fwb">글쓰기</p></div>

        <p className="lh_1 fs_13 pd_l1">{$REGEX_GUIDE.board_title}</p>
        <input className="input mg_b2" type="text" name="board_title" placeholder="글 제목을 입력해 주세요" onChange={setInput} value={input.board_title}
        onKeyUp={()=>{ checkInputColor('board_title', input.board_title) }}/>
        
        <div className="flex box pd_2 mg_b2">
            <div className={`${!input.image && 'bg'} box upload_preview`}>
                {input.image && <img src={input.image} alt="preview" onClick={(e)=>onClickImage(e, setModal)} onError={onErrorImage}/>}
            </div>
            <div className="upload_box pd_l2">
                <div className="ta_c">
                    <button className="bt_4m c_red" onClick={clickDelete}>삭제</button>
                    <button className="bt_4m c_blue mg_l1" onClick={()=>setModal({upload: true})}>대표 이미지 등록</button>
                </div>
            </div>
        </div>

        {$MANAGER && <div className="box_orange pd_w1 mg_b2">
            <p className="lh_1 fs_13 pd_l1"><span id="price">{$REGEX_GUIDE.price}</span></p>
            <p className="lh_1 pd_l1"><span className='c_red'><View_Price price={input.price}/></span>&nbsp;(&nbsp;<View_Price_Won price={input.price}/>&nbsp;)</p>
            <input className="input mg_b2" type="text" name="price" maxLength={8} placeholder="숫자만 입력해 주세요" onChange={setInput} value={input.price} onKeyUp={()=>{ checkInputColor('price', input.price) }}/>

            <p className="lh_1 fs_13 pd_l1">{$REGEX_GUIDE.period}</p>
            <Date_Picker setInput={setInput}/>
        </div>}

        <div className="pd_h1"><Tiptap_Editor upload={5}/></div>

        <p className="lh_1 fs_13 pd_l1 mg_t2">{$REGEX_GUIDE.tag}</p>
        <input className="input mg_b2" type="text" name="tag" maxLength={50} placeholder="태그를 입력해 주세요" onChange={setInput} value={input.tag} onKeyUp={()=>{ checkInputColor('tag', input.tag) }}/>

        <div className="pd_h2 ta_c">
            {$MANAGER && <><input ref={refNotice} id='checkbox' type="checkbox" className="input_check"/><label htmlFor="checkbox">공지</label><View_Char char='vl'/></>}
            <button className="bt_4m c_blue" onClick={clickWrite}>글쓰기 완료</button>
            <Link href={`/${app}/list/${menu}/${category}/1`}><button className="bt_4m mg_l1 c_gray">취소 (목록)</button></Link>
        </div>
    </div>)
}