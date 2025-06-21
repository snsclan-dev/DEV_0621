'use client'
import { storeUser } from "modules"
import { Layout_App, Message } from "components/app"
import { User_Auth, User_Menu } from "components/user"

export default function Layout({children}){
    const { user, setUser } = storeUser((state)=>state)

    if(!user.id) return <Message height={2}>로그인이 필요합니다.</Message>;
    if(!user.auth) return(<Layout_App>
        <p className="fwb ta_c">회원 페이지</p>
        <User_Auth user={user} setUser={setUser}/>
    </Layout_App>)
    return(<>
        <User_Menu/>
        <div className="layout_none">{children}</div>
    </>)
}