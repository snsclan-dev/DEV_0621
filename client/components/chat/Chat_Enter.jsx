import Cookies from "js-cookie"
import { checkInput, checkInputColor, socketData, storeApp, storeUser, useInput } from "modules"
import { App_Notice } from "components/app"

export const Chat_Enter = ({user})=>{
    const { setLoading, setPopup } = storeApp((state)=>state)
    const { socket, setUser } = storeUser((state)=>state)
    const [input, setInput] = useInput({ name: Cookies.get('name') || '', sound: Cookies.get('sound') })

    const clickSound = (e)=>{
        if(e.target.checked) Cookies.set('sound', true), setInput({sound: true})
        else Cookies.remove('sound'), setInput({sound: false})
    }
    const clickEnter = ()=>{
        if(user.id && !user.location) return setPopup({msg: '로그인 회원은 채팅(대화방) 이용시 위치 권한을 허용해야 합니다.'})
        const $NAME = user.id ? user.name : input.name
        if(!user.id){
            const $CHECK = checkInput({name: input.name})
            if($CHECK.code) return setPopup({msg: $CHECK.msg})
            if(!input.name) return setPopup({msg: '대화명을 입력해 주세요.'})
        }
        socket.emit('USER_NAME', { name: $NAME, user: user.id ? true : false }, (data)=>{
            const $DATA = socketData(data)
            if($DATA) return setUser({name: $NAME, chat: true}), Cookies.set('name', $NAME)
        })
    }
    const clickDelete = ()=>{
        setLoading(1000), setInput({ name: '' }), Cookies.remove('name')
    }
    const clickLocation = ()=>{ // 위치 권한 요청
        navigator.geolocation.getCurrentPosition((position) => {}, (error)=>{
            if(error.code === error.PERMISSION_DENIED){
                setPopup({ msg: '위치 권한이 차단되었습니다.\n브라우저 설정에서 권한을 다시 허용해 주세요.' });
            }else{
                setPopup({ msg: `위치 권한 요청 오류!\n${error.message}`});
            }
        }, { enableHighAccuracy: true, maximumAge: 0 });
    }

    return(<div className="max_w100 pd_w1 mg_0a">
        <div className="mg_t2"><App_Notice info={{app: 'app', menu: 'chat', category: 'notice'}} user={user}/></div>

        <div className="box_lgray pd_2">
            {!user.id && <p className="fs_13 mg_b3">🔔 손님은 대화명을 입력하면 채팅(대화방)을 이용할 수 있습니다.</p>}

            <div className="flex_center max_w60 mg_0a">
                <div className="mg_b3 ta_c">
                    <div className="line w_50">
                        <input id="check_sound" className="input_check" type="checkbox" name="sound" onChange={clickSound} checked={input.sound ? true : false}/>
                        <label htmlFor="check_sound" className="fs_13">대화방 참여 알림(소리)</label>
                    </div>
                    <div className="line fs_13 w_50" onClick={clickLocation}>
                        위치 정보 : {user.location ? <span className="c_green fwb">허용</span> : <span className="c_red fwb">차단</span>}
                    </div>
                </div>

                {user.id ? <p className="input mg_b2"><span className="fs_13 c_gray">대화명 : </span><span className="c_blue fwb">{user.name}</span></p> :
                <>
                    <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">대화명 : </span><span id="name" className="c_gray">한글 2자 또는, 영문 4자 이후, 숫자, 밑줄 (2, 4~12)</span></p>
                    <input className="input mg_b2" type="text" name="name" placeholder="대화명을 입력해 주세요" onChange={setInput} value={input.name} onKeyUp={()=>{ checkInputColor('name', input.name) }}/>
                </>}
                <div className="ta_c">
                    <button className="bt_5m c_blue" onClick={clickEnter}>대화방 입장</button><button className="bt_5m c_red" onClick={clickDelete}>대화명 삭제</button>
                </div>
            </div>
        </div>

    </div>)
}