'use client'
import Link from "next/link"
import { storeUser } from "modules"
import { $LINK } from "modules/SYSTEM"
import { Layout_App, Message } from "components/app"
import { Board_Menu } from "components/board"

export default function Layout({children}){
    const { user } = storeUser((state)=>state)

    if(!user.id && !user.guest) return(<Message>
        <p className="mg_b2">로그인이 필요합니다.</p>
        <Link href={`${$LINK.open}`} target="_blank"><button className="bt_3 c_blue">연구소 오픈채팅</button></Link>
    </Message>)
    return(<>
        <Board_Menu app='lab'/>
        <Layout_App>{children}</Layout_App>
    </>)
}