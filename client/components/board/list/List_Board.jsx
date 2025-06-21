import { useRouter } from 'next/navigation';
import { View_Date, View_Count, View_Timer } from "modules";
import { checkManager } from 'modules/SYSTEM';
import { User_Level } from 'components/user';
import { $BOARD_REPORT, $BOARD_STATE, Board_State } from 'components/board';

export const List_Board = ({info, list: e, user})=>{
    const { app, menu, category } = info, { num, period, count_report, state } = e;
    
    const { push } = useRouter()
    
    const clickLink = ()=>{
        if(!checkManager(user.level) && (count_report >= $BOARD_REPORT || state >= $BOARD_STATE['6_report'])) return null
        return push(`/${app}/read/${menu}/${category}/${num}`)
    }
    
    return(<>
        <div className='line board_list_title lh_2 pd_l align cursor' onClick={clickLink}>
            <Board_State type='list' obj={{ period, count_report, state }}/>&nbsp;<h3 className={`line board_title ellipsis`}><span>{e.title}</span></h3>
            {!!e.comment && <p className='line c_lgray fs_13 mg_l'>[<span className='fwb'><View_Count count={e.comment}/></span>]</p>}
        </div>
            
        <div className="line board_list_info fs_13">
            <p className="line board_list_user ellipsis"><User_Level type='ico' level={e.level}/>&nbsp;<span className="c_gray">{e.name}</span></p>
            <p className='line board_list_like ta_c'><span className='c_gray mg_r1'>♡</span><View_Count count={e.count_like}/></p>
            <p className='line board_list_created ta_c'>{e.period ? <View_Timer time={e.period}/> : <View_Date date={e.created}/>}</p>
        </div>
    </>)
}