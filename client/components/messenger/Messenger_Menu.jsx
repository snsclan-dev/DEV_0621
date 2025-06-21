import Link from "next/link";
import { usePathname } from "next/navigation";
import { storeUser } from "modules";
import { checkAdmin } from "modules/SYSTEM";

export const Messenger_Menu = ({app})=>{
    const path = usePathname()
    const { user } = storeUser((state)=>state)
    
    const $STYLE_MENU = (href)=>{
        if(path === href) return "c_green bg"
        return path.split('/')[2] === href ? "c_green bg" : "c_gray" 
    }

    return(<div className="nav">
        <div className="max_w100 mg_0a">
            <Link href={`/${app}`}><button className={$STYLE_MENU(`/${app}`) + " header_menu"}>공지(안내)</button></Link>
            <Link href={`/${app}/list/1`}><button className={$STYLE_MENU('list') + " header_menu"}>목록</button></Link>
            {checkAdmin(user.level) && <Link href={`/${app}/admin/1`}><button className="c_orange header_menu">⚙️관리</button></Link>}
        </div>
    </div>)
}