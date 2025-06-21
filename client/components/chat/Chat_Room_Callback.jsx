import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { $REGEX_GUIDE, checkInput, storeApp, storeUser, Text_Area, socketData, useAxios, useData, useModal, View_Char, Kakao_Map } from "modules";
import { checkAdmin } from "modules/SYSTEM";
import { Modal } from "components/app";
import { User_Level } from "components/user";
import { Chat_Modify, Chat_Room_Header, Chat_View, Chat_Room_Type, socketEvent, chatSound, $CHAT_ROOM_TYPE } from "components/chat";

export const Chat_Room = ({room})=>{
    const $REF_INPUT = useRef(null);
    const onChangeInput = (e)=>{ $REF_INPUT.current = e.target.value }
    const { setLoading, setPopup, setConfirm } = storeApp((state)=>state)
    const { socket, user } = storeUser((state)=>state)
    const [modal, setModal] = useModal(false)
    const [$ROOM, setRoom] = useData({ ...room, user: [] }) // socket update
    const [view, setView] = useState([])
    const [status, setStatus] = useState(false)
    const $ADMIN = checkAdmin(user.level)

    const ROOM_STATUS = useCallback(({ status, notice }) => {
        if (status === 'LEAVE') socket.emit('ROOM', { num: room.num, room: room.room });
        setLoading(1200);
        if (status === 'ADMIN') setStatus('ADMIN');
        if (status === 'CREATE' || status === 'JOIN') setStatus('CHAT'), chatSound();
        socket.emit('ROOM_USER', { num: room.num, room: room.room });
        setView((prevView) => [...prevView, { status, notice }]);
    }, [room.num, room.room]);
    
    const ROOM_USER = useCallback(({ user }) => {
        setRoom({ user: user });
    }, []);
    
    useEffect(() => {
        socket.emit('ROOM', { num: room.num, room: room.room });
        socket.on('ROOM', ({ user }) => { setRoom({ user: user }) });
        socket.on('ALERT', ({ code, msg }) => { setPopup({ code, msg }) });
        socket.on('USER_STATUS', ({ status }) => {
            if (status === 'BLOCK') {
                setStatus(false);
                setView([]);
                setPopup({ msg: '차단(강퇴)되어 대화을 종료합니다.' });
            }
            if (status === 'DELETE') {
                setStatus(false);
                setView([]);
                clickRefresh();
                setPopup({ msg: '대화방이 삭제되었습니다.' });
            }
        });
        socket.on('ROOM_STATUS', ROOM_STATUS);
        socket.on('ROOM_USER', ROOM_USER);
        socket.on('ROOM_MODIFY', ({ room }) => { setRoom({ ...room }) });
        const $SOCKET = socketEvent({ user, setView });
        Object.entries($SOCKET).forEach(([event, handler]) => { socket.on(event, handler); });
        return () => {
            socket.off('ROOM_STATUS', ROOM_STATUS);
            socket.off('ROOM_USER', ROOM_USER);
            Object.entries($SOCKET).forEach(([event, handler]) => { socket.off(event, handler); });
        };
    }, [socket, room.num, room.room, user, setView, setPopup, ROOM_STATUS, ROOM_USER]);

    const clickRefresh = ()=>{
        setLoading(1200)
        socket.emit('ROOM', { num: room.num, room: room.room })
    }
    const clickJoinAdmin = ()=>{ socket.emit('ROOM_JOIN_ADMIN', { num: room.num, room: room.room }) } // 관리자 모니터링
    const clickJoinHost = ()=>{ // 방장 참여
        if(room.user_id !== user.id) return setPopup({ msg: '방장만 참여가 가능합니다.' })
        const $CONFIRM = ()=>{
            socket.emit('ROOM_JOIN_HOST', { num: room.num, room: room.room, name: user.name }, (data)=>{
                if(!data.code) socket.emit('ROOM_USER', { num: room.num, room: room.room })
            })
        }
        setConfirm({msg: '대화방에 입장하시겠습니까?', confirm: $CONFIRM})
    }
    const clickJoinUser = ()=>{ // 유저 참여
        if($ROOM.user.length >= $ROOM.room_max) return setPopup({ msg: '대화방에 참여할 수 없습니다. (참여자 수)'})
        const $CONFIRM = async ()=>{
            if(Number($ROOM.room_type) === $CHAT_ROOM_TYPE['3_secret']){
                const $ROOM_CODE = checkInput({ room_code: $REF_INPUT.current })
                if($ROOM_CODE.code) return setPopup({msg: $ROOM_CODE.msg})
                const $DATA = await useAxios.post('/chat/room/code', { room: room.room, room_code: $REF_INPUT.current })
                if(!$DATA) return clickRefresh()
            }
            socket.emit('ROOM_JOIN_USER', { num: room.num, room: room.room, name: user.name }, (data)=>{
                if(!data.code) socket.emit('ROOM_USER', { num: room.num, room: room.room })
            })
        }
        setConfirm({msg: '대화방에 입장하시겠습니까?', confirm: $CONFIRM})
    }
    const clickInvite = ()=>{
        navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/chat/room/${room.room}`)
        return setPopup({msg: '대화방 초대 링크가 복사되었습니다.'})
    }
    const clickStatus = (status)=>{
        if(status === 'CLEAN') return setView([])
        if(status === 'MODIFY'){
            return socket.emit('ROOM_MODIFY', { num: room.num, room: room.room })
        }
        if(status === 'ADMIN_LEAVE'){
            socket.emit('ROOM_ADMIN_LEAVE', { num: room.num, room: room.room }, (data)=>{
                if(!data.code) return setStatus(false), setView([]), clickRefresh()
            })
        }
        if(status === 'LEAVE'){
            const $CONFIROM = ()=>{
                socket.emit('ROOM_LEAVE', { room: room.room, name: user.name }, (data)=>{
                    const $DATA = socketData(data)
                    if($DATA) setStatus(false), setView([])
                    clickRefresh()
                })
            }
            setConfirm({ msg: '대화방을 나가시겠습니까?', confirm: $CONFIROM})
        }
        if(status === 'DELETE') return socket.emit('ROOM_DELETE', { num: room.num, room: room.room })
    }

    if(status === 'ADMIN') return(<>
        <Chat_Room_Header admin={true} room={$ROOM} user={user} clickStatus={clickStatus}/>
        <Chat_View admin={true} view={view} room={$ROOM} user={user}/>
    </>)
    if(status === 'CHAT') return(<>
        <Chat_Room_Header room={$ROOM} user={user} clickStatus={clickStatus}/>
        <Chat_View view={view} room={$ROOM} user={user}/>
    </>)
    return(<>
        {modal.modify && <Modal title='대화방 관리' setModal={setModal}><Chat_Modify room={$ROOM} user={user} clickStatus={clickStatus} setModal={setModal}/></Modal>}

        <div className="box pd_1 fs_13 mg_b2">
            <p className='line w_70'>대화방은 실시간으로 업데이트됩니다.</p>
            <p className='line w_30 ta_r'>{room.user_id === user.id && <Link href='/chat/list/1'><button className="bt_3m c_gray">목록으로</button></Link>}</p>
        </div>

        <div className={`pd_2 mg_b2 ${room.user_id === user.id ? 'box_blue' : 'box_lgray'}`}>
            <div className="box pd_1 mg_b2">
                <p className="pd_l mg_b1">{$ROOM.title}</p>
                <p className="fs_13"><User_Level level={room.level}/>&nbsp;<span className="c_lblue fwb">{room.name}</span></p>
            </div>

            {$ROOM.memo ? <Text_Area className="textarea scroll mg_b2 bg" maxRows={5} name='memo' value={$ROOM.memo || '대화방 설명이 없습니다.'} readOnly/> : <p className="box pd_1 c_lgray bg mg_b2">대화방 설명이 없습니다.</p>}

            <div className="box pd_1">
                <Chat_Room_Type value={$ROOM.room_type}/>
                <button className="bt_2m fs_13 c_gray"><span className={`${$ROOM.user.length >= $ROOM.room_max && 'c_red'}`}>{$ROOM.user.length}</span><View_Char char='sl'/><span>{$ROOM.room_max}</span></button>
                {$ROOM.user.map((e, i)=> <button key={i} className={`${e.status === 1 ? 'c_orange': 'c_gray'} bt_2m fs_13`}>{e.status === 1 && '⭐ '}{e.name}</button>)}
            </div>

            {($ADMIN || room.user_id === user.id) && <div className="ta_c mg_t2">
                {room.user_id === user.id && <button className="bt_4m c_green" onClick={clickInvite}>초대하기</button>}
                <button className="bt_4m c_orange" onClick={()=>setModal({modify: true})}>⭐ 대화방 관리</button>
            </div>}
        </div>

        {checkAdmin(user.level) && $ROOM.user.length > 0 && <Kakao_Map user={$ROOM.user}/>}

        <div className="box_lgray pd_2 mg_b2">
            <p className="box_input fs_13 c_gray pd_l1 mg_b2">내 대화명 : <span className="c_lblue fwb">{user.name}</span></p>

            {Number($ROOM.room_type) === $CHAT_ROOM_TYPE['3_secret'] && <>
                <p className="lh_1 fs_13 pd_l1">{$REGEX_GUIDE.room_code}</p>
                <input ref={$REF_INPUT} className="input mg_b2" type="text" name="room_code" maxLength={10} placeholder="대화방 입장코드(암호)를 입력해 주세요" onChange={onChangeInput} onKeyDown={(e)=>{ if(e.key === 'Enter') clickJoinUser()}}/>
            </>}

            <div className="ta_c">
                <button className={`bt_4m ${$ROOM.room_max > $ROOM.room_now ? 'c_blue' : 'c_gray'}`} onClick={room.user_id === user.id ? clickJoinHost : clickJoinUser}>참여하기</button>
                {$ADMIN && <button className="bt_4m c_orange" onClick={clickJoinAdmin}>⚙️모니터링</button>}
            </div>
        </div>
    </>)
}