import { useEffect, useState } from "react";
import Link from 'next/link';
import { useAxios, storeApp, storeUser, useInput, View_Date, View_Char, $META } from "modules";
import { $LINK } from "modules/SYSTEM";
import { checkInput, checkInputColor } from "modules/REGEX";
import { Message } from 'components/app';
import { User_Level } from "components/user";

export const User_Modify = ()=>{
    const { setLoading, setPopup, setConfirm } = storeApp((state)=>state)
    const { user } = storeUser((state)=> state)
    const [view, setView] = useState(false)
    const [input, setInput] = useInput({ name: '', email: '', messenger: '', passCode: '', pass: '', passCheck: '', render: false })

    useEffect(()=>{
        const getUserInfo = async ()=>{
            const $DATA = await useAxios.post('/user/info', { user_id: user.id })
            if($DATA){
                const $INFO = Object.entries($DATA.user).reduce((acc, [key, value])=>{
                    acc[key] = value === null ? '' : value
                    return acc
                }, {})
                setInput({ ...$INFO })
            }
        }
        getUserInfo()
    }, [user.id, input.render])

    const clickModifyName = async ()=>{
        if(user.name === input.name) return setPopup({ msg: '별명이 변경되지 않았습니다.' })
        const $CHECK = checkInput({name: input.name})
        if($CHECK.code) return setPopup($CHECK)
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/user/modify/name', { name: input.name })
            if($DATA) return setInput({name: input.name})
            setInput({name: user.name})
        }
        setConfirm({msg: '별명을 수정하시겠습니까?', confirm: $CONFIRM})
    }
    const clickModifyPass = async ()=>{
        const $INPUT = { ...input, passConfirm: input.pass === input.passCheck }
        const $CHECK = checkInput($INPUT)
        if($CHECK.code) return setPopup($CHECK)
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/user/modify/pass', { passCode: input.passCode, pass: input.pass, passCheck: input.passCheck })
            if($DATA) setInput({pass: '', passCheck: ''})
        }
        setConfirm({msg: '비밀(인증)번호를 수정하시겠습니까?', confirm: $CONFIRM})
    }
    const clickGuide = ()=>{ return window.open('/telegram.jpg', 'messenger') }
    const clickMessenger = async ()=>{
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.get('/app/messenger')
            if($DATA) setInput({render: !input.render})
        }
        setConfirm({msg: '메신저를 등록(연결)하시겠습니까?', confirm: $CONFIRM})
    }
    const clickDelete = async ()=>{
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/app/messenger/delete')
            if($DATA) setInput({render: !input.render})
        }
        setConfirm({msg: <p>메신저를 <span className="c_red fwb">삭제(해제)</span>하시겠습니까?</p>, confirm: $CONFIRM})
    }
    
    if(!user.id) return <Message height={2}>로그인이 필요합니다.</Message>;
    return(<div className="">
        <div className="pd_h2 ta_c"><p className="fwb">회원 정보 (수정)</p></div>

        <div className="box pd_1 fs_13 mg_b2">
            <User_Level level={input.level}/><span className="c_blue fwb mg_l">{input.name}</span><View_Char char='vl'/><span className="c_gray fwb">{input.id}</span>
        </div>

        <div className="mg_b2">
            <div className="box pd_1 fs_13 mg_b2">
                <p className="lh_1 pd_l1"><span className="c_blue fwb">메신저(텔레그램) : </span><span className="c_gray">등록(연결)하면 알림을 받을 수 있습니다.</span></p>
                <p className="lh_1 pd_l1 fwb mg_b1">
                    <span className="c_blue">등록(연결) 상태 : </span>{input.messenger ? <span className="c_green">메신저가 등록(연결)되었습니다.</span> : <span className="c_gray">메신저가 연결되지 않았습니다.</span>}
                </p>
                <p className="ta_c mg_b">
                    <button className="bt_3m c_gray mg_b2" onClick={clickGuide}>1. 등록(연결) 안내</button><Link href={$LINK.bot} target="_blank"><button className="bt_3m c_gray">2. 텔레그램(봇)</button></Link>
                    {input.messenger ? <button className="bt_3m c_green" onClick={clickDelete}>{input.messenger}</button> : <button className="bt_3m c_blue" onClick={clickMessenger}>메신저 등록(연결)</button>}
                </p>
            </div>

            <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">이메일 : </span><span className="c_gray">이메일 변경은 관리자에게 문의해 주세요.</span></p>
            <p className="input mg_b2 bg"><span className="c_gray">이메일 : </span><span className="fwb">{input.email}</span></p>
            <p className="input mg_b2 bg"><span className="c_gray">마지막 활동 : </span><span className="fwb">{input.updated}</span></p>

            <div className="box pd_2 mg_b2">
                <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">별명 : </span><span id="name" className="c_gray">한글 2자 또는, 영문 4자 이후, 숫자 (2/4~12)</span></p>
                {input.name_history && <p className="input fs_13 bg mg_b2">이전 별명 : <span className="fwb">{input.name_history?.replace(/,/g, ` / `)}</span></p>}
                {input.name_updated && <p className="input fs_13 bg mg_b2">별명 변경 : <span className="fwb">{input.name_updated}</span> ( <View_Date type='count' date={input.name_updated}/> )</p>}
                <input className="input mg_b2" type="text" name="name" placeholder="별명을 입력해 주세요" onChange={setInput} value={input.name} onKeyUp={()=>{ checkInputColor('name', input.name) }}/>
                <div className="ta_c">
                    <button className="bt_3m c_blue mg_l1" onClick={clickModifyName}>별명 수정</button>
                </div>
            </div>

            <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">본인 확인(인증) 번호 : </span><span id="passCode" className="c_gray">숫자 (6~8)</span>&nbsp;<span className="c_blue fwb cursor" onClick={()=>setView(!view)}>[표시]</span></p>
            <input className="input mg_b2" type={view ? "text" : "password"} name="passCode" placeholder="본인 확인(인증) 번호를 입력해 주세요" onChange={setInput} value={input.passCode}
            onKeyUp={()=>{ checkInputColor('passCode', input.passCode) }}/>

            <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">비밀번호 : </span><span id="pass" className="c_gray">숫자 위 특수(-_=+)문자 가능 (10~20)</span>&nbsp;<span className="c_blue fwb cursor" onClick={()=>setView(!view)}>[표시]</span></p>
            <input className="input mg_b2" type={view ? "text" : "password"} name="pass" placeholder="비밀번호를 입력해 주세요" onChange={setInput} value={input.pass}
            onKeyUp={()=>{ checkInputColor('pass', input.pass) }}/>

            <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">비밀번호 확인 : </span><span id="passConfirm" className="c_gray">비밀번호 확인</span>&nbsp;<span className="c_blue fwb cursor" onClick={()=>setView(!view)}>[표시]</span></p>
            <input className="input mg_b2" type={view ? "text" : "password"} name="passCheck" placeholder="비밀번호를 입력해 주세요 (확인)" onChange={setInput} value={input.passCheck}
            onKeyUp={()=>{ checkInputColor('passConfirm', input.pass === input.passCheck ? true : false) }}/>
        </div>
        <div className="ta_c">
            <Link href="/"><button className="bt_3m c_gray">취소</button></Link>
            <button className="bt_3m c_blue mg_l1" onClick={clickModifyPass}>비밀(인증)번호 수정</button>
        </div>
    </div>)
}