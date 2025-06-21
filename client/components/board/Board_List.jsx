import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkInput, storeApp, useModal, Pagination_Link, View_Char, View_Count } from "modules"
import { checkAdmin } from 'modules/SYSTEM';
import { Message, Modal } from 'components/app';
import { User_Admin } from 'components/user';
import { Board_Info, Board_Popup_Admin, Board_Check, List_Event, boardStyle, List_Board } from 'components/board';

const VIEW_LIST = React.memo(({info, list, user})=>{
    const { app } = info;
    if(app === 'event') return <List_Event info={info} list={list} user={user}/>
    return <List_Board info={info} list={list} user={user}/>
})
VIEW_LIST.displayName = 'VIEW_LIST';

export const Board_List = ({info, list, paging, user})=>{
    const { app, menu, category } = info
    const { setLoading, setPopup } = storeApp.getState()
    const $REF_SERACH = useRef(null);
    const { push } = useRouter()
    const [modal, setModal] = useModal(false)
    const [checkList, setCheckList] = useState([])
    const $ADMIN = checkAdmin(user.level)

    const clickCreate = ()=>{
        if(!user.id) return setPopup({msg: '로그인이 필요합니다.'})
        if(info.level_create > user.level) return setPopup({msg: `글쓰기 등급(레벨) : ${info.level_create}\n나의 등급(레벨) : ${user.level}`})
        push(`/${app}/write/${menu}/${category}`)
    }
    const clickCheck = (check, num)=>{
        if(check) setCheckList([...checkList, num])
        else setCheckList(checkList.filter((e)=> e !== num))
    }
    const clickCheckAll = ()=>{
        const $checkAll = []
        if(!checkList.length) list.forEach(e => $checkAll.push(e.num));
        setCheckList($checkAll)
    }
    const onChangeSearch = (e)=>{
        $REF_SERACH.current = e.target.value;
    }
    const clickSearch = (e)=>{
        e.target.blur()
        if(!user.id) return setPopup({msg: '로그인이 필요합니다.'})
        if(!$REF_SERACH.current) return setPopup({msg: '검색어를 입력해 주세요. (2~20)'})
        setLoading(1500)
        const $CHECK = checkInput({search: $REF_SERACH.current})
        if($CHECK.code) return setPopup($CHECK)
        return push(`/${app}/search/${encodeURIComponent($REF_SERACH.current)}/1`)
    }

    return(<div className='pd_h1'>
        {modal.admin && <Modal title='⚙️글 목록 관리' setModal={setModal}><Board_Popup_Admin info={info} checkList={checkList} setCheckList={setCheckList} setModal={setModal} /></Modal>}

        <Board_Info info={info}>{info.create && <button className='bt_4 c_blue' onClick={clickCreate}>글쓰기</button>}</Board_Info>

        {$ADMIN && <div className='box_orange pd_1 mg_h2'>
            <div className='line w_50'><User_Admin level={user.level}/></div>
            <div className='line w_50 ta_r'>
                <button className="bt_4 mg_r1 c_green" onClick={clickCheckAll}>전체 선택</button>
                <button className="bt_4 c_orange" onClick={()=>setModal({admin: true})}>관리</button>
            </div>
        </div>}

        {list.length ? list.map((e)=> <div key={e.num} className={`board_list ${boardStyle(e, user)}`}>
            {$ADMIN && <div className='lh_1 pd_l fs_13 align'><Board_Check id={`check_${e.num}`} list={e} checkList={checkList} clickCheck={clickCheck}/>
                <label htmlFor={`check_${e.num}`}>번호&nbsp;<span className='c_green fwb'>{e.num}</span><View_Char char='vl'/><span className='c_gray'>조회</span>&nbsp;<View_Count type='hit' count={e.count_hit}/></label>
            </div>}
            <VIEW_LIST info={{ app, menu, category }} list={e} user={user}/>
        </div>) : <Message>작성된 글이 없습니다.</Message>}

        {!!list.length && <div className='ta_c pd_h2 mg_t1'>
            <input ref={$REF_SERACH} className="input_search" type="text" name='search' maxLength={20} placeholder='검색어를 입력해 주세요. (2-20)' onChange={onChangeSearch} onKeyDown={(e)=>{ if(e.key === 'Enter') clickSearch(e)}}/>
            <button className="input_bt c_blue" onClick={clickSearch}>검색</button>
        </div>}

        <Pagination_Link url={`/${app}/list/${menu}/${category}`} paging={paging}/>
    </div>)
}