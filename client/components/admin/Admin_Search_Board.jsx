import { useState } from "react"
import { checkInput, useAxios, useInput, Pagination_Click, storeApp } from "modules"

export const Admin_Search_Board = ()=>{ // 작업중.....
    const { setLoading, setPopup } = storeApp.getState()
    const [input, setInput] = useInput({ table: 'board', search: '' })
    const [list, setList] = useState([])
    const [search, setSearch] = useState('')
    const [paging, setPaging] = useState([])

    const $TABLE = [ // select database table
        { table: 'board', name: '게시판' }, { table: 'event', name: '이벤트' }, { table: 'comment', name: '댓글' },
    ]
    const clickSearch = async (page=1)=>{
        setLoading(1500)
        if(!input.search) return setPopup({msg: '검색어를 입력해 주세요. (2~20)'})
        const $CHECK = checkInput({search: input.search})
        if($CHECK.code) return setPopup({msg: $CHECK.msg})
        const $DATA = await useAxios.post(`/admin/search/${page}`, { search: input.search })
        if($DATA) setList($DATA.list), setPaging($DATA.paging), setSearch(input.search)
    }
    return(<>
        <div className="box pd_h2 mg_h2">
            <p className="lh_1 fwb ta_c">게시판 통합 검색</p>

            <div className="flex_evenly ta_c pd_h2">
                {$TABLE.map((e, i)=> <div key={i}>
                    <label className="fs_13 fwb"><input className="input_radio" type="radio" name="type" onChange={setInput} value={e.table} defaultChecked={e.table === input.table}/>{e.name}</label>
                </div>)}
            </div>

            <div className='ta_c pd_1'>
                <input className="input_search" type="text" name='search' maxLength={20} placeholder='검색어를 입력해 주세요. (2-20)' onChange={setInput} value={input.search} 
                onKeyDown={(e)=>{ if(e.key === 'Enter') clickSearch(1)}}/>
                <button className="input_bt c_blue" onClick={()=>clickSearch(1)}>검색</button>
            </div>
        </div>
        
        <div className='box pd_1 fs_13 mg_b2'>
            <h1 className='lh_1'>검색 : <span className='fwb c_orange'>{search}</span></h1>
            <p className='lh_1'>결과 : <span className='fwb c_orange'>{paging.totalCount}개</span></p>
        </div>

        {/* <Board_Search_List blank={true} list={list} search={search}/> */}
        <Pagination_Click paging={paging} page={clickSearch}/>
    </>)
}