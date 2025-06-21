import { useEffect, useState } from "react"
import { Kakao_Map, Pagination_Click, storeApp, storeUser, useModal, View_Char, View_Distance } from "modules"
import { checkAdmin } from "modules/SYSTEM"
import { Message, Modal } from "components/app"
import { Admin_Block_IP } from "components/admin"
import { User_Level, User_Profile } from "components/user"

export const Admin_Socket_List = ()=>{
    const { setPopup } = storeApp((state)=> state)
    const { socket, user, setUser } = storeUser((state)=>state)
    const [modal, setModal] = useModal(false)
    const [list, setList] = useState([])
    const [count, setCount] = useState(0)
    const [paging, setPaging] = useState([])
    const $ADMIN = checkAdmin(user.level)

    useEffect(()=>{ socket.on('SOCKET_NOW', ({socket})=>{ setCount(socket) }) }, [])
    useEffect(()=>{
        socket.emit('SOCKET_COUNT', { page: 1 }, (data)=>{
            if(!data.code){
                setList(data.list)
                setPaging(data.paging)
            }
        })
    }, [])
    
    const clickPage = async (page = 1)=>{
        socket.emit('SOCKET_COUNT', { page: page }, (data)=>{
            if(!data.code){
                const $FIND = data.list.find((e)=> e.socket === socket.id)
                if($FIND) setUser({ location: $FIND.location })
                setCount(data.socket)
                setList(data.list)
                setPaging(data.paging)
            }
        })
    }
    const clickSocketRefresh = ()=>{
        socket.emit('SOCKET_REFRESH', async (data)=>{
            if(!data.code){
                setPopup({msg: data.msg})
                clickPage(1)
            } 
        })
    }

    if(!$ADMIN) return <Message>관리자가 아닙니다.</Message>
    return(<>
        <div className="box pd_h1 ta_c mg_b2">
            <p className="fwb mg_b2">이용자(소켓) 관리</p>
            <p className="line w_50">소켓 수 : <span className={`fwb ${count === list.length ? "c_green" : "c_red"}`}>{count}</span></p>
            <p className="line w_50">이용자 수 : <span className="c_blue fwb">{list.length}</span></p>
            <div className="pd_h">
                <button className="bt_3 c_orange" onClick={clickSocketRefresh}>이용자(소켓) 업데이트</button>
            </div>
        </div>

        {!!list.length && <Kakao_Map user={list}/>}
            
        <div className="flex_between">
            {list.map((e)=> <div key={e.socket} className="box_between fs_13">
                {modal.profile === e.id && <Modal title='회원 정보' setModal={setModal}><User_Profile target_id={e.id} user={user}/></Modal>}
                {modal.ip === e.ip && <Modal title='IP(아이피) 차단' setModal={setModal}><Admin_Block_IP user={e} setModal={setModal}/></Modal>}

                <div onClick={()=>setModal({ip: e.ip})}>
                    <p className="pd_l">{e.socket}</p>
                    <p className="lh_1 pd_l">{e.ip}<View_Char char='vl'/><View_Distance location1={user.location} location2={e.location}/></p>
                </div>

                <div className="pd_h1"><hr /></div>
                <p className="cursor" onClick={()=>setModal({profile: e.id})}><User_Level level={e.level}/>&nbsp;{e.name || '손님'}{e.id && <><View_Char char='vl'/>{e.id}</>}</p>
            </div>)}
        </div>
        <Pagination_Click paging={paging} page={clickPage}/>
    </>)
}