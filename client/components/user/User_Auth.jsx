import { useState } from "react"
import { User_Level } from "components/user"
import { checkInput, storeApp, useAxios, useInput, View_Id } from "modules"

export const User_Auth = ({user, setUser})=>{
    const { setPopup } = storeApp((state)=>state)
    const [input, setInput] = useInput({passCode: ''})
    const [view, setView] = useState(false)
    
    const clickAuth = async ()=>{
        if(!user.id) return setPopup({msg: '로그인이 필요합니다.'})
        const $CHECK = checkInput(input)
        if($CHECK.code) return setPopup($CHECK)
        const data = await useAxios.post('/user/auth/code', { passCode: input.passCode })
        if(data) setUser({ auth: true }), setInput({passCode: ''})
    }

    return(<div className="max_w60 mg_0a">
        <div className="pd_h2">
            <p className="input bg mg_b2"><User_Level level={user.level}/>&nbsp;<span className="fwb">{user.name}</span> ( <View_Id id={user.id}/> )</p>
            <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">본인 확인(인증) 번호 : </span><span className="c_gray">숫자 (6~8)</span><span className="c_blue fwb mg_l2 cursor" onClick={()=>setView(!view)}>[표시]</span></p>
            <input className="input" type={view ? "number" : "password"} name="passCode" placeholder="본인 확인(인증) 번호를 입력해 주세요" onChange={setInput} value={input.passCode} onKeyDown={(e)=>{ if(e.key === 'Enter') clickAuth(e) }}/>
        </div>
        <div className="ta_c pd_t1">
            <button className="bt_3m c_blue" onClick={clickAuth}>확인</button>
        </div>
    </div>)
}