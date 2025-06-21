import { fetchData } from "modules/FETCH";
import { App_Email, App_Login, App_Register, Message } from "components/app";

export default async function Page({params}){
    const $PARAMS = (await params).params
    const [param, id, code] = $PARAMS
    
    if(param === 'auth'){
        const $DATA = await fetchData(`/main/email/${id}/${code}`)
        if($DATA.code) return(<Message>{$DATA.msg}</Message>)
        return <App_Email/>
    }
    if(param === 'register') return <App_Register/>
    if(param === 'login') return <App_Login/>
}