import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useInput, useAxios, storeApp, storeUser } from "modules"
import { checkInput } from "modules/REGEX"

export const App_Login = ()=>{
    const { setPopup } = storeApp((state)=>state)
    const { user } = storeUser((state)=>state)
    const refInput = useRef()
    const [view, setView] = useState(false)
    const [input, setInput] = useInput({input_id: '', input_pass: ''})

    useEffect(()=>{ refInput.current.focus() }, [])

    const clickLogin = async (e)=>{
        e.target.blur();
        if(!user.location) return setPopup({msg: '위치 정보 권한을 허용해 주세요.'})
        const $INPUT = { id: input.input_id, pass: input.input_pass }
        const $CHECK = checkInput($INPUT)
        if($CHECK.code) return setPopup($CHECK)
        const data = await useAxios.post('/main/login', input)
        if(!data) return setInput({input_pass: ''})
        return location.replace('/')
    }

    return(<div className="max_w60 pd_1 mg_0a">
        <div className="pd_h2 ta_c"><p className="fwb">로그인</p></div>

        <div className="box_green pd_1 mg_b1">
            <p className="lh_1 fs_13 c_green fwb"><span className='li c_green'>&bull;</span>이메일 인증을 완료한 회원만 로그인이 가능합니다.</p>
            <p className="lh_1 fs_13"><span className='li'>&bull;</span>이메일은 발송이 느릴 수 있으니 조금만 기다려주세요. (스팸 메일함 확인!)</p>
            <p className="lh_1 fs_13"><span className='li c_red'>&bull;</span>이메일이 도착하지 않으면 관리자에게 문의해주세요.</p>
        </div>

        <div className="pd_h2">
            <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">아이디 : </span><span className="c_gray">영문(소) 4자 이후, 숫자, 밑줄 (6~20)</span></p>
            <input ref={refInput} className="input mg_b2" type="text" name="input_id" placeholder="아이디를 입력해 주세요" onChange={setInput} value={input.input_id}
            onKeyDown={(e)=>{ if(e.key === 'Enter') clickLogin(e) }}/>

            <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">비밀번호 : </span><span className="c_gray">숫자 위 특수(-_=+)문자 가능 (10~20)</span>
            <span className="c_blue fwb mg_l2 cursor" onClick={()=>setView(!view)}>[표시]</span></p>
            <input className="input mg_b2" type={view ? "text" : "password"} name="input_pass" placeholder="비밀번호를 입력해 주세요" onChange={setInput} value={input.input_pass}
            onKeyDown={(e)=>{ if(e.key === 'Enter') clickLogin(e) }}/>
        </div>
        
        <div className="ta_c">
            <button className="bt_3m c_blue" onClick={clickLogin}>로그인</button>
            <Link href="/register"><button className="bt_3m c_gray mg_l2">회원 가입</button></Link>
        </div>
    </div>)
}