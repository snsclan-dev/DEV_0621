import { storeApp, storeUser, Text_Area, useInput } from "modules"
import { onErrorImage } from "modules/SYSTEM"
import { $CHAT_MESSAGE } from "./CHAT"

export const Chat_Preview_Image = ({ setModal })=>{
    const { setPopup } = storeApp((state)=>state)
    const { socket } = storeUser((state)=>state)
    const [input, setInput] = useInput({link: ''})
    const $LINK = input.link.split(/[\s,]+/).filter(e => e.trim());

    const sendImage = ()=>{
        if($CHAT_MESSAGE.line > $CHAT_MESSAGE.max) return setPopup({msg: '상대방의 메세지를 기다려주세요.'})
        if($LINK.length > 3) return setPopup({ msg: `이미지는 한번에 3개까지 등록 가능합니다.\n현재 입력된 이미지 수 : ${$LINK.length}개` });
        socket.emit('CHAT_IMAGE', { image: $LINK })
        document.getElementById('message')?.focus()
        return setModal(false)
    }

    return(<div>
        <p className="lh_1 fs_13"><span className="li c_blue">&bull;</span>이미지 표시 여부를 확인할 수 있습니다.</p>
        <div className="preview_image mg_b2">
            {$LINK.slice(0, 5).map((e, i)=> <div key={i} className="preview_map3"><img src={e} alt="preview" onError={onErrorImage}/></div>)}
        </div>

        <p className="lh_1 fs_13"><span className="li c_blue">&bull;</span>이미지 주소(URL)를 입력해주세요. 공백, 콤마( , )로 구분</p>
        <div className="mg_b2"><Text_Area className="textarea scroll" minRows={5} maxRows={8} name='link' maxLength={2000} onChange={setInput} value={input.link}/></div>
        <div className="ta_c">
            <button className="bt_3m c_green" onClick={()=>setModal({menu: true})}>뒤로가기(취소)</button>
            <button className="bt_3m c_blue" onClick={sendImage}>이미지 전송</button>
        </div>
    </div>)
}
export const Chat_Preview_Video = ({ setModal })=>{
    const { setPopup } = storeApp((state)=>state)
    const [input, setInput] = useInput({video: ''})
    const $LINK = input.video.split(/[\s,]+/).filter(e => e.trim());

    const sendVideo = ()=>{
        if($CHAT_MESSAGE.line > $CHAT_MESSAGE.max) return setPopup({msg: '상대방의 메세지를 기다려주세요.'})
        if($LINK.length > 3) return setPopup({ msg: `이미지는 한번에 3개까지 등록 가능합니다.\n현재 입력된 이미지 수 : ${$LINK.length}개` });
        socket.emit('CHAT_VIDEO', { video: $LINK })
        document.getElementById('message')?.focus()
        return setModal(false)
    }

    return(<>
        <p className="fs_13"><span className="li c_blue">&bull;</span>동영상 재생 여부를 확인할 수 있습니다.</p>
        <div className="preview_image">
            {$LINK.slice(0, 3).map((e, i)=><div key={i} className="preview_map3">
            {/* {$LINK.slice(0, 2).map((e, i)=><div key={i} className="preview_map2"> */}
                <video controls muted><source src={e} type='video/mp4'/>지원하지 않는 영상입니다</video>
            </div>)}
        </div>
        <p className="lh_1 fs_13"><span className="li c_blue">&bull;</span>동영상 주소(URL)를 입력해주세요. 공백, 콤마( , )로 구분</p>
        <div className="mg_b2"><Text_Area className="textarea scroll" minRows={5} maxRows={8} name='video' maxLength={2000} onChange={setInput} value={input.video}/></div>
        <div className="ta_c mg_t2">
            <button className="bt_3m c_green" onClick={()=>setModal({menu: true})}>뒤로가기(취소)</button>
            <button className="bt_modal c_blue" onClick={sendVideo}>동영상 전송</button>
        </div>
    </>)
}