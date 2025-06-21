'use client'
import { useEffect, useState } from "react";
import { useAxios, useModal, Pagination_Click, View_Date, storeApp } from "modules";
import { Message, Modal } from "components/app";
import { Admin_Block_IP } from "components/admin"


export const Block_List_Ip = ()=>{ // IP 차단
    const [modal, setModal] = useModal(false)
    const [user, setUser] = useState({})
    const [list, setList] = useState([])
    const [page, setPage] = useState(1)
    const [paging, setPaging] = useState([]);

    useEffect(()=>{
        const getList = async ()=>{
            const $DATA = await useAxios.get(`/admin/block/ip/list/${page}`)
            if($DATA) return setList($DATA.list), setPaging($DATA.paging)
        }
        getList()
    }, [page])

    const clickRefresh = async ()=>{
        return setPage(!page)
    }
    const clickUser = (user)=>{ setUser(user), setModal({user: true}) }

    return(<>
        {modal.user && <Modal title='⚙️ IP 차단 관리' setModal={setModal}><Admin_Block_IP user={user} setModal={setModal} clickRefresh={clickRefresh}/></Modal>}

        <p className="lh_2 ta_c mg_b1"><span className="fwb">IP(아이피) 차단 관리</span></p>
        
        {list.length ? <div className="flex_between">
            {list.map((e)=> <div key={e.num} className="box_between" onClick={()=>clickUser(e)}>
                <p className="lh_1 fwb">번호 : {e.num} / IP : {e.ip}</p>
                <p className="lh_1 pd_l"><View_Date date={e.created}/></p>
            </div>)}
        </div> : <Message>차단된 IP(아이피)가 없습니다.</Message>}

        <Pagination_Click paging={paging} page={setPage}/>
    </>)
}