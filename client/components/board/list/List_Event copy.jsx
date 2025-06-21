import { useRouter } from 'next/navigation';
import { View_Count, View_Char, View_Date } from "modules";
import { onErrorImage } from 'modules/SYSTEM';
import { checkManager } from 'components/user';
import { $BOARD_REPORT, $BOARD_STATE, Board_State } from 'components/board';

export const List_Event = ({info, list: e, user})=>{
    const { app, menu, category } = info, { num, count_report, state } = e;
    const { push } = useRouter()

    const clickLink = ()=>{
        if(!checkManager(user.level) && (count_report >= $BOARD_REPORT || state >= $BOARD_STATE['6_report'])) return null
        return push(`/${app}/read/${menu}/${category}/${num}`)
    }
    
    return(<>
        <div className='event_flex cursor' onClick={clickLink}>
            <div className={`${!e.image && 'bg'} event_image`}>
                {e.image && <img src={e.image} alt="image" onError={onErrorImage}/>}
            </div>
            <div className="event_info pd_w">
                <h3 className="lh_1 fs_15 event_title align search"><Board_State type='list' obj={{ count_report, state }}/><span className='mg_l'>{e.title}</span></h3>
                {e.period && <p className='lh_1 fs_13 c_green'>{e.period}</p>}
                <p className='fs_13 c_gray'>
                    댓글 <View_Count count={e.comment}/><View_Char char='vl'/>좋아요 <View_Count count={e.count_like}/>
                    {app === 'board' && <><View_Char char='vl'/><View_Date date={e.created}/></>}
                    {app === 'board' && <><View_Char char='vl'/><span className="c_lblue fwb">{e.name}</span></>}
                    {/* {app === 'board' && <><View_Char char='vl'/><span style={{color: '#80aaff'}} className=" fwb">{e.name}</span></>} */}
                </p>
            </div>
        </div>
    </>)
}