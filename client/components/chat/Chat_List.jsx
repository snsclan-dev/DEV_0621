import { useEffect, useState } from "react";
import Link from "next/link";
import { Pagination_Click, storeApp, useAxios, useModal, View_Char } from "modules";
import { checkAdmin } from "modules/SYSTEM";
import { Message, Modal } from "components/app";
import { User_Level } from "components/user";
import { Chat_Create, Chat_Status, Chat_Room_Type, chatStyle } from "components/chat";

export const Chat_List = ({user})=>{
    const { setLoading } = storeApp((state)=>state)
    const [list, setList] = useState([])
    const [paging, setPaging] = useState([])
    const [page, setPage] = useState(1)
    const [modal, setModal] = useModal(false)

    useEffect(()=>{
        const getList = async ()=>{
            const $DATA = await useAxios.get(`/chat/list/${page}`)
            if($DATA) setList($DATA.list), setPaging($DATA.paging)
        }
        getList()
    },[page])

    const clickRefresh = async ()=>{
        setLoading(1200)
        const $DATA = await useAxios.get(`/chat/list/0`)
        if($DATA) setList($DATA.list), setPaging($DATA.paging)
    }

    return(<div>
        {modal.create && <Modal title='대화방 만들기' setModal={setModal}><Chat_Create user={user} setModal={setModal}/></Modal>}

        <div className="box pd_1 fs_13 mg_b2">
            <p className='line w_50 c_gray'>대화방 목록</p>
            <p className='line w_50 ta_r'><button className='bt_3m c_blue' onClick={()=>setModal({create: true})}>방 만들기</button><button className="bt_3m c_green" onClick={clickRefresh}>새로 고침</button>
            </p>
        </div>

        {list.length ? <div className="flex_between">
            {list.map((e)=> <div key={e.num} className={chatStyle({ user_id: e.user_id, room_type: e.room_type }, user)}>
                <Link href={`/chat/room/${e.room}`}>
                    <p className="chat_title pd_l ellipsis mg_b">{e.title}</p>
                    <p className="align"><User_Level level={e.level}/>&nbsp;<span className="c_lblue fs_13 fwb">{e.name}</span></p>

                    <div className="pd_h1"><hr /></div>

                    <p className="align mg_b">
                        <Chat_Room_Type value={e.room_type}/>
                        <button className="bt_2m fs_13 c_gray"><span className={`${e.room_now >= e.room_max && 'c_red'}`}>{e.room_now}</span><View_Char char='sl'/><span>{e.room_max}</span></button>
                        {checkAdmin(user.level) && <Chat_Status status={e.status}/>}
                    </p>
                </Link>
            </div>)}
        </div> : <Message>만들어진 대화방이 없습니다.</Message>}

        <Pagination_Click paging={paging} page={setPage}/>
    </div>)
}