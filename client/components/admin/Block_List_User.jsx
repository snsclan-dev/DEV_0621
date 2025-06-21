import { useEffect, useState } from "react";
import { useAxios, useModal, View_Timer, Pagination_Click } from "modules";
import { Message, Modal } from "components/app";
import { Admin_Block_User } from "components/admin";
import { User_Level } from "components/user";

export const Block_List_User = ()=>{ // 회원 차단
    const [modal, setModal] = useModal(false)
    const [user, setUser] = useState({})
    const [list, setList] = useState([])
    const [page, setPage] = useState(1)
    const [paging, setPaging] = useState([]);

    useEffect(()=>{
        const getList = async ()=>{
            const $DATA = await useAxios.get(`/admin/user/block/list/${page}`)
            if($DATA) return setList($DATA.list), setPaging($DATA.paging)
        }
        getList()
    }, [page])

    const clickRefresh = async ()=>{
        return setPage(!page)
    }
    const clickUser = (user)=>{ setUser(user), setModal({user: true}) }

    return(<>
        {modal.user && <Modal title='⚙️ 회원 차단 관리' setModal={setModal}><Admin_Block_User user={user} setModal={setModal} clickRefresh={clickRefresh}/></Modal>}

        <p className="lh_2 ta_c mg_b1"><span className="fwb">회원 차단 관리</span></p>
        
        {list.length ? <div className="flex_between">
            {list.map((e)=> <div key={e.id} className="box_between" onClick={()=>clickUser(e)}>
                <p className="lh_1 fwb"><User_Level level={e.level}/>{e.name} ( {e.id} )</p>
                <p className="lh_1 pd_l"><View_Timer time={e.blocked}/></p>
            </div>)}
        </div> : <Message>차단된 회원이 없습니다.</Message>}

        <Pagination_Click paging={paging} page={setPage}/>
    </>)
}