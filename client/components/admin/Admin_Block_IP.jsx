import { useAxios } from "modules";

export const Admin_Block_IP = ({ user, setModal, clickRefresh })=>{ // IP 차단

    const clickCreate = async ()=>{
        const $DATA = await useAxios.post('/admin/block/ip/create', { ip: user.ip })
        if($DATA) setModal(false)
    }
    const clickCancel = async ()=>{
        const $DATA = await useAxios.post('/admin/block/ip/delete', { num: user.num })
        if($DATA) clickRefresh(), setModal(false)
    }

    return(<>
        <p className="input fs_13 pd_l1"><span className="c_gray">대상 IP : </span><span className="c_orange fwb">{user.ip}</span></p>
        <div className="ta_c mg_t2">
            {user.socket ? <button className="bt_modal c_red" onClick={clickCreate}>차단 등록</button> : <button className="bt_modal c_orange" onClick={clickCancel}>차단 해제</button>}
        </div>
    </>)
}