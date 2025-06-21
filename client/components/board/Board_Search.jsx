import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { storeApp, useInput, checkInput, Pagination_Link, View_Char } from "modules"
import { checkAdmin } from 'modules/SYSTEM';
import { Board_Check, boardStyle, List_Search } from 'components/board';
import { Message } from 'components/app';
import { User_Admin } from 'components/user';

const VIEW_LIST = React.memo(({app, search, list, user})=>{
    return <List_Search app={app} search={search} list={list} user={user}/>
})
VIEW_LIST.displayName = 'VIEW_LIST';

export const Board_Search = ({app, search, list, paging, user})=>{
    const { info, setLoading, setPopup } = storeApp((state)=>state)
    const { push } = useRouter()
    const [input, setInput] = useInput({search: ''})
    const [checkList, setCheckList] = useState([])
    const $ADMIN = checkAdmin(user.level)

    const clickSearch = (e)=>{
        e.target.blur()
        if(!user.id) return setPopup({msg: '로그인이 필요합니다.'})
        if(!input.search) return setPopup({msg: '검색어를 입력해 주세요. (2~20)'})
        setLoading(1500)
        const $CHECK = checkInput({search: input.search})
        if($CHECK.code) return setPopup({msg: $CHECK.msg})
        return push(`/${app}/search/${encodeURIComponent(input.search)}/1`)
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
    const Search_Info = ({menu, category})=>{
        const $FIND = info.find((e)=> e.app_type !== 'menu' && e.app === app && e.menu === menu && e.category === category )
        if($FIND) return(<>
            <span className='c_blue'>{$FIND.app_name}</span><View_Char char='vl'/>{$FIND.menu_name}<View_Char char='vl'/>{$FIND.category_name}
        </>)
    }

    return(<>
        <div className='box pd_1 fs_13 mg_b1'>
            <h1 className='lh_1'>검색 : <span className='fwb c_orange'>{search}</span></h1>
            <p className='lh_1'>결과 : <span className='fwb c_orange'>{paging.totalCount}개</span></p>
        </div>

        {$ADMIN && <div className='box_orange pd_1 mg_h2'>
            <div className='line w_50'><User_Admin level={user.level}/></div>
            <div className='line w_50 ta_r'>
                <button className="bt_2m mg_r1 c_green" onClick={clickCheckAll}>전체 선택</button>
                <button className="bt_2m c_orange" onClick={()=>setModal({admin: true})}>관리</button>
            </div>
        </div>}

        {/* {list.length ? list.map((e, i)=> <div key={e.num} className={`board_list ${boardStyle({count_report: e.count_report, state: e.state}, user.level)} ${e.user_id === user.id && 'state_bg_blue'}`}> */}
        {list.length ? list.map((e)=> <div key={e.num} className={`board_list ${boardStyle(e, user)}`}>
            <div className='lh_1 pd_l fs_13 align'>
                {$ADMIN && <Board_Check id={`check_${e.num}`} list={e} checkList={checkList} clickCheck={clickCheck}/>}
                <label htmlFor={`check_${e.num}`} className='fwb'><Search_Info menu={e.menu} category={e.category}/><View_Char char='vl'/><span className='c_green'>{e.num}</span></label>
            </div>
            <VIEW_LIST app={app} search={search} list={e} user={user}/>
        </div>) : <Message>작성된 글이 없습니다.</Message>}


        <div className='align ta_c pd_h2'>
            <input className="input_search" type="text" name='search' maxLength={20} placeholder='검색어를 입력해 주세요. (2-20)' onChange={setInput} value={input.search} onKeyDown={(e)=>{ if(e.key === 'Enter') clickSearch(e)}}/>
            <button className="input_bt c_blue" onClick={clickSearch}>검색</button>
        </div>

        <Pagination_Link url={`/board/search/${search}`} paging={paging}/>
    </>)
}