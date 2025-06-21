import { useEffect, useState } from "react";
import { useAxios, storeUser, View_Char } from "modules";

export const Admin_Log = () =>{
    const user = storeUser((state)=> state.user)
    const [render, setRender] = useState(false)
    const [list, setList] = useState([])
    const [log, setLog] = useState(false)

    useEffect(()=>{
        const getMonitor = async ()=>{
            const data = await useAxios.post('/admin/log/list')
            if(data) return setList(data.list)
        }
        getMonitor();
    },[user.admin, render])

    const clickLogFile = async (file)=>{
        const data = await useAxios.post('/admin/log/file', { file: file })
        if(data) return setLog({file: file, log: data.log})
    }
    const clickLogDelete = async (file)=>{
        const data = await useAxios.post('/admin/log/delete', { file: file })
        if(data){
            setLog(false)
            return setRender(!render)
        }
    }
    
    return(<>
        <div className="box pd_1 mg_b2">
            <div className="pd_1"><p className="lh_1 fwb">서버 로그 (파일)</p></div>
            {list.map((e, i)=> <button key={i} className="bt_3 mg_1" onClick={()=>clickLogFile(e)}>{e}</button>)}
        </div>
        {log && <div className="box pd_1">
            <p className="lh_3 c_blue fwb">
                {log.file}<View_Char char='vl'/><button className="bt_3 c_red fwb" onClick={()=>clickLogDelete(log.file)}>로그 삭제</button>
            </p>
            {log.log && <>
                <div className="pd_h1"><hr /></div>
                <div className="pre">{log.log}</div>
                <div className="sticky_b ta_c">
                    <br />
                    <button className="bt_3 c_red fwb" onClick={()=>clickLogDelete(log.file)}>로그 삭제</button>
                </div>
            </>}
        </div>}
    </>)
}