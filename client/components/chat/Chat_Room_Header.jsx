import { Kakao_Map, storeApp, storeUser, useAxios, useModal, View_Char, View_Distance, View_Svg } from "modules"
import { checkAdmin } from "modules/SYSTEM"
import { Modal } from "components/app"
import { Chat_Modify } from "components/chat"
import { User_Level } from "components/user"

export const Chat_Room_Header = ({ admin=false, room, user, clickStatus })=>{
    const { socket } = storeUser((state)=>state)
    const { setPopup, setConfirm } = storeApp((state)=>state)
    const [modal, setModal] = useModal(false)
    const $ADMIN = checkAdmin(user.level)
    const $USER = admin ? user : room.user.find((e)=> e.socket === socket.id) || []

    const clickInvite = ()=>{
        navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/chat/room/${room.room}`)
        return setPopup({msg: '대화방 초대 링크가 복사되었습니다.'})
    }
    const clickBlock = async (obj)=>{
        if(!$ADMIN){
            if(room.user_id === obj.id || obj.name === user.name) return setPopup({msg: '방장(본인)은 차단할 수 없습니다.'})
            if(room.user_id !== user.id) return setPopup({msg: '방장이 아닙니다.'})
        }
        if($ADMIN) return setPopup({msg: '관리자는 차단할 수 없습니다.'})
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/chat/room/block', { room: room.room, target_socket: obj.socket, host_id: room.user_id, name: user.name })
            if($DATA){
                socket.emit('USER_BLOCK', { room: room.room, target_socket: obj.socket, target_name: obj.name })
                setModal(false)
            }
        }
        setConfirm({ msg: '내보내기(차단)은 해제가 불가능합니다.\n계속 진행하시겠습니까?', confirm: $CONFIRM})
    }
    const Chat_Profile = ({obj})=>{
        return(<>
            {room.user_id === obj.id &&<p className="box_input fs_13 fwb c_orange mg_b2">⭐ 방장</p>}
            <p className="box_input fs_13 mg_b2 align">
                <User_Level level={obj.level}/><span className={obj.name === user.name ? 'c_blue fwb' : ''}>&nbsp;{obj.name}</span>{obj.name === user.name && <span className="c_gray fwb">&nbsp;(나)</span>}
            </p>
            <p className="box_input fs_13 mg_b2 align">
                <View_Svg name='location' size={20} color={obj.location ? 'green' : 'red'}/>&nbsp;{obj.location ? <span className="c_green fwb">위치 정보를 허용중입니다.</span> : <span className="c_red fwb">위치 정보를 차단하였습니다.</span>}
            </p>
            {$USER.location && obj.location && obj.name !== user.name && <p className="box_input fs_13 mg_b2 align"><span className="c_gray">나와의 거리 : </span>&nbsp;<View_Distance type='text' location1={$USER.location} location2={obj.location}/></p>}
            <div className="ta_c">{(($ADMIN && obj.name !== user.name) || (room.user_id === user.id && obj.name !== user.name)) && <button className="bt_4m c_red" onClick={()=>clickBlock(obj)}>내보내기 (차단)</button>}</div>
        </>)
    }
    const Chat_Menu = ()=>{
        return(<div>
            <p className="box_input mg_b2">{room.title}</p>
            {room.memo ? <pre className="box pd_1 bg mg_b2">{room.memo}</pre> : <p className="box pd_1 c_lgray bg mg_b2">대화방 설명이 없습니다.</p>}
            <div className="ta_c">
                <button className="bt_4m c_gray" onClick={()=>{ clickStatus('CLEAN'), setModal(false) }}>대화 삭제</button>
                <button className="bt_4m c_red" onClick={()=>clickStatus('LEAVE')}>나가기</button>
                {($ADMIN || room.user_id === user.id) && <>
                    <button className="bt_4m c_green" onClick={clickInvite}>초대하기</button>
                    <button className="bt_4m c_orange" onClick={()=>setModal({modify: true})}>대화방 설정</button>
                </>}
            </div>
        </div>)
    }

    return(<>
        {modal.menu && <Modal title='대화방 메뉴' setModal={setModal}><Chat_Menu/></Modal>}
        {modal.profile && <Modal title='참여자 정보' setModal={setModal}><Chat_Profile obj={modal.data}/></Modal>}
        {modal.modify && <Modal title='대화방 관리' setModal={setModal}><Chat_Modify room={room} user={user} clickStatus={clickStatus} setModal={setModal}/></Modal>}

        <div className='box pd_1 mg_b2'>
            {admin ? <>
                <button className="bt_chat_user fs_13 c_orange" onClick={()=>clickStatus('ADMIN_LEAVE')}>나가기</button>
                <button className='bt_chat_user align fs_13 c_gray'>
                    <span className={`${room.user.length >= room.room_max && 'c_red'}`}>{room.user.length}</span><View_Char char='sl'/><span>{room.room_max}</span>
                </button>
            </> : <button className='bt_chat_user align fs_13 c_gray' onClick={()=>setModal({menu: true})}>
                <View_Svg name='menu' color="blue"/>&nbsp;<span className={`${room.user.length >= room.room_max && 'c_red'}`}>{room.user.length}</span><View_Char char='sl'/><span>{room.room_max}</span>
            </button>
            }

            {room.user.map((e, i)=> 
                <button key={i} className={`${e.status === 1 ? 'c_orange': 'c_gray'} bt_chat_user fs_13 ${e.name === user.name ? 'c_blue' : 'c_gray'}`} onClick={()=>setModal({profile: true, data: e})}>
                    {/* {e.status === 1 && '⭐ '}{e.name}{$USER.location && user.name !== e.name && <>&nbsp;[ <View_Distance location1={$USER.location} location2={e.location}/> ]</>} */}
                    {e.status === 1 && '⭐'}{e.name}{user.name !== e.name && <>&nbsp;[ <View_Distance location1={$USER.location} location2={e.location}/> ]</>}
                </button>)
            }

            {$ADMIN && <Kakao_Map user={room.user}/>}
            {/* <Kakao_Map user={room.user}/> */}
        </div>
    </>)
}