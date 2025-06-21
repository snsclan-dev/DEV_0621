import { useEffect, useState } from "react";
import { storeUser, useAxios, useModal, View_Char, View_Date } from "modules";
import { onClickImage, onErrorImage } from "modules/SYSTEM";
import { Message, Modal_Image } from "components/app";
import { User_Group, User_Level, User_Tag } from "components/user";

export const User_Page = ()=>{
    const { user } = storeUser((state)=>state)
    const [modal, setModal] = useModal(false)
    const [profile, setProfile] = useState(null)
    
    useEffect(()=>{
        const getUser = async ()=>{
            const $DATA = await useAxios.post('/user/profile', { target_id: user.id })
            if($DATA) setProfile($DATA.user)
        }
        getUser()
    }, [user.id])

    if(!profile) return <Message>회원 정보가 없습니다.</Message>
    return(<>
        {modal.image && <Modal_Image src={modal.image} setModal={setModal}/>}

        <div className="box pd_2 mg_b2">
            <p className="fwb ta_c mg_b2">회원 정보 (프로필)</p>
            <div className={`${!profile.image && 'bg'} line box profile_image mg_b`}>
                {profile.image && <img src={profile.image} alt="profile" onClick={(e)=>onClickImage(e, setModal)} onError={onErrorImage}/>}
            </div>

            <div className="line fs_13 c_gray pd_l1">
                <p className='lh_1'><User_Level level={profile.level}/><span className="pd_l fwb">{profile.name}</span></p>
                <p className='lh_1 pd_l'>ID : <span className="c_blue fwb">{user.id}</span>{profile.updated && <><View_Char char='vl'/><View_Date date={profile.updated}/></>}</p>
                <p className="lh_1 pd_l">가입 : <span className="c_green fwb">{profile.created.substring(0,10)}</span> ( <View_Date type='count' date={profile.created}/> )</p>
            </div>
            <div className="mg_t1"><User_Tag type='block' obj={profile}/></div>
        </div>

        <div className="box_pink pd_2 fs_13 mg_b2">
            <p className="fwb ta_c mg_b2">그룹 정보</p>
            <div className="box_input mg_b2"><User_Group group_list={profile.group_list}/></div>
            <p className="box_input mg_b2"><span className="c_gray mg_r">그룹 별명 :</span>{profile.group_name ? <span className="c_purple fwb">{profile.group_name}</span> : <span className="c_gray">없음</span>}</p>
            <p className="box_input"><span className="c_gray mg_r">그룹 등급(레벨) :</span>{profile.group_level ? <span className="c_purple fwb">{profile.group_level}</span> : <span className="c_gray">없음</span>}</p>
        </div>
    </>)
}