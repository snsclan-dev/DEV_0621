import { fetchUser } from "modules/FETCH";
import { App_Notice } from "components/app";

export default async function Page(){
    const $USER = await fetchUser();
    return <App_Notice info={{ app: 'app', menu: 'chat', category: 'notice' }} user={$USER}/>
}