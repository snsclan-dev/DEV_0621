import Image from "next/image"
import { useEffect, useState } from "react"
import { storeApp, useAxios, useModal, View_Count, Pagination_Click } from "modules"
import { onClickImage } from "modules/SYSTEM"
import { Modal, Modal_Image } from "components/app"
import { Admin_Block_User } from "components/admin"

export const Admin_Folder = ()=>{
    const { setConfirm } = storeApp((state)=>state)
    const [modal, setModal] = useModal(false)
    const [list, setList] = useState({board: [], chat: [], temp: []})
    const [folder, setFolder] = useState({path: '', total: '', count: {}, date: ''})
    const [image, setImage] = useState([])
    const [paging, setPaging] = useState([])
    const [render, setRender] = useState(false)

    useEffect(()=>{
        const getFolder = async ()=>{
            const data = await useAxios.get('/admin/folder')
            if(data) setList(data.folder)
        }
        getFolder()
    },[render])

    const clickList = async (folder, date)=>{
        setImage([])
        const data = await useAxios.post(`/admin/folder/list`, { folder: folder, date: date })
        if(data) return setFolder({path: folder, total: data.total, count: data.count, date: date})
    }
    const clickFolder = async (userId)=>{
        setFolder({...folder, userId: userId})
        const data = await useAxios.post('/admin/folder/image', { folder: folder.path, date: folder.date, userId: userId, page: 1 })
        if(data) return setImage(data.image), setPaging(data.paging)
    }
    const clickPage = async (page = 1)=>{
        const data = await useAxios.post('/admin/folder/image', { folder: folder.path, date: folder.date, userId: folder.userId, page: page })
        if(data) return setImage(data.image), setPaging(data.paging)
    }
    const clickDelete = async (type)=>{
        const $type = { folder: `선택 폴더 : ${folder.path} / ${folder.date}`, user: `선택 폴더 : ${folder.path} / ${folder.date}\n대상 : ${folder.userId}` }
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/admin/folder/delete', { folder: folder.path, date: folder.date, userId: type === 'folder' ? false : folder.userId })
            if($DATA){
                if(type === 'folder') return setFolder({}), setImage([]), setRender(!render)
                clickList(folder.path, folder.date)
            }
        }
        setConfirm({msg: `${$type[type]}\n삭제하시곘습니까?`, confirm: $CONFIRM})
    }
    // const clickImage = (e)=>{ if(e.target.src) return setModal({image: e.target.src}) }
        
    return(<>
        {/* {modal.block && <Modal title='⚙️회원 차단 관리' setModal={setModal}><Admin_User_Block targetId={folder.userId} clickSearch={()=>setRender(!render)} setModal={setModal}/></Modal>} */}
        {modal.block && <Modal title='⚙️회원 차단 관리' setModal={setModal}><Admin_Block_User target_id={folder.userId} setModal={setModal}/></Modal>}
        {modal.image && <Modal_Image src={modal.image} setModal={setModal}/>}

        <div className="box pd_1 mg_b2">
            <p className="lh_1 pd_1 fwb">TEMP 폴더</p>
            {list.temp.map((e, i)=> <button key={i} className="bt_2m mg_r1" onClick={()=>clickList('temp', e)}>{e}</button>)}
        </div>
        
        <div className="box pd_1 mg_b2">
            <p className="lh_1 pd_1 fs_13 fwb">게시판(BOARD) 폴더</p>
            {list.board.map((e, i)=> <button key={i} className="bt_2m mg_r1" onClick={()=>clickList('images/board', e)}>{e}</button>)}
        </div>

        <div className="box pd_1 mg_b2">
            <p className="lh_1 pd_1 fs_13 fwb">채팅(CHAT) 폴더</p>
            {list.chat.map((e, i)=> <button key={i} className="bt_2m mg_r1" onClick={()=>clickList('images/chat', e)}>{e}</button>)}
        </div>

        {folder.date && <div className="box pd_1 mg_b2">
            <p className="lh_1 pd_1 fs_13 fwb">선택 폴더 : <span className="c_blue fwb">{folder.path}</span> / <span className="c_green fwb">{folder.date}</span></p>
            <button className="bt_2m mg_r1" onClick={()=>clickFolder(false)}><span className="c_blue fwb">전체</span>&nbsp;<span className="fwb">{folder.total}</span></button>
            {!folder.total && <button className="bt_2m c_red fwb" onClick={()=>clickDelete('folder')}>폴더 삭제</button>}
            {Object.keys(folder.count).map((e, i)=> <button key={i} className="bt_2m mg_r1" onClick={()=>clickFolder(e)}>{e} : {View_Count({count: folder.count[e]})}</button>)}
        </div>}

        {image.length > 0 && <div className="box pd_1 mg_b2">
            <div>
                {folder.date && <button className="bt_2m mg_r2" onClick={()=>clickDelete('folder')}>
                    <span className="c_blue fwb">{folder.path}</span> / <span className="c_green fwb">{folder.date}</span>
                </button>}
                    
                {folder.userId && <>
                    <button className="bt_2m mg_r2" onClick={()=>clickDelete('user')}><span className="fwb">{folder.userId}</span></button>
                    <button className="bt_2m" onClick={()=>setModal({block: true})}><span className="c_red fwb">차단 관리</span></button>
                </>}
            </div>
            <div className="pd_h2"><hr /></div>
            {image.map((e)=> <div key={e.num} className="admin_folder">
                <Image className="admin_folder_img" src={`/${process.env.NEXT_PUBLIC_FOLDER}/${process.env.NEXT_PUBLIC_APP_NAME}/${folder.path}/${folder.date}/${e.file}`} fill alt="folder" 
                onClick={(e)=>onClickImage(e, setModal)}/>
            </div>)}

            <Pagination_Click paging={paging} page={clickPage}/>
        </div>}
    </>)
}