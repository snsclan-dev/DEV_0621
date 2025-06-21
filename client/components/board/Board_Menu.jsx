import Link from "next/link";
import { usePathname } from "next/navigation";
import { storeApp } from "modules";

export const Board_Menu = ({app})=>{
    const path = usePathname()
    const { info } = storeApp((state)=>state)

    const $MENU = info.filter(e => e.app_type !== 'menu' && e.app === path.split('/')[1]).filter((e, i, arr) => arr.findIndex(f => f.menu === e.menu) === i );
    const $CATEGORY = info.filter(e => e.app_type !== 'menu' && e.app === path.split('/')[1] && e.menu === path.split('/')[3])
    
    const $STYLE_MENU = (href)=>{ return path.split('/')[3] === href ? "c_green bg" : "c_gray" }
    const $STYLE_CATEGORY = (href)=>{ return path.split('/')[4] === href ? "c_green bg" : "c_gray" }
    const $ROUTER = (e)=>{ return `/${app}/list/${e.menu}/${e.category}/1` }

    return(<div className="nav">
        <div className="max_w100 mg_0a">
            {$MENU.map((e)=> <Link key={e.num} href={$ROUTER(e)}><button className={$STYLE_MENU(e.menu) + " header_menu"}>{e.menu_name}</button></Link>)}
        </div>
        <div className="max_w100 mg_0a">
            {$CATEGORY.map((e)=> e.category_name && <Link key={e.num} href={$ROUTER(e)}><button className={$STYLE_CATEGORY(e.category) + " header_menu"}>{e.category_name}</button></Link>)}
        </div>
    </div>)
}