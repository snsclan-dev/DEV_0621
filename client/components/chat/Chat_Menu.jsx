import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { checkAdmin } from "modules/SYSTEM";

export const Chat_Menu = ({app, user})=>{
    const path = usePathname()

    useEffect(()=>{
        const clickRefresh = (e)=>{
            e.preventDefault() 
            e.returnValue = ''
            return ''
        }
        window.addEventListener('beforeunload', clickRefresh);
        return ()=> window.removeEventListener('beforeunload', clickRefresh) 
    },[])

    const $STYLE_MENU = (href)=>{
        if(path === href) return "c_green bg"
        return path.split('/')[2] === href ? "c_green bg" : "c_gray" 
    }

    if(path.split('/')[2] === 'room') return null // 대화방 대기실 메뉴 제거
    
    return(<div className="nav">
        <div className="max_w100 mg_0a">
            <Link href={`/${app}`}><button className={$STYLE_MENU(`/${app}`) + " header_menu"}>공지(안내)</button></Link>
            {checkAdmin(user.level) && <Link href={`/${app}/list/1`}><button className={$STYLE_MENU('list') + " header_menu"}>목록</button></Link>}
        </div>
    </div>)
}