import { useEffect, useState } from "react"
import { useAxios } from "modules"

export const Admin_Monitor = ()=>{
    const [monitor, setMonitor] = useState(null)

    useEffect(()=>{
        const getMonitor = async ()=>{
            const $DATA = await useAxios.get('/admin/monitor')
            if($DATA) return setMonitor({event: $DATA.event, user: $DATA.user})
        }
        getMonitor()
    },[])

    if(!monitor) return null;
    return(<div className="box pd_1 mg_h2">
        <div className="pd_1"><p className="lh_1 fwb">데이터베이스 (이벤트 스케줄러)</p></div>

        {monitor.event?.map((e, i)=> <p key={i} className="lh_1 fs_13"><span className="c_blue fwb">{e.EVENT_NAME}</span> / <span className={e.STATUS ? 'c_green fwb' : 'c_red fwb'}>{e.STATUS}</span> / {e.EVENT_DEFINITION}</p>)}

        <div className="pd_h1"><hr /></div>

        <div className="pd_1">
            <p className="lh_1 fwb">회원</p>
            <p className="lh_1">정상 : <span className="c_blue fwb">{monitor.user.user}</span>명</p>
            <p className="lh_1">인증 대기 : <span className="c_blue fwb">{monitor.user.wait}</span>명</p>
            <p className="lh_1">차단 : <span className="c_blue fwb">{monitor.user.blocked}</span>명</p>
        </div>
    </div>)
}