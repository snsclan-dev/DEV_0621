import { storeApp, storeUser } from "modules";
import { $CHAT_MESSAGE } from "components/chat"

// image
export const Chat_Preview_Image = ({data, setInput, setModal})=>{
    const { setPopup } = storeApp((state)=>state)
    const { socket } = storeUser((state)=>state)

    const sendImage = ()=>{
        if($CHAT_MESSAGE.line > $CHAT_MESSAGE.max) return setPopup({msg: '상대방의 메세지를 기다려주세요.'})
        socket.emit('CHAT_IMAGE', { image: data.image})
        document.getElementById('message')?.focus()
        return setModal(false)
    }
    const pasteText = ()=>{
        setInput({message: data.text?.substring(0, 100)})
        document.getElementById('message')?.focus()
        return setModal(false)
    }

    return(<>
        <p className="lh_1 fs_13"><span className="li c_blue">&bull;</span>이미지 표시 여부를 확인할 수 있습니다.</p>
        <p className="lh_1 fs_13 mg_b2"><span className="li c_blue">&rsaquo;</span>우회 접속 중이 아닌 상태에서 확인해 주세요.</p>
        <div className="preview_image">
            {data.image.map((e, i)=><div key={i} className="preview_map3"><img src={e} alt="preview"/></div>)}
        </div>
        <div className="ta_c mg_t2">
            <button className="bt_modal c_blue" onClick={sendImage}>이미지 전송</button>
            <button className="bt_modal c_green mg_l2" onClick={pasteText}>문자 붙여넣기</button>
        </div>
    </>)
}
// video
export const Chat_Preview_Video = ({data, setModal})=>{
    const { setPopup } = storeApp((state)=>state)
    const { socket } = storeUser((state)=>state)

    const sendVideo = ()=>{
        if($CHAT_MESSAGE.line > $CHAT_MESSAGE.max) return setPopup({msg: '상대방의 메세지를 기다려주세요.'})
        socket.emit('CHAT_VIDEO', { video: data.video })
        document.getElementById('message')?.focus()
        return setModal(false)
    }

    return(<>
        <p className="fs_13"><span className="li c_blue">&bull;</span>동영상 재생 여부를 확인할 수 있습니다.</p>
        <p className="fs_13 mg_b1"><span className="li c_blue">&rsaquo;</span>우회 접속 중이 아닌 상태에서 확인해 주세요.</p>
        <div className="preview_image">
            {data.video.map((e, i)=><div key={i} className="preview_map3">
                <video controls muted><source src={e} type='video/mp4'/>지원하지 않는 영상입니다</video>
            </div>)}

        </div>
        <div className="ta_c mg_t2">
            <button className="bt_modal c_blue" onClick={sendVideo}>동영상 전송</button>
        </div>
    </>)
}