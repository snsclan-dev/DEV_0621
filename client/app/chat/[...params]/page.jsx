import Chat_Router from "components/chat/Chat_Router";

export default async function Page({params}){
    const $PARAMS = (await params).params
    return(await Chat_Router($PARAMS))
}