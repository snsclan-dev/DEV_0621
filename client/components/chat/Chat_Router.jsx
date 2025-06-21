import { checkAdmin } from "modules/SYSTEM";
import { fetchChat, fetchUser } from "modules/FETCH";
import { Message } from "components/app";
import { Chat_List, Chat_Room } from "components/chat";

export default async function Chat_Router(params){
    const [ router, room, page ] = params
    const $PARAMS = [router, room, page]
    const $PARAMS_URL = $PARAMS.filter(Boolean).join('/');
    const $USER = await fetchUser();

    if(router === 'room'){
        const $CHAT_ROOM = await fetchChat($PARAMS_URL);
        if($CHAT_ROOM.code) return(<Message>{$CHAT_ROOM.msg}</Message>)
        return <Chat_Room room={$CHAT_ROOM.room}/>
    }
    if(router === 'list'){
        if(!checkAdmin($USER.level)) return <Message>관리자가 아닙니다.</Message>
        return <Chat_List user={$USER}/>
    }
    return null
}