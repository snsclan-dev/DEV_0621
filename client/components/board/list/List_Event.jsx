import { useRouter } from 'next/navigation';
import { View_Count, View_Char, View_Timer, View_Price_Won } from "modules";
import { checkManager, onErrorImage } from 'modules/SYSTEM';
import { $BOARD_REPORT, $BOARD_STATE, Board_State } from 'components/board';

export const List_Event = ({info, list: e, user})=>{
    const { app, menu, category } = info, { num, count_report, state } = e;
    const { push } = useRouter()

    const clickLink = ()=>{
        if(!checkManager(user.level) && (count_report >= $BOARD_REPORT || state >= $BOARD_STATE['6_report'])) return null
        return push(`/${app}/read/${menu}/${category}/${num}`)
    }
    
    return(<div className='pd_h'>
        <div className={`${!e.image && 'event_image_none bg'} line event_list_image cursor`} onClick={clickLink}>
            {e.image && <img src={e.image} alt="image" onError={onErrorImage}/>}
        </div>
        <div className='line event_list_info cursor' onClick={clickLink}>
            <h3 className="lh_1 fs_15 event_title align search"><Board_State type='list' obj={{ count_report, state }}/>{e.title}</h3>
            <p className='lh_1 fs_15'>
                {e.price && <View_Price_Won price={e.price}/>}
                {e.price && e.period && <View_Char char='vl'/>}
                {e.period && <View_Timer time={e.period}/>}
            </p>
            <p className='lh_1 fs_13 c_gray'>
                댓글(입찰) <View_Count count={e.comment}/><View_Char char='vl'/>좋아요 <View_Count count={e.count_like}/>
            </p>
        </div>
    </div>)
}