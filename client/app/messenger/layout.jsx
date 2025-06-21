'use client'
import { storeUser } from "modules"
import { Layout_App, Message } from "components/app"
import { Messenger_Menu } from "components/messenger";
import { User_Auth } from "components/user";
import 'components/messenger/messenger.css'

export default function Layout({children}){
    const { user, setUser } = storeUser((state)=>state)

    if(!user.id) return <Message height={2}>로그인이 필요합니다.</Message>;
    if(!user.auth) return(<Layout_App>
        <p className="fwb ta_c">회원 인증</p>
        <User_Auth user={user} setUser={setUser}/>
    </Layout_App>)
    return(<>
        <Messenger_Menu app='messenger'/>
        <Layout_App>{children}</Layout_App>
    </>)
}