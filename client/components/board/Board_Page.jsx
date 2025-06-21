import Link from "next/link"
import { storeApp } from "modules"

export const Board_Page = ({app})=>{
    const { info } = storeApp((state)=>state)
    const $MENU = info.filter((e)=> e.app_type !== 'menu' && e.app === app)
    const $VIEW = [...new Set($MENU.map(e => e.menu))].map(menu => ({ menu, menu_name: $MENU.find(e => e.menu === menu).menu_name, category: [...new Set($MENU.filter(e => e.menu === menu))] }))
    // num: $MENU.find(e => e.menu === menu).num, 
    // .map(category => ({ category, category_name: $MENU.find(e=> e.menu === menu && e.category === category).category_name, note: $MENU.find(e => e.menu === menu && e.category === category).note }))

    return(<>
        {$VIEW.map((e, ei)=> <div key={ei} className="box_bg pd_b mg_b3">
            <p className="pd_h c_blue fwb ta_c bg mg_b">{e.menu_name}</p>

            {e.category.map((c)=> <div key={c.num} className="box_category">
                <div className="box_lgray pd_1 ta_c box_hover">
                    <Link href={`/${app}/list/${c.menu}/${c.category}/1`}>
                        <p className={`${c.category === 'notice' ? 'c_orange' : 'c_green'} fs_13 fwb mg_b`}>{!c.category_name ? c.menu_name : c.category_name}</p>
                        <p className="c_gray fs_13">{c.note}</p>
                    </Link>
                </div>
            </div>)}
        </div>)}
    </>)
}