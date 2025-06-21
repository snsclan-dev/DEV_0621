import { useEffect } from "react"
import { useRouter } from "next/navigation";
import { View_Char, View_Count, View_Date } from "modules";
import { checkManager, onErrorImage } from "modules/SYSTEM";
import { User_Level } from "components/user";
import { $BOARD_REPORT, $BOARD_STATE, Board_State, Board_Tag } from "components/board"

export const List_Search = ({app, search, list: e, user})=>{
    const { num, menu, category, period, count_report, state } = e;
    const { push } = useRouter()

    useEffect(()=> {
        const elements = document.querySelectorAll('.search');
        const regex = new RegExp(`${search}`, 'giu');
        elements.forEach(element => {
            const textContent = element.textContent.trim();
            const replacedHTML = textContent.replace(regex, match => { return `<span class="board_search">${match}</span>` });
            element.innerHTML = replacedHTML;
        });
    }, [search]);

    const clickLink = ()=>{
        if(!checkManager(user.level) && (count_report >= $BOARD_REPORT || state >= $BOARD_STATE['6_report'])) return null
        return push(`/${app}/read/${menu}/${category}/${num}`)
    }
    
    return(<>
        <div className='search_flex'>
            {e.image && <div className="search_list_image cursor" onClick={clickLink}><img src={e.image} alt="image" onError={onErrorImage}/></div>}
            <div className="search_info pd_w">
                <p><Board_State type='comment' obj={{ period, count_report, state }}/></p>
                <h3 className="lh_1 fs_15 event_title search mg_b cursor" onClick={clickLink}>{e.title}</h3>
                <p className="level_mg"><User_Level level={e.level}/>&nbsp;<span className="c_lblue fwb">{e.name}</span></p>
                <p className='lh_1 fs_13 c_gray'>댓글 <View_Count count={e.comment}/><View_Char char='vl'/>좋아요 <View_Count count={e.count_like}/><View_Char char='vl'/><View_Date date={e.created}/></p>
                <Board_Tag app={app} tag={e.tag}/>
            </div>
        </div>
    </>)
}