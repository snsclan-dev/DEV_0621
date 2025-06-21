import { Admin_App, Admin_Monitor, Admin_Log, Admin_Folder, Block_List_User, Admin_Search_User, Admin_Socket_List, Block_List_Ip } from "components/admin";

export default async function Page({params}){
    const $PARAM = (await params).param
    
    if($PARAM === 'app') return <Admin_App/>
    if($PARAM === 'monitor') return(<>
        <Admin_Monitor/>
        <Admin_Log/>
    </>)
    if($PARAM === 'folder') return <Admin_Folder/>
    if($PARAM === 'socket') return <Admin_Socket_List/>
    if($PARAM === 'user') return <Admin_Search_User/>
    if($PARAM === 'block') return <Block_List_User/>
    if($PARAM === 'ip') return <Block_List_Ip/>
    return null
}