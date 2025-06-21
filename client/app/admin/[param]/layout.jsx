'use client'
import { storeUser } from "modules";
import { checkAdmin } from "modules/SYSTEM";
import { Admin_Menu } from "components/admin";
import { Message } from "components/app";
import { User_Auth } from "components/user";
import "components/admin/admin.css"

export default function Layout({children}){
    const { user, setUser } = storeUser((state)=>state)

    if(!checkAdmin(user.level)) return(<Message>운영자가 아닙니다.</Message>)
    
    if(!user.auth) return(<div className="layout_none">
        <p className="fwb ta_c">관리자 페이지</p>
        <User_Auth user={user} setUser={setUser}/>
    </div>)

    return(<>
        <Admin_Menu/>
        <div className="layout_none">{children}</div>
    </>)
}