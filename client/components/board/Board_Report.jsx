import { useRouter } from 'next/navigation';
import { useAxios, storeApp, useInput, checkInput, Text_Area } from "modules";
import { User_Level } from 'components/user';

// target_app: info.app, `${info.app}_comment`
export const Board_Report = ({target_app, obj, setModal})=>{
    const { setPopup, setConfirm } = storeApp((state)=>state)
    const { refresh } = useRouter()
    const [input, setInput] = useInput({note: ''}) // report_note

    const View_Target = ()=>{
        const $TARGET = target_app.split('_')
        if($TARGET[1] === 'comment') return '댓글'
        if($TARGET[0] === 'messenger') return '메신저'
        return '글'
    }
    
    const clickReport = async (e)=>{
        e.target.blur()
        if(input.note.length < 10) return setPopup({msg: '신고 내용을 작성해 주세요. (10~1000)'})
        const $CHECK = checkInput({note: input.note})
        if($CHECK.code) return setPopup({msg: $CHECK.msg})
        const $CONFIRM = async ()=>{
            const $DATA = await useAxios.post('/report/write', { type: 'report', target_app, target_num: obj.num, target_id: obj.user_id, report_note: input.note })
            if($DATA) return setModal(false), refresh()
        }
        setConfirm({msg: '허위 신고는 불이익을 받을 수 있습니다.\n신고는 취소할 수 없습니다. 계속 진행하시겠습니까?', confirm: $CONFIRM})
    }

    return(<>
        <p className='input mg_b1'><View_Target/> 번호 : <span className='c_green fwb'>{obj.num}</span></p>
        <p className='input mg_b1'>신고 대상 : <User_Level level={obj.level}/> {obj.name}</p>
        <div className="pd_h1"><Text_Area className="textarea scroll" maxRows={10} name='note' maxLength={1000} onChange={setInput} value={input.note}/></div>
        <div className="pd_h ta_c">
            <button className='bt_modal c_gray' onClick={()=>setModal({menu: obj.num})}>뒤로가기 (메뉴)</button>
            <button className="bt_modal c_red" onClick={clickReport}>신고하기</button>
        </div>
    </>)
}