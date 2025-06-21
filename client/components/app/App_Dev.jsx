'use client'
import { storeApp, storeUser } from "modules"

export const App_Dev = ()=>{
    const { info, setPopup } = storeApp((state)=>state)
    const { user, socket } = storeUser((state)=>state)

    const clickUser = ()=>{
        console.log('info', info);
        console.log('user', user);
        console.log('socket', socket.id, socket);
    }
    const clickSocket = ()=>{
        socket.emit('user')
    }
    const clickSocketClear = ()=>{
        socket.emit('SOCKET_REFRESH', (data)=>{
            if(!data.code) setPopup({msg: data.msg})
        })
    }
        
    return(
        <div className="nav fs_13 align ">
            <span className="mg_w1 c_pink fwb">개발 모드</span>
            <button className="bt_1m" onClick={clickUser}>STORE</button>
            <button className="bt_1m" onClick={clickSocket}>{socket?.id ? socket.id : '소켓 없음'}</button>
            <button className="bt_1m" onClick={clickSocketClear}>소켓 삭제</button>
        </div>
    )
}