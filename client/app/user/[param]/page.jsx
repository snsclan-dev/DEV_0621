'use client'
import { storeUser } from "modules";
import { User_Modify, User_Page } from "components/user";

export default function Page({params}){
    const { param } = params;
    const { user } = storeUser((state)=>state)

    if(param === 'profile') return <User_Page user={user}/>
    if(param === 'modify') return <User_Modify/>
}