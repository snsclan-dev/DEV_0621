import { View_Svg } from "modules"

export const Loading = ()=>{ return(<div className="loading"><div className="loader_r1"></div></div>) }
export const Modal = ({title, setModal, children})=>{
    return(<div className="layout_modal">
        <div className="wrap_modal pd_2">
            <div className="line modal_left" onClick={()=>setModal(false)}><p className="lh_2 pd_l2"><span className="c_gray fwb">{title}</span></p></div>
            <div className="line modal_right ta_r" onClick={()=>setModal(false)}><button className="bt_pd c_red"><View_Svg name='close' size={24} color="red"/></button></div>
            <div className="modal_children mg_t2">{children}</div>
        </div>
    </div>)
}
export const Modal_Image = ({src, setModal})=>{
    return(<div className="layout_modal_image" onClick={()=>setModal(false)}>
        <div className="wrap_modal_image"><img src={src} alt="image view"/></div>
    </div>)
}
export const Modal_Video = ({src, setModal})=>{
    return(<div className="popup_video">
        <div className="pd_1 ta_r" onClick={()=>setModal(null)}>
            <button className="bt_pd c_red"><View_Svg name='close' size={24} color="red"/></button>
        </div>
        <video controls muted autoPlay><source src={src} type='video/mp4'/>지원하지 않는 영상입니다</video>
    </div>)
}
export const Notice = ({msg, setNotice})=>{
    return(<div className="layout_notice">
        <div className="wrap_modal">
            <div className="pd_2">
                <pre className="lh_1">{msg}</pre>
            </div>
            <div className="ta_c pd_h2">
                <button className="bt_w1/4" onClick={()=>setNotice(null)}>확인</button>
            </div>
        </div>
    </div>)
}
export const Popup = ({code, msg, setPopup})=>{
    const $CODE = { 
        0: {state: '[ 성공 ]', style: 'c_green'}, 1: {state: '[ 실패 ]', style: 'c_red'}, 2: {state: '[ 서버 오류 ]', style: 'c_orange'}, 3: {state: '[ 서버 알림 ]', style: 'c_orange'}, // server
        7: {state: '[ 알림 ]', style: 'c_blue'}, 8: {state: '[ 확인 ]', style: 'c_orange'}, 9: {state: '[ 오류 ]', style: 'c_orange'}, undefined: {state: '[ 알림 ]', style: 'c_blue'} // client
    }[code]
    const clickCancel = ()=>{ setPopup(null) };

    return(<div className="layout_popup">
        <div className="wrap_modal">
            <div className="pd_2">
                <p className={`lh_2 fwb ${$CODE.style}`}>{$CODE.state}</p>
                <pre className="lh_1">{msg}</pre>
            </div>
            <div className="ta_c pd_h2">
                <button className="bt_w1/4" onClick={clickCancel}>확인</button>
            </div>
        </div>
    </div>)
}
export const Confirm = ({msg, confirm, setConfirm})=>{
    const clickConfirm = async ()=>{
        if (confirm) await confirm();
        setConfirm(null);
    };
    const clickCancel = ()=>{ setConfirm(null) };

    return(<div className="layout_popup">
        <div className="wrap_modal">
            <div className="pd_2">
                <p className="lh_2 c_blue fwb">[ 확인 ]</p>
                <pre className="lh_1">{msg}</pre>
            </div>
            <div className="ta_c pd_h2">
                <button className="bt_w1/4 c_blue" onClick={clickConfirm}>확인</button>
                <button className="bt_w1/4 mg_l1 c_red" onClick={clickCancel}>취소</button>
            </div>
        </div>
    </div>)
}
export const Message = ({code, msg, children=null})=>{
    if(code === 1) return(<div className="layout_message">
        <p><span className="c_red fwb mg_r1">[ 실패 ]</span>{msg}</p>
    </div>)
    return(<div className="layout_message">
        {code === 2 && <p className="c_red fwb">[ 오류 ] 관리자에게 문의(전달)해 주세요.</p>}
        {msg && <pre>{msg}</pre>}
        {children}
    </div>)
}