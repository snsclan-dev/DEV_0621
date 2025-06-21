import parse from 'html-react-parser';
import React, { useEffect, useRef } from "react"
import { $REGEX, checkInput, storeApp, storeUser, useInput, useModal } from "modules"
import { $FILE_UPLOAD, onClickImage, onClickVideo } from 'modules/SYSTEM';
import { Modal, Modal_Image, Modal_Video } from "components/app"
import { $CHAT_MESSAGE, Chat_Upload, chatSlider, Chat_Preview_Image, Chat_Preview_Video } from "components/chat"

const CHAT_BOX = React.memo(({admin, view, obj, line, user, setModal})=>{
    const $NAME = admin ? view[line - 1]?.name !== view[line]?.name : view[line - 1]?.name !== view[line]?.name && obj.name !== user.name
    // const $USER = admin ? host === obj.id : obj.name === user.name // host 받아오기
    const $USER = admin ? obj.user_id === obj.name : obj.name === user.name
    if(obj.message || obj.image || obj.video) return(<div className={$USER ? 'chat_box_right' : 'chat_box_left'}>
        <p className={$USER ? 'pd_r ta_r' : 'pd_l ta_l'}>{$NAME && <span className={`${$USER ? 'c_orange' : 'c_blue'} fs_13 fwb`}>{obj.name}</span>}</p>
        {obj.message && <div className={`${$USER && 'ta_r'} lh_1`}>{parse(obj.message)}</div>}
        {obj.image && obj.image.map((e, i)=> <div key={i} className="chat_image_box" onClick={(e)=>onClickImage(e, setModal)}><img className="chat_image" src={e} alt="view" /></div>)}
        {obj.video && obj.video.map((e, i)=> <div key={i} className="chat_image_box"><video className="chat_image" preload="metadata" src={e + '#t=1'} onClick={(e)=>onClickVideo(e, setModal)}></video></div>)}
    </div>)
})
CHAT_BOX.displayName = 'CHAT_BOX';

