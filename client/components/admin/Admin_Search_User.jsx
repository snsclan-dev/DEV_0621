import { useState } from "react"
import { storeApp, useAxios, useInput, useModal, Pagination_Click, View_Char, View_Date } from "modules"
import { checkInput, checkInputColor } from 'modules/REGEX';
import { Admin_Block_User } from "components/admin";
import { Modal, Modal_Image } from 'components/app';
import { User_State, User_Level, User_Level_View, User_Tag, User_Group, User_Map } from "components/user";
import { Board_Upload } from "components/board";
import { onClickImage, onErrorImage } from "modules/SYSTEM";
import { editorCheck, Tiptap_Editor, Tiptap_Note } from "components/editor";

export const Admin_Search_User = ()=> {
    const { setPopup, setConfirm } = storeApp((state)=>state)
    const [modal, setModal] = useModal(false)
    const [input, setInput] = useInput({search: '', level: '', code: '', pass: '', group_list: '', group_name: '', group_level: '', user_position: '', user_title: '', user_tag: '' })
    const [list, setList] = useState([])
    const [paging, setPaging] = useState([]);

    const clickSearch = async (id)=>{
        const $DATA = await useAxios.post('/admin/user/search', { search: id ? id : input.search, page: 1 })
        if($DATA) return setInput({id: ''}), setList($DATA.list), setPaging($DATA.paging)
    }
    const clickPage = async (page = 1)=>{
        const $DATA = await useAxios.post('/admin/user/search', { search: input.search, page: page })
        if($DATA) return setList($DATA.list), setPaging($DATA.paging)
    }
    const clickSelect = (obj)=>{ 
        const $LIST = list.find((e)=>{ return e.num === obj.num })
        const $USER = Object.entries(obj).reduce((acc, [key, value])=>{
            acc[key] = value === null ? '' : value
            return acc
        }, {})
        setList([$LIST]), setInput($USER), setPaging([])
    }
    const clickRefresh = async ()=>{
        const $DATA = await useAxios.post('/admin/user/search', { search: input.id })
        if($DATA) return setList($DATA.list), setPaging($DATA.paging)
    }
    const clickModifyProfile = ()=>{
        if(list[0].image === input.image) return setPopup({msg: '프로필 이미지를 수정했습니다.'})
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/admin/user/modify/profile', { id: input.id, target_image: list[0].image, image: input.image })
            if($DATA) clickRefresh()
        }
        setConfirm({msg: '프로필 이미지를 수정하시겠습니까?', confirm: $CONFIRM})
    }
    const clickModifyMemo = async ()=>{
        const $EDITOR = editorCheck({type: 'user'})
        if($EDITOR.code) return setPopup($EDITOR)
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post(`/admin/user/modify/memo`, { id: input.id, target_note: list[0].note, editor: $EDITOR.data })
            if($DATA) clickRefresh(), setModal(false) 
        }
        setConfirm({msg: '메모를 수정하시겠습니까?', confirm: $CONFIRM})
    }
    const clickModifyGroup = async ()=>{
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/admin/user/modify/group', { id: input.id, group_list: input.group_list, group_name: input.group_name, group_level: input.group_level })
            if($DATA) clickRefresh()
        }
        setConfirm({msg: '태그를 수정하시겠습니까?', confirm: $CONFIRM})
    }
    const clickModifyTag = async ()=>{
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/admin/user/modify/tag', { id: input.id, user_position: input.user_position, user_title: input.user_title, user_tag: input.user_tag })
            if($DATA) clickRefresh()
        }
        setConfirm({msg: '태그를 수정하시겠습니까?', confirm: $CONFIRM})
    }
    const clickModifyEmail = async ()=>{
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/admin/user/modify/email', { id: input.id, email: input.email })
            if($DATA) clickRefresh()
        }
        setConfirm({msg: '이메일을 수정(발송)하시겠습니까?', confirm: $CONFIRM})
    }
    const clickModifyName = async ()=>{
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/admin/user/modify/name', { id: input.id, name: input.name })
            if($DATA) clickRefresh()
        }
        setConfirm({msg: '별명을 수정하시겠습니까?', confirm: $CONFIRM})
    }
    const clickUserModify = async ()=>{
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/admin/user/modify/level', { id: input.id, level: input.level })
            if($DATA) clickRefresh()
        }
        setConfirm({msg: '등급(레벨)을 수정하시겠습니까?', confirm: $CONFIRM})
    }
    const clickUserPass = async ()=>{
        const $INPUT = { code: input.code, pass: input.pass }
        const $CHECK = checkInput($INPUT)
        if($CHECK.code) return setPopup({msg: $CHECK.msg})
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/admin/user/modify/pass', { id: input.id, code: input.code, pass: input.pass })
            if($DATA) clickRefresh()
        }
        setConfirm({msg: '비밀번호를 수정하시겠습니까?', confirm: $CONFIRM})
    }

    return(<>
        {modal.image && <Modal_Image src={modal.image} setModal={setModal}/>}
        {modal.upload && <Modal title='프로필 이미지 등록' setModal={setModal}><Board_Upload setInput={setInput} setModal={setModal}/></Modal>}
        {modal.location && <Modal title='위치 정보' setModal={setModal}><User_Map location={list[0].location} setModal={setModal}/></Modal>}
        {/* {modal.block && <Modal title='⚙️회원 차단 관리' setModal={setModal}><Admin_User_Block user={list[0]} setModal={setModal} clickRefresh={clickRefresh}/></Modal>} */}
        {modal.block && <Modal title='⚙️회원 차단 관리' setModal={setModal}><Admin_Block_User user={list[0]} setModal={setModal} clickRefresh={clickRefresh}/></Modal>}

        <div className="pd_h1"><p className="lh_1 fwb ta_c">회원 검색</p></div>

        <div className="pd_1 ta_c mg_b1">
            <p className="lh_1 fs_13"><span className="c_blue fwb">검색 범위 : </span>아이디, 이메일, 별명, 아이피</p>
            <input className="input_search" type="text" name="search" placeholder="검색어를 입력해 주세요" onChange={setInput} onKeyDown={(e)=>{ if(e.key === 'Enter') clickSearch() }}/>
            <button className="input_bt c_blue fwb" onClick={()=> clickSearch()}>검색</button>
        </div>

        <div className="box pd_2 mg_b2">
            <p className="lh_2 fwb ta_c mg_b2">
                {paging.totalCount ? <>검색된 회원 <span className="c_orange fwb">{paging.totalCount}명</span></> : 
                    list.length ? <span className="c_blue">선택된 회원</span> : <span className="c_red">검색된 회원이 없습니다</span>
                }
            </p>

            {!!list.length && list.map((e)=> <div key={e.num} className="box_blue pd_2 mg_b2" onClick={()=>clickSelect(e)}>
                <p className="input mg_b2 align"><User_Level level={e.level}/>&nbsp;<span className="fwb">{e.name}</span><View_Char char='vl'/><span className="c_orange fwb">{e.id}</span></p>
                <p className="input bg mg_b2"><User_State obj={{blocked: e.blocked, state: e.state}}/></p>
                <p className="input mg_b2">가입 : <span className="fwb">{e.created}</span> ( <View_Date type='count' date={e.created}/> )</p>
                {e.name_history && <p className="input mg_b2">이전 별명 : <span className="c_gray fwb">{e.name_history?.replace(/,/g, `, `)}</span></p>}
                {e.name_updated && <p className="input mg_b2">별명 변경 : <span className="fwb">{e.name_updated}</span> ( <View_Date type='count' date={e.name_updated}/> )</p>}
                {e.blocked && <p className="input bg mg_b2">차단 기간 : <span className="c_red fwb">{e.blocked}</span> 까지</p>}
                <p className="input mg_b2"><span className="c_gray">마지막 활동 : </span><span className="c_blue fwb">{e.updated} ( <View_Date date={e.updated}/> )</span></p>
                <p className="input mg_b2">로그인 아이피 : <span className="fwb">{e.login_ip?.replace(/,/g, ` / `)}</span></p>
                <p className="input">메신저 : <span className="fwb">{e.messenger}</span></p>
            </div>)}

            {input.id && <div className="ta_c">
                {list[0].location ? 
                    <button className="bt_modal c_orange" onClick={()=>setModal({ location: true })}>위치 정보</button> : 
                    <button className="bt_modal c_gray">위치 정보 없음</button>
                }
                <button className="bt_modal c_red fwb" onClick={()=>setModal({ block: true })}>회원 차단 관리</button>
            </div>}
            <Pagination_Click paging={paging} page={clickPage}/>
        </div>

        {!input.id && <div className='box pd_2 ta_c'><span className="c_lgray fwb">선택한 회원이 없습니다</span></div>}
        {input.id && <>
            <p className="lh_2 ta_c mg_b2"><span className="fwb">회원 정보 수정</span></p>

            <div className="box_gray pd_2 mg_b2">
                <div className="flex mg_b2">
                    <div className={`${!input.image && 'bg'} box upload_preview`}>
                        {input.image && <img src={input.image} alt="preview" onClick={(e)=>onClickImage(e, setModal)} onError={onErrorImage}/>}
                    </div>
                    <div className="upload_box pd_l2 fs_13">
                        <div className="ta_c">
                            <p className="lh_1 fs_13 c_blue fwb">프로필 이미지</p>
                            <button className="bt_4m c_red" onClick={()=>setInput({image: ''})}>삭제</button>
                            <button className="bt_4m c_green mg_l1" onClick={()=>setModal({upload: true})}>등록</button>
                            <button className="bt_4m c_blue mg_l1" onClick={clickModifyProfile}>이미지 수정</button>
                        </div>
                    </div>
                </div>
            
                <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">관리자 메모 : </span><span className="c_gray">관리자만 보이는 메모입니다.</span></p>
                {modal.note ? <Tiptap_Editor value={list[0].note}/> : <div className="box pd_2"><Tiptap_Note note={list[0].note}/></div>}
                
                <div className="ta_c mg_t2">
                    {modal.note ? <>
                        <button className="bt_modal c_gray fwb" onClick={()=>setModal(false)}>취소</button>
                        <button className="bt_modal c_blue fwb" onClick={clickModifyMemo}>관리자 메모 저장</button>
                    </> : <button className="bt_modal c_blue fwb" onClick={()=>setModal({note: true})}>관리자 메모 수정</button>}
                </div>
            </div>  

            <div className="box_gray pd_2 mg_b2">
                <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">이메일 : </span><span id="email" className="c_gray">가입 인증 이메일이 발송됩니다. (10~50)</span></p>
                <input className="input mg_b2" type="text" name="email" placeholder="이메일을 입력해 주세요" onChange={setInput} value={input.email} onKeyUp={()=>{ checkInputColor('email', input.email) }}/>
                <p className="ta_c mg_b1">
                    <button className="bt_modal c_blue fwb" onClick={clickModifyEmail}>이메일 수정</button>
                </p>
            </div>

            <div className="box_gray pd_2 mg_b2">
                <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">별명 : </span><span id="name" className="c_gray">한글 2자 또는, 영문 4자 이후, 숫자 (2/4~12)</span></p>
                <input className="input mg_b2" type="text" name="name" placeholder="별명을 입력해 주세요" onChange={setInput} value={input.name} onKeyUp={()=>{ checkInputColor('name', input.name) }}/>
                <p className="ta_c mg_b1">
                    <button className="bt_modal c_blue fwb" onClick={clickModifyName}>별명 수정</button>
                </p>
            </div>

            <div className="box_gray pd_2 mg_b2">
                <p className="box pd_1 mg_b2"><User_Level_View/></p>
                <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">등급(레벨) : </span><span className="c_gray">등급(레벨)을 입력해 주세요. 숫자 (범위)</span></p>
                <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">현재 등급</span>&nbsp;<User_Level level={list[0].level}/><View_Char char='vl'/><span className="c_red fwb">변경할 등급</span>&nbsp;<User_Level level={input.level}/></p>
                <input className="input mg_b2" type="text" name="level" maxLength={3} placeholder="등급(레벨)을 입력해 주세요" onChange={setInput} value={input.level} />
                <p className="ta_c mg_b1"><button className="bt_modal c_blue fwb" onClick={clickUserModify}>등급 수정</button></p>
            </div>

            <div className="box_gray pd_2 mg_b2">
                <div className="mg_b1"><User_Group group_list={input.group_list}/></div>
                <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">그룹 목록 : </span><span className="c_gray">공백X, 콤마( , )로 구분</span></p>
                <input className="input mg_b2" type="text" name="group_list" placeholder="그룹 목록을 입력해 주세요" onChange={setInput} value={input.group_list} />
                <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">그룹 별명 : </span><span className="c_gray">공백X, 콤마( , )로 구분</span></p>
                <input className="input mg_b2" type="text" name="group_name" placeholder="그룹 별명을 입력해 주세요" onChange={setInput} value={input.group_name} />
                <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">그룹 등급(레벨) : </span><span className="c_gray">등급(레벨)을 입력해 주세요. 숫자 (0~200)</span></p>
                <input className="input mg_b2" type="text" name="group_level" maxLength={3} placeholder="그룹 등급(레벨)을 입력해 주세요" onChange={setInput} value={input.group_level} />
                <p className="ta_c"><button className="bt_modal c_blue fwb" onClick={clickModifyGroup}>그룹 수정</button></p>
            </div>

            <div className="box_gray pd_2 mg_b2">
                <User_Tag type='block' obj={input}/>
                <div className="mg_t2">
                    <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">담당(포지션) : </span><span className="c_gray">공백X, 콤마( , )로 구분</span></p>
                    <input className="input mg_b2" type="text" name="user_position" placeholder="담당(포지션)을 입력해 주세요" onChange={setInput} value={input.user_position} />
                    <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">칭호(타이틀) : </span><span className="c_gray">공백X, 콤마( , )로 구분</span></p>
                    <input className="input mg_b2" type="text" name="user_title" placeholder="칭호(타이틀)를 입력해 주세요" onChange={setInput} value={input.user_title} />
                    <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">정보(태그) : </span><span className="c_gray">공백X, 콤마( , )로 구분</span></p>
                    <input className="input mg_b2" type="text" name="user_tag" placeholder="정보(태그)를 입력해 주세요" onChange={setInput} value={input.user_tag} />
                    <p className="ta_c"><button className="bt_modal c_blue fwb" onClick={clickModifyTag}>태그 수정</button></p>
                </div>
            </div>

            <div className="box_gray pd_2 mg_b2">
                <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">본인 확인(인증) 번호 : </span><span id="code" className="c_gray">숫자 (6~8)</span></p>
                <input className="input mg_b2" type="text" name="code" placeholder="본인 확인(인증) 번호를 입력해 주세요" onChange={setInput} value={input.code}
                onKeyUp={()=>{ checkInputColor('code', input.code) }}/>

                <p className="lh_1 fs_13 pd_l1"><span className="c_blue fwb">비밀번호 : </span><span id="pass" className="c_gray">숫자 위 특수(-_=+)문자 가능 (10~20)</span></p>
                <input className="input mg_b2" type="text" name="pass" placeholder="비밀번호를 입력해 주세요" onChange={setInput} value={input.pass}
                onKeyUp={()=>{ checkInputColor('pass', input.pass) }}/>

                <p className="ta_c">
                    <button className="bt_modal c_orange fwb" onClick={clickUserPass}>비밀(인증)번호 수정</button>
                </p>
            </div>
        </>}
    </>)
}