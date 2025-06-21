import { useEffect, useState } from "react";
import Link from "next/link"
import { Pagination_Click, storeApp, storeUser, useAxios, View_Char, View_Date } from "modules"
import { clickScroll } from "modules/SYSTEM";
import { User_Level } from "components/user"
import { Msg_State } from "components/messenger";

export const Messenger_List = ({user})=>{
    const { setLoading } = storeApp((state)=>state)
    const { socket } = storeUser((state)=>state)
    const [list, setList] = useState([])
    const [paging, setPaging] = useState([])
    const [page, setPage] = useState(1)

    useEffect(()=>{
        const getList = async ()=>{
            const $DATA = await useAxios.get(`/messenger/list/${page}`)
            if($DATA) setList($DATA.list), setPaging($DATA.paging)
        }
        getList()
    },[page])

    useEffect(()=>{
        socket.on('MESSENGER_ROOM', ()=>{
            clickRefresh(), clickScroll('top')
        })
        return ()=> socket.removeAllListeners('MESSENGER_ROOM');
    },[socket])

    const clickRefresh = async ()=>{
        setLoading(1200)
        const $DATA = await useAxios.get(`/messenger/list/0`)
        if($DATA) setList($DATA.list), setPaging($DATA.paging)
    }
    const $STATE = (obj)=>{
        if(obj.user_id !== user.id && obj.state === 0) return true
        return false
    }

    return(
        <div>
            <div className="box fs_13 pd_1 mg_b2">
                <p className='line w_70 c_gray'>메세지 목록</p>
                <p className='line w_30 ta_r'>
                    {/* <button className="bt_3m c_green" onClick={clickRefresh}>새로 고침</button> */}
                </p>
            </div>

            {list.map((e)=> <div key={e.num} className={`${$STATE(e) ? 'box_blue' : 'box'} pd_1 mg_b2`}>
                <Link href={`/messenger/room/${e.room}`}>
                    <div className="fs_13">
                        {e.user.map((e, i)=> <div key={i} className="line box_lgray fs_13 pd mg cursor"><User_Level level={e.level}/>{e.name}&nbsp;</div>)}
                    </div>
                    <div className="lh_2 fs_13 pd_l">
                        <View_Date date={e.created}/><View_Char char='vl'/><Msg_State obj={e} user={user}/>
                    </div>
                    <p className="lh_1 pd_l fs_13 ellipsis">{e.note}</p>
                </Link>
            </div>)}
    
            <Pagination_Click paging={paging} page={setPage}/>
        </div>
    )
}