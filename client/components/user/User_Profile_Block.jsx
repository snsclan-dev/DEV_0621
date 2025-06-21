import { storeApp, useAxios, useInput, View_Char } from "modules";
import { checkInput, checkInputColor } from "modules/REGEX";
import { Message } from "components/app";
import { User_Level, User_State } from "components/user";

export const User_Profile_Block = ({user, clickRefresh, setModal})=>{ // 회원 로그인 차단
    const { setPopup, setConfirm } = storeApp((state)=>state)
    const [input, setInput] = useInput({period: ''})

    const clickBlock = async ()=>{
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/admin/user/block/period', { target_id: user.id, period: Number(input.period || 0) })
            if($DATA) clickRefresh(), setInput({period: ''})
        }
        setConfirm({msg: `${Number(input.block) === 0 ? '차단을 해제하시겠습니까?' : '차단 하시겠습니까?'}`, confirm: $CONFIRM})
    }
    const clickState = async (state)=>{
        const $CHECK = checkInput({ admin_block: input.period })
        if($CHECK.code) return setPopup({msg: $CHECK.msg})
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/admin/user/modify/state', { target_id: user.id, state: state })
            if($DATA) clickRefresh(), setInput({period: ''})
        }
        setConfirm({msg: '회원 상태를 변경하시겠습니까?', confirm: $CONFIRM})
    }
    
    if(!user) return <Message>존재하지 않는 회원입니다.</Message>
    return(<>
        <p className="box_input bg mg_b2"><User_Level level={user.level}/>&nbsp;<span className="c_blue fwb">{user.name}</span></p>
        <p className="box_input bg mg_b2 c_orange fwb">{user.id}<View_Char char='vl'/>{user.login_ip}</p>

        <p className="box_input bg mg_b2"><User_State obj={user}/></p>
        {user.blocked && <p className="input bg mg_b2">차단 기간 : <span className="c_red fwb">{user.blocked}</span> 까지</p>}
        <p className="lh_1 fs_13 pd_l1"><span className="c_orange fwb">차단 기간(일) : </span><span id="admin_block">숫자(1~999)만 입력해 주세요. (해제 : 0)</span></p>

        <input className="select_left" type="text" name="period" placeholder="차단 기간(일)을 입력해 주세요" onChange={setInput} value={input.period}
        onKeyUp={()=>{ checkInputColor('admin_block', input.period) }}/>
        <button className="select_bt c_orange" onClick={clickBlock}>차단</button>

        <div className="ta_c mg_t2">
            <button className="bt_modal c_gray mg_l1" onClick={()=>setModal(null)}>닫기 (뒤로)</button>
            {user.state === 7 ? <button className="bt_modal c_orange" onClick={()=>clickState(0)}>차단 해제</button> : <button className="bt_modal c_orange" onClick={()=>clickState(7)}>이용 차단</button>}
            {user.state === 9 ? <button className="bt_modal c_red mg_l1" onClick={()=>clickState(0)}>퇴출 해제</button> : <button className="bt_modal c_red mg_l1" onClick={()=>clickState(9)}>퇴출</button>}
        </div>
    </>)
}