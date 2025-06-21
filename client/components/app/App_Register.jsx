import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useInput, useAxios, storeApp } from "modules"
import { $REGEX_GUIDE, checkInput, checkInputColor } from "modules/REGEX"

export const App_Register = ()=>{
    const { setConfirm, setPopup } = storeApp((state)=>state)
    const { push } = useRouter()
    const [input, setInput] = useInput({id: '', email: '', name: '', passCode: '', pass: '', passCheck: ''})
    const [view, setView] = useState(false)

    const clickRegister = async (e)=>{
        e.target.blur();
        const $INPUT = { ...input, passConfirm: input.pass === input.passCheck }
        const $CHECK = checkInput($INPUT)
        if($CHECK.code) return setPopup($CHECK)
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/main/register', input)
            if($DATA) return push('/login')
        }
        setConfirm({msg: '규칙을 위반할 경우 발생하는 모든 책임은 본인에게 있습니다.\n동의하시겠습니까?', confirm: $CONFIRM})
    }

    return(<div className="max_w60 pd_1 mg_0a">
        <div className="pd_h2 ta_c"><p className="fwb">회원 가입 (신청)</p></div>

            <div className="box pd_1 mg_b2">
                <p className="lh_1"><span className="li c_blue">&bull;</span>규칙을 위반할 경우, 발생하는 모든 책임은 본인에게 있습니다.</p>
                <p className="lh_1"><span className="li c_blue">&bull;</span>이메일 인증 후 로그인이 가능합니다.</p>
            </div>

            <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">아이디 : </span><span id="id" className="c_gray">영문(소) 4자 이후, 숫자, 밑줄 (6~20)</span></p>
            <input className="input mg_b2" type="text" name="id" placeholder="아이디를 입력해 주세요" onChange={setInput} value={input.id}
            onKeyUp={()=>{ checkInputColor('id', input.id) }}/>

            <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">이메일 : </span><span id="email" className="c_gray">가입 인증 이메일이 발송됩니다. (10~50)</span></p>
            <input className="input mg_b2" type="text" name="email" placeholder="이메일을 입력해 주세요" onChange={setInput} value={input.email}
            onKeyUp={()=>{ checkInputColor('email', input.email) }}/>

            <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">별명 : </span><span id="name" className="c_gray">한글 2자 또는, 영문 4자 이후, 숫자, 밑줄 (2, 4~12)</span></p>
            <input className="input mg_b2" type="text" name="name" placeholder="별명을 입력해 주세요" onChange={setInput} value={input.name}
            onKeyUp={()=>{ checkInputColor('name', input.name) }}/>

            <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">본인 확인(인증) 번호 : </span><span id="passCode" className="c_gray">숫자 (6~8)</span>
            &nbsp;<span className="c_blue fwb cursor" onClick={()=>setView(!view)}>[표시]</span></p>
            <input className="input mg_b2" type={view ? "number" : "password"} name="passCode" placeholder="본인 확인(인증) 번호를 입력해 주세요" onChange={setInput} value={input.passCode}
            onKeyUp={()=>{ checkInputColor('passCode', input.passCode) }}/>
        
            <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">비밀번호 : </span>{$REGEX_GUIDE.pass}&nbsp;<span className="c_blue fwb cursor" onClick={()=>setView(!view)}>[표시]</span></p>

            <input className="input mg_b2" type={view ? "text" : "password"} name="pass" placeholder="비밀번호를 입력해 주세요" onChange={setInput} value={input.pass}
            onKeyUp={()=>{ checkInputColor('pass', input.pass) }}/>
        
            <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">비밀번호 확인 : </span><span id="passConfirm" className="c_gray">비밀번호 확인</span>
            &nbsp;<span className="c_blue fwb cursor" onClick={()=>setView(!view)}>[표시]</span></p>
            <input className="input mg_b2" type={view ? "text" : "password"} name="passCheck" placeholder="비밀번호를 입력해 주세요 (확인)" onChange={setInput} value={input.passCheck}
            onKeyUp={()=>{ checkInputColor('passConfirm', input.pass === input.passCheck) }}/>
            
        <div className="ta_c pd_h2">
            <button className="bt_3m c_blue" onClick={clickRegister}>가입 신청</button>
            <Link href="/login"><button className="bt_3m c_gray mg_l1">로그인</button></Link>
        </div>
    </div>)
}