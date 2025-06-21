import Link from "next/link"
import { storeApp } from "modules"

export const Chat_Page = ({app})=>{
    const { info } = storeApp((state)=>state)

    const $MENU = info.filter((e)=> e.app_type !== 'menu' && e.app === app)
    const $VIEW = [...new Set($MENU.map(e => e.menu))].map(menu => ({ menu, menu_name: $MENU.find(e => e.menu === menu).menu_name, category: [...new Set($MENU.filter(e => e.menu === menu))] }))

    return(<>
        {$VIEW.map((e, ei)=> <div key={ei} className="box pd mg_b2">
            <p className="pd_l2 fs_13 c_blue fwb">{e.menu_name}</p>
            {e.category.map((c)=> <div key={c.num} className="box_category">
                <div className="box_lgray pd_1 ta_c box_hover">
                    <Link href={`/${app}/list/${c.menu}/${c.category}/1`}>
                        <p className="c_green fwb fs_13">{c.category_name ? c.category : <span className="c_orange">공지(안내)</span>}</p>
                        <p className="c_gray fwb fs_13">{c.note}</p>
                    </Link>
                </div>
            </div>)}
        </div>)}
    </>)
}