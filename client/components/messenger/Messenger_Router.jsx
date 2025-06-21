import { fetchUser } from "modules/FETCH";
import { Messenger_List, Messenger_Room } from "components/messenger";

export async function Messenger_Router(params){
    const [ router, room ] = params
    const $USER = await fetchUser();
    
    if(router === 'admin' || router === 'list') return <Messenger_List user={$USER}/>
    if(router === 'room') return <Messenger_Room room={room} user={$USER}/>
    return null;
}