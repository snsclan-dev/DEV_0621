import { useEffect, useState } from "react";
import { Pagination_Click, storeApp, storeUser, useAxios, useModal, View_Char, View_Date } from "modules";
import { checkAdmin, clickScroll } from "modules/SYSTEM";
import { Message, Modal, App_Report } from "components/app";
import { User_Level, User_Profile } from "components/user";
import { editorCheck, Tiptap_Editor, Tiptap_Note } from "components/editor";

export const Messenger_Room = ({room, user})=>{
    const { setLoading, setPopup, setConfirm } = storeApp.getState()
    const { socket } = storeUser((state)=>state)
    const [roomUser, setRoomUser] = useState([])
    const [list, setList] = useState([])
    const [paging, setPaging] = useState([])
    const [page, setPage] = useState(1)
    const [modal, setModal] = useModal(false)
    const $ADMIN = checkAdmin(user.level)
    const $TARGET_USER = roomUser.find((e)=> e.id !== user.id)
    const $USER = roomUser.find((e)=> e.id === user.id)
    const $MESSENGER = $ADMIN || $USER && (!list.length || list[0]?.id !== user.id)
    
    useEffect(()=>{
        const getRoom = async ()=>{
            const $DATA = await useAxios.get(`/messenger/room/${room}/${page}`)
            if($DATA){
                setRoomUser($DATA.room_user),
                setList($DATA.list), setPaging($DATA.paging)
                socket.emit('MESSENGER_JOIN', { id: user.id })
            }
        }
        getRoom()
    },[socket, room, page])
    
    useEffect(()=>{
        socket.on('MESSENGER_ROOM', ()=>{
            clickRefresh(), clickScroll('top')
        })
        return ()=> socket.removeAllListeners('MESSENGER_ROOM');
    },[socket])
    
    const clickRefresh = async ()=>{
        setLoading(1200)
        const $DATA = await useAxios.get(`/messenger/room/${room}/0`)
        if($DATA){
            setList($DATA.list), setPaging($DATA.paging)
            socket.emit('MESSENGER_JOIN', { id: user.id })
        }
    }
    const $STYLE = (obj)=>{
        const $WRITER = obj.user_id === user.id ? 'state_bg_blue' : '';
        if(obj.state === 7) return `messenger_state_end ${$WRITER}`;
        if(obj.state === 6){
            if($ADMIN || obj.user_id !== user.id) return `messenger_state_report ${$WRITER}`;
        }
        return `${$WRITER}`;
    }
    const clickWrite = async (e)=>{
        e.target.blur()
        const $EDITOR = editorCheck({type: 'messenger', selector: '#messenger'})
        if($EDITOR.code) return setPopup($EDITOR)
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/messenger/write', { room: decodeURIComponent(room), target_id: $TARGET_USER.id, editor: $EDITOR.data })
            if($DATA){
                if($TARGET_USER) socket.emit('MESSENGER_WRITE', { target_id: $TARGET_USER.id })
                $EDITOR.editor.clearContent(), clickRefresh()
                clickScroll('top')
            }
        }
        setConfirm({msg: '메세지를 등록하시겠습니까?', confirm: $CONFIRM})
    }

    return(<>
        {modal.profile && <Modal title='회원 정보' setModal={setModal}><User_Profile target_id={modal.profile} user={user}/></Modal>}

        <div className="box pd mg_b2">
            {roomUser.map((e, i)=> <div key={i} className="line box_lgray fs_13 pd mg cursor" onClick={()=>setModal({profile: e.id})}><User_Level level={e.level}/>{e.name}&nbsp;</div>)}
        </div>

        {list.length ? list.map((e)=> <div key={e.num} className={`box pd_1 ${$STYLE(e)} mg_b2`}>
            {modal.report === e.num  && <Modal title='🚨 신고 (호출)' setModal={setModal}><App_Report target_app='messenger' obj={e} clickRefresh={clickRefresh} setModal={setModal}/></Modal>}

            <div className="mg_b1">
                <p className="line w_80"><User_Level level={e.level}/>&nbsp;<span className="c_lblue fwb">{e.name}</span><View_Char char='vl'/><View_Date date={e.created}/></p>
                <p className="line w_20 ta_r">{e.state !== 6 && e.user_id !== user.id && <button className='bt_2 c_red' onClick={()=>setModal({report: e.num})}>신고</button>}</p>
            </div>

            {e.state === 6 && ($ADMIN || e.user_id !== user.id) && <p className="c_orange">신고한 메세지입니다.</p>}
            {$ADMIN && e.state === 7 && <p className="c_red">삭제된 메세지입니다.</p>}

            <div className="pd"><Tiptap_Note note={e.note}/></div>
        </div>) : <div className="box_lgray mg_b1"><Message>작성된 메세지가 없습니다.</Message></div>}

        {$MESSENGER ? <div className="box_blue pd_2 mg_h3">
            <p className="mg_b1"><User_Level level={user.level}/>&nbsp;<span className="c_lblue fwb">{user.name}</span></p>
            <Tiptap_Editor id='messenger' upload={5}/>
            <div className="ta_c pd_t2">
                <button className="bt_modal c_blue" onClick={clickWrite}>메세지 전송</button>
            </div>
        </div> : <div className="box_lgray mg_h3"><Message>상대방이 메세지를 등록하면 작성이 가능합니다.</Message></div>}
        
        <Pagination_Click paging={paging} page={setPage}/>
    </>)
}