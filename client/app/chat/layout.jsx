'use client'
import { storeUser } from "modules"
import { Layout_App } from "components/app"
import { Chat_Enter, Chat_Menu } from "components/chat"
import 'components/chat/chat.css'

export default function Layout({children}){
    const { user } = storeUser((state)=>state)

    // if(!user.name || !user.chat || !user.location) return(<Chat_Enter user={user}/>)
    if(user.id && !user.location || !user.name || !user.chat) return(<Chat_Enter user={user}/>)
        
    return(<>
        <Chat_Menu app='chat' user={user}/>
        <Layout_App>{children}</Layout_App>
    </>)
}