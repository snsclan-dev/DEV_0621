import { useRouter } from "next/navigation"
import { $REGEX_GUIDE, checkInput, checkInputColor, storeApp, storeUser, Text_Area, useAxios, useInput } from "modules"
import { checkAdmin } from "modules/SYSTEM"
import { $CHAT_ROOM_MAX, $CHAT_ROOM_SELECT, $CHAT_ROOM_TYPE } from "components/chat"

export const Chat_Create = ({user})=>{
    const { replace } = useRouter()
    const { socket } = storeUser((state)=>state)
    const { setConfirm, setPopup } = storeApp((state)=>state)
    const [input, setInput] = useInput({chat_title:'', room_type: '', room_max: '', room_code: '', memo: ''})
    const $ADMIN = checkAdmin(user.level)

    const clickCreate = async ()=>{
        if(!input.room_max) return setPopup({msg: '대화방 참여 인원을 선택해 주세요.'})
        if(Number(input.room_type) === $CHAT_ROOM_TYPE['3_secret']){
            const $ROOM_CODE = checkInput({ room_code: input.room_code })
            if($ROOM_CODE.code) return setPopup({msg: $ROOM_CODE.msg})
        }
        const { room_code, ...$INPUT } = input
        const $CHECK = checkInput($INPUT)
        if($CHECK.code) return setPopup({msg: $CHECK.msg})
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/chat/room/create', { ...input, room: socket.id })
            // if($DATA) push(`/chat/room/${$DATA.room}`)
            if($DATA) setTimeout(()=>{ replace(`/chat/room/${$DATA.room}`) }, 600)
        }
        setConfirm({ msg: '대화방을 만드시겠습니까?', confirm: $CONFIRM })
    }
    return(
        <div>
            <p className="lh_1 fs_13 pd_l1">{$REGEX_GUIDE.chat_title}</p>
            <input className="input mg_b2" type="text" name="chat_title" placeholder="대화방 제목을 입력해 주세요" onChange={setInput} value={input.chat_title} onKeyUp={()=>{ checkInputColor('chat_title', input.chat_title) }}/>

            <select className="select mg_b2" name="room_type" onChange={setInput}>
                {$CHAT_ROOM_SELECT.map((e, i)=> e.value < 7 && <option key={i} value={e.value}>{e.select}</option>)}
            </select>
            {$ADMIN ? <>
                <p className="lh_1 pd_l1 fs_13 c_orange">{$REGEX_GUIDE.room_max}</p>
                <input className="input mg_b2" type="text" name="room_max" maxLength={2} placeholder="대화방 최대 참여자 수를 입력해 주세요" onChange={setInput} value={input.room_max} onKeyUp={()=>{ checkInputColor('room_max', input.room_max) }}/>
            </> : <select className="select mg_b2" name="room_max" onChange={setInput}>
                {$CHAT_ROOM_MAX.map((e, i)=> e.level <= user.level && <option key={i} value={e.value}>{e.select}</option> )}
            </select>}

            {Number(input.room_type) === $CHAT_ROOM_TYPE['3_secret'] && <>
                <p className="lh_1 fs_13 pd_l1">{$REGEX_GUIDE.room_code}</p>
                <input className="input mg_b2" type="text" name="room_code" maxLength={10} placeholder="대화방 입장코드(암호)를 입력해 주세요" onChange={setInput} value={input.room_code} onKeyUp={()=>{ checkInputColor('room_code', input.room_code) }}/>
            </>}

            <p id='memo' className="lh_1 fs_13 pd_l1">&#x2714; 대화방 설명 및 안내 (0~100)</p>
            <Text_Area className="textarea scroll mg_b2" maxRows={3} name='memo' maxLength={100} onChange={setInput} value={input.memo} onKeyUp={()=>{ checkInputColor('memo', input.memo) }}/>

            <div className="ta_c">
                <button className="bt_4m c_blue" onClick={clickCreate}>방 만들기</button>
            </div>
        </div>
    )
}
export  const Chat_Modify = ({room, user, clickStatus, setModal})=>{
    const { replace } = useRouter()
    const { setPopup, setConfirm } = storeApp((state)=>state)
    const $ROOM = Object.entries(room).reduce((acc, [key, value])=>{
        acc[key] = value === null ? '' : value
        return acc
    }, {})
    const $INPUT = { num: $ROOM.num, room: $ROOM.room, chat_title: $ROOM.title, memo: $ROOM.memo, room_type: $ROOM.room_type, room_max: $ROOM.room_max, room_code: $ROOM.room_code }
    const [input, setInput] = useInput($INPUT)
    const $ADMIN = checkAdmin(user.level)

    const clickModify = async ()=>{
        if(Number(input.room_type) === $CHAT_ROOM_TYPE['3_secret']){
            if(!input.room_type) return setPopup({msg: '대화방 입장코드(암호)를 선택해 주세요.'})
            const $ROOM_CODE = checkInput({ room_code: input.room_code })
            if($ROOM_CODE.code) return setPopup({msg: $ROOM_CODE.msg})
        }
        const { room_code, ...$INPUT } = input
        const $CHECK = checkInput($INPUT)
        if($CHECK.code) return setPopup({msg: $CHECK.msg})
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/chat/room/modify', { ...input, user_id: room.user_id })
            if($DATA){
                setModal(false)
                clickStatus('MODIFY')
            }
        }
        setConfirm({ msg: '대화방을 수정하시겠습니까?', confirm: $CONFIRM })
    }
    const clickDelete = ()=>{
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/chat/room/delete', { room: room.room })
            if($DATA){
                setModal(false)
                replace('/chat/list/1')
                clickStatus('DELETE')
            }
        }
        setConfirm({ msg: '대화방을 삭제하시겠습니까?', confirm: $CONFIRM })
    }

    return(<>
        <p className="ph_1 ta_c fwb">대화방 수정</p>
        <p className="lh_1 fs_13 pd_l1">{$REGEX_GUIDE.chat_title}</p>
        <input className="input mg_b2" type="text" name="chat_title" placeholder="대화방 제목을 입력해 주세요" onChange={setInput} value={input.chat_title} onKeyUp={()=>{ checkInputColor('chat_title', input.chat_title) }}/>
        <select className="select mg_b2" name="room_type" onChange={setInput} defaultValue={room.room_type}>
            {$CHAT_ROOM_SELECT.map((e, i)=> <option key={i} value={e.value}>{e.select}</option> )}
        </select>
        {$ADMIN ? <>
            <p className="lh_1 fs_13 pd_l1">{$REGEX_GUIDE.room_max}</p>
            <input className="input mg_b2" type="text" name="room_max" maxLength={2} placeholder="대화방 참여자 수를 입력해 주세요" onChange={setInput} value={input.room_max} onKeyUp={()=>{ checkInputColor('room_max', input.room_max) }}/>
        </> : <select className="select mg_b2" name="room_max" onChange={setInput} defaultValue={room.room_max}>
            {$CHAT_ROOM_MAX.map((e, i)=> e.level <= user.level && <option key={i} value={e.value}>{e.select}</option> )}
        </select>}
        {Number(input.room_type) === $CHAT_ROOM_TYPE['3_secret'] && <>
            <p className="lh_1 fs_13 pd_l1">{$REGEX_GUIDE.room_code}</p>
            <input className="input mg_b2" type="text" name="room_code" maxLength={10} placeholder="대화방 입장코드(암호)를 입력해 주세요" onChange={setInput} value={input.room_code} onKeyUp={()=>{ checkInputColor('room_code', input.room_code) }}/>
        </>}

        <p id='memo' className="lh_1 fs_13 pd_l1">&#x2714; 대화방 설명 및 안내 (0~100)</p>
        <Text_Area className="textarea scroll mg_b2" maxRows={3} name='memo' maxLength={100} onChange={setInput} value={input.memo} onKeyUp={()=>{ checkInputColor('memo', input.memo) }}/>

        <div className="ta_c">
            <button className="bt_4m c_gray" onClick={()=>setModal({menu: true})}>취소(닫기)</button>
            <button className="bt_4m c_blue" onClick={clickModify}>수정 완료</button>
            <button className="bt_4m c_red" onClick={clickDelete}>대화방 삭제</button>
        </div>
    </>)
}