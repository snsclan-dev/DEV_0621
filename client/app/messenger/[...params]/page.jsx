import { Messenger_Router } from "components/messenger/Messenger_Router";

export default async function Page({params}){
    const $PARAMS = (await params).params
    return await Messenger_Router($PARAMS)
}