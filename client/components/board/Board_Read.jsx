import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAxios, storeApp, useInput, useModal, View_Count, View_Svg, View_Char, Date_Picker, View_Price, View_Price_Won, View_Timer } from "modules"
import { checkAdmin, checkManager, onClickImage, onErrorImage } from "modules/SYSTEM";
import { checkInputColor, checkInput, $REGEX_GUIDE } from "modules/REGEX";
import { Modal, Modal_Image, App_Report } from "components/app";
import { User_Level, User_Profile, User_Tag } from "components/user";
import { Board_Info, Board_Popup_Admin, Board_Popup_Menu, Board_State, Board_Tag, Board_Upload, $BOARD_STATE } from "components/board";
import { Tiptap_Editor, Tiptap_Note, editorCheck } from "components/editor";

export const Board_Read = ({info, read, user})=>{
    const { app } = info, { period, count_report, state, user_position, user_title, user_tag } = read;
    const refNotice = useRef()
    const { refresh } = useRouter()
    const { setPopup, setConfirm } = storeApp.getState()
    const [modify, setModify] = useState(false)
    const [modal, setModal] = useModal(false)
    const $READ = Object.entries(read).reduce((acc, [key, value])=>{
        acc[key] = value === null ? '' : value
        return acc
    }, {})
    const $INPUT = { num: read.num, board_title: $READ.title, image: $READ.image, price: $READ.price, period: $READ.period, link: $READ.link, tag: $READ.tag }
    const [input, setInput] = useInput($INPUT)
    const $ADMIN = checkAdmin(user.level), $MANAGER = checkManager(user.level)

    const clickProfile = ()=>{
        if(user.id) return setModal({profile: true})
    }
    const clickModify = async (e)=>{
        e.target.blur()
        if(!$ADMIN && read.user_id !== user.id) return setPopup({msg: '작성자가 아니거나 로그인이 필요합니다.'});
        const $CHECK = checkInput(input)
        if($CHECK.code) return setPopup({msg: $CHECK.msg})
        const $EDITOR = editorCheck({type: 'board'})
        if($EDITOR.code) return setPopup($EDITOR)
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post(`/board/modify`, { // type: board
                ...input, app, user_id: user.id, image: input.image, target_image: read.image, editor: $EDITOR.data, target_note: read.note, state: refNotice.current?.checked ? $BOARD_STATE["1_notice"] : 0
            })
            if($DATA){
                setTimeout(()=>{
                    setModal(false), setModify(false)
                    return refresh()
                }, 600)
            }
        }
        setConfirm({msg: '글을 수정하시겠습니까?', confirm: $CONFIRM})
    }
    const clickClose = ()=>{ setModify(false), setModal(false) }
    const clickDelete = ()=>{ setInput({image: ''}) }

    if(modify) return(<div className="pd_h1">
        {modal.image && <Modal_Image src={modal.image} setModal={setModal}/>}
        {modal.upload && <Modal title='대표 이미지 등록' setModal={setModal}><Board_Upload setInput={setInput} setModal={setModal}/></Modal>}

        <Board_Info info={info}/>
        <div className="pd_h1 ta_c"><p className="fwb">글 수정</p></div>

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

        <div className="pd_h1"><Tiptap_Editor value={read.note} upload={5}/></div>

        <p className="lh_1 fs_13 pd_l1 mg_t2">{$REGEX_GUIDE.link}</p>
        <input className="input mg_b2" type="text" name="link" maxLength={100} placeholder="링크(URL)를 입력해 주세요" onChange={setInput} value={input.link} onKeyUp={()=>{ checkInputColor('link', input.link) }}/>

        <p className="lh_1 fs_13 pd_l1 mg_t2">{$REGEX_GUIDE.tag}</p>
        <input className="input mg_b2" type="text" name="tag" maxLength={50} placeholder="태그를 입력해 주세요" onChange={setInput} value={input.tag} onKeyUp={()=>{ checkInputColor('tag', input.tag) }}/>

        <div className="ta_c pd_h1">
            {checkManager(user.level) && <>
                <input ref={refNotice} id='checkbox' className="input_check" type="checkbox" defaultChecked={read.notice === 1 ? true : false}/>
                <label htmlFor="checkbox">공지</label><View_Char char='vl'/>
            </>}
            <button className="bt_4m c_red" onClick={clickClose}>취소</button>
            <button className="bt_4m mg_l1 c_blue" onClick={clickModify}>글 수정 완료</button>
        </div>
    </div>)
    return(<div className="pd_h1">
        {modal.admin && <Modal title='⚙️글 관리 메뉴' setModal={setModal}><Board_Popup_Admin checkList={[read.num]} info={info} obj={read} setModify={setModify} setModal={setModal}/></Modal>}
        {modal.menu && <Modal title='글 메뉴' setModal={setModal}><Board_Popup_Menu info={info} obj={read} setModify={setModify} setModal={setModal}/></Modal>}
        {modal.report && <Modal title='🚨 신고 (호출)' setModal={setModal}><App_Report target_app={app} obj={read} setModal={setModal}/></Modal>}
        {modal.profile && <Modal title='회원 정보' setModal={setModal}><User_Profile target_id={read.user_id} user={user}/></Modal>}
        
        <Board_Info info={info}/>

        <div className="box pd_1 mg_b2 cursor" onClick={clickProfile}>
            <User_Level level={read.level}/><span className="c_gray pd_l fwb">{read.name}</span>
            <div className="lh_2"><User_Tag type='line' obj={{ user_position, user_title, user_tag }}/></div>
        </div>
        
        <Board_State type='read' obj={{ period, count_report, state }}/>

        <div className="pd_w1">
            <h1 className="lh_1 fs_15 fwb mg_b1">{read.title}</h1>
            <p className="lh_1 fs_13 c_gray">
                등록 <span className="c_black">{read.created.substring(2, 16)}</span>{read.updated && <><View_Char char='vl'/>수정 <span className="c_green">{read.updated.substring(2, 16)}</span></>}
            </p>
            <div className='line w_90 fs_13 c_gray'>
                번호 <span className="fwb">{read.num}</span><View_Char char='vl'/>
                댓글 <View_Count count={read.comment}/><View_Char char='vl'/>좋아요 <View_Count count={read.count_like}/><View_Char char='vl'/>조회 <View_Count type='hit' count={read.count_hit}/>
            </div>
            {user.id && <div className='line w_10 ta_r' onClick={()=>setModal({menu: true})}><View_Svg name='menu' size={30} color={read.user_id === user.id ? "blue" : "lgray"}/></div>}
            
            {read.link && <Link href={read.link} target="_blank"><p className="lh_1 c_green"><View_Svg name='link'/>&nbsp;{read.link}</p></Link>}
        </div>

        <div className="pd_h1"><hr /></div>

        {info.app_type === 'event' && (read.price || read.period) && <div className='box bg pd_1 mg_h1 ta_c'>
            {read.price && <button className="bt_3m fs_15"><View_Price_Won price={read.price}/></button>}
            {read.period && <button className="bt_3m fs_15"><View_Timer time={read.period}/></button>}
        </div>}

        <div className="pd_1 min_h20 mg_h3"><Tiptap_Note type={app} image={read.image} note={read.note}/></div>
        
        {read.link && <Link href={read.link} target="_blank"><p className="lh_1 c_green"><View_Svg name='link'/>&nbsp;{read.link}</p></Link>}
        {read.tag && <div className='lh_1 align'><View_Svg name='tag'/>&nbsp;<Board_Tag app={app} tag={read.tag}/></div>}
    </div>)
}