import { Board_Router } from "components/board/Board_Router";

export default async function Page({params}){
    const $PARAMS = (await params).params
    return await Board_Router('event', $PARAMS)
}