export const Chat_View = ({view, admin=false, room, user})=>{
    const refView = useRef()
    const refInput = useRef()
    const { setPopup } = storeApp((state)=>state)
    const { socket } = storeUser((state)=>state)
    const [modal, setModal] = useModal(false)
    const [input, setInput] = useInput( {message: '' })

    useEffect(()=>{
        if(refInput.current) refInput.current.focus()
        const $VIEW = refView.current
        const $SLIDER = chatSlider($VIEW)
        if(view.length > 20) view.splice(0, view.length - 20)
        refView.current?.scroll({top: refView.current.scrollHeight, left: 0, behavior: 'smooth'});
        return $SLIDER
    },[view])

    const clickMessage = ()=>{
        const $MESSAGE = input.message
        const $CHECK = checkInput({ chat_message: $MESSAGE })
        if($CHECK.code){
            setInput({ message: $MESSAGE.substring(0, 100) })
            refInput.current.blur()
            return setPopup({msg: $CHECK.msg})
        }
        if($CHAT_MESSAGE.last === $MESSAGE) return setPopup({msg: '중복된 메세지입니다.'}), refInput.current.blur()
        if($CHAT_MESSAGE.line >= $CHAT_MESSAGE.max) return setPopup({msg: '상대방의 메세지를 기다려주세요.'}), refInput.current.blur()
        setInput({ message: '' })
        socket.emit('CHAT_MESSAGE', { message: $MESSAGE })
        refInput.current.focus()
    }
    const onPaste = (e)=>{
        e.preventDefault();
        const html = e.clipboardData.getData("text/html"), text = e.clipboardData.getData("text")
        const $TEXT_IMAGE = text.match($REGEX.url_image) || []
        const $HTML_IMAGE = html.match($REGEX.url_image) || []
        const $HTML_REPLACE_IMAGE = $HTML_IMAGE.map((e)=>e.replace($REGEX.url_image, '$1'))

        const $TEXT_VIDEO = text.match($REGEX.url_video) || []
        const $HTML_VIDEO = text.match($REGEX.url_video) || []
        const $HTML_REPLACE_VIDEO = $HTML_VIDEO.map((e)=>e.replace($REGEX.url_video, '$1'))

        if(/data:|:image\/|base64/gi.test($HTML_IMAGE)) return setPopup({msg: <><p>붙여 넣을 수 없는 이미지가 포함되었습니다.</p><p>주소(URL)로 연결된 이미지만 가능합니다.</p></>})
        const $IMAGE = [...new Set($TEXT_IMAGE.concat($HTML_REPLACE_IMAGE))];
        const $VIDEO = [...new Set($TEXT_VIDEO.concat($HTML_REPLACE_VIDEO))];

        if($VIDEO.length){
            if($VIDEO.length > $FILE_UPLOAD.chat) return setPopup({msg: <>
                <p>최대 <span className="c_blue fwb">{$FILE_UPLOAD.chat}개</span>의 동영상만 붙여넣기가 가능합니다.</p>
                <p>복사(포함)된 동영상 : <span className="c_red fwb">{$VIDEO.length}개</span></p>
            </>})
            return setModal({ preview_video: true, data: { video: $VIDEO } })
        }
        if($IMAGE.length){
            if($IMAGE.length > $FILE_UPLOAD.chat) return setPopup({msg: <>
                <p>최대 <span className="c_blue fwb">{$FILE_UPLOAD.chat}개</span>의 이미지만 붙여넣기가 가능합니다.</p>
                <p>복사(포함)된 이미지 : <span className="c_red fwb">{$IMAGE.length}개</span></p>
            </>})
            return setModal({ preview: true, data: { image: $IMAGE, text: text } })
        }
        return setInput({message: input.message += text})
    }
    const CHAT_NOTICE = ({status, notice})=>{
        if(status === 'ADMIN') return <div className="chat_notice_orange">{notice}</div>
        if(status === 'CREATE' || status === 'JOIN') return <div className="chat_notice_blue">{notice}</div>
        if(status === 'BLOCK') return <div className="chat_notice_red">{notice}</div>
        if(status === 'LEAVE') return <div className="chat_notice_gray">{notice}</div>
    }

    return(<>
        {modal.image && <Modal_Image setModal={setModal} src={modal.image}></Modal_Image>}
        {modal.video && <Modal_Video setModal={setModal} src={modal.video}></Modal_Video>}
        {modal.upload && <Modal title='이미지 전송' setModal={setModal}><Chat_Upload room={room.room} setModal={setModal}/></Modal>}
        {modal.preview && <Modal title='이미지 미리보기' setModal={setModal}><Chat_Preview_Image setModal={setModal} setInput={setInput} data={modal.data}/></Modal>}
        {modal.preview_video && <Modal title='동영상 미리보기' setModal={setModal}><Chat_Preview_Video setModal={setModal} data={modal.data}/></Modal>}

        <div className="box pd_b mg_b2">
            <div id="view" ref={refView} className="chat_view">
                {view.map((e, i)=> <div key={i}>
                    <CHAT_NOTICE status={e.status} notice={e.notice}/>
                    <CHAT_BOX admin={admin} view={view} obj={e} line={i} user={user} setModal={setModal}/>
                </div>)}
            </div>
            <div id="slider" className="chat_view_slider"></div>
        </div>
        
        {!admin && <div className="box bg pd_h1 ta_c">
            <div className="align">
                <input ref={refInput} id="message" className="chat_input" type="text" name="message" maxLength={200} onChange={setInput} value={input.message} placeholder='내용을 입력해 주세요 (2-100)'
                onKeyDown={(e)=>{ if(e.key === 'Enter') clickMessage()}} onPaste={onPaste}/>
                <button className="bt_chat_message c_blue" onClick={clickMessage}>전송</button>
                <button className="bt_chat_message c_orange" onClick={()=>setModal({upload: true})}>사진</button>
            </div>
        </div>}
    </>)
}