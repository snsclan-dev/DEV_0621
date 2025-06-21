'use client'
import Link from "next/link"
import { storeUser } from "modules"
import { $LINK } from "modules/SYSTEM"
import { Layout_App, Message } from "components/app"
import { Board_Menu } from "components/board"

export default function Layout({children}){
    const { user } = storeUser((state)=>state)
    
    if(!user.id && !user.guest) return(<Message>
        <div className="box_lgray pd_2 mg_t2">
            <p className="lh_1 pd_l fs_13 mg_b">대표(운영자)</p>
            <Link href={`${$LINK.admin}`} target="_blank"><button className="bt_3m c_blue">오픈채팅</button></Link>
        </div>
    </Message>)
            
    return(<>
        <Board_Menu app='guide'/>
        <Layout_App>{children}</Layout_App>
    </>)
}