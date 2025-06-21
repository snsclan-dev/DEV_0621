import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkInput, storeApp, Text_Area, useAxios, useInput, useModal, View_Char, View_Date } from "modules";
import { checkAdmin, checkManager, onErrorImage } from "modules/SYSTEM";
import { Message } from "components/app";
import { User_Profile_Block, User_Id, User_Ip, User_Level, User_Tag, User_Map } from "components/user";
import { msgRoom } from 'components/messenger';

export const User_Profile = ({target_id, user})=>{
    const { setPopup, setConfirm } = storeApp((state)=>state)
    const { push } = useRouter()
    const [input, setInput] = useInput({ memo: '' })
    const [modal, setModal] = useModal(false)
    const [profile, setProfile] = useState(null)

    useEffect(()=>{
        const getUser = async ()=>{
            const $DATA = await useAxios.post('/user/profile', { target_id })
            if($DATA) setProfile($DATA.user), setInput({ memo: $DATA.user.memo || '' })
        }
        getUser()
    }, [target_id])

    const clickRefresh = async ()=>{
        const $DATA = await useAxios.post('/user/profile', { target_id })
        if($DATA) setProfile({ ...$DATA.user, memo: $DATA.user.memo || '' }), setInput({ memo: $DATA.user.memo })
    }
    const clickMemo = async ()=>{
        if(profile.memo === input.memo) return setPopup({msg: '회원 메모를 저장했습니다.'})
        const $CHECK = checkInput(input)
        if($CHECK.code) return setPopup($CHECK)
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/user/profile/memo', { target_id, memo: input.memo })
        }
        setConfirm({msg: '회원 메모를 저장하시겠습니까?', confirm: $CONFIRM})
    }
    const clickMessenger = ()=>{
        const $CONFIRM = ()=>{
            return push(`/messenger/room/${msgRoom([target_id, user.id])}/1`)
        }
        setConfirm({msg: '메신저로 이동하시겠습니까?\n현재 진행중인 작업을 종료해주세요.', confirm: $CONFIRM})

    }
    const clickImage = (e)=>{ return window.open(e.target.src, 'profile') }

    if(!profile) return <Message>회원 정보가 없습니다.</Message>
    if(modal.location) return(<User_Map location={profile.location} setModal={setModal}/>)
    if(modal.block) return(<>
        <p className='c_orange fwb ta_c mg_b2'>⚙️회원 관리</p>
        <User_Profile_Block user={profile} clickRefresh={clickRefresh} setModal={setModal}/>
    </>)
    return(<>
        <div className='flex_profile mg_b2'>
            <div className={`${!profile.image && 'bg'} box profile_image`}>
                {profile.image && <img src={profile.image} alt="profile" onClick={(e)=>clickImage(e)} onError={onErrorImage}/>}
            </div>
            <div className='box profile_user pd scroll'>
                <User_Level level={profile.level}/><span className="c_gray pd_l fwb">{profile.name}</span>
                {checkManager(user.level) && <p className='lh_1 pd_l1 fs_13'>
                    ID : <User_Id id={profile.id} level={profile.level} user={user}/><View_Char char='vl'/>IP : <User_Ip ip={profile.login_ip} level={profile.level} user={user}/>
                    {profile.updated && <><View_Char char='vl'/><View_Date date={profile.updated}/></>}
                </p>}
                <div className="lh_2"><User_Tag type='line' obj={{ user_position: profile.user_position, user_title: profile.user_title, user_tag: profile.user_tag }}/></div>    
            </div>
        </div>

        <p className="fs_13 pd_l1 mg_b"><span className="c_blue fwb">회원 메모 : </span><span id="memo">나에게만 보이는 메모입니다. (0~100)</span></p>
        <Text_Area className="textarea scroll" maxRows={3} name='memo' maxLength={100} onChange={setInput} value={input.memo}/>
    
        {user.id && <div className='ta_c mg_t2'>
            <button className="bt_modal c_blue" onClick={clickMemo}>메모 저장</button>
            {target_id !== user.id && <button className="bt_modal c_pink" onClick={clickMessenger}>메신저</button>}
            {checkAdmin(user.level) && <>
                <button className="bt_modal c_orange" onClick={()=>setModal({ location: true })}>위치 정보</button>
                <button className="bt_modal c_orange" onClick={()=>setModal({ block: true })}>⚙️회원 관리</button>
            </>}
        </div>}
    </>)
}