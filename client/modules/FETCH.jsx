'use server'
import { cookies } from "next/headers";

const fetchCacheTime = (time = 0)=>{ return process.env.NODE_ENV === 'production' ? Number(time) : 0 }

export async function fetchInfo() {
    try {
        const $FETCH = await fetch(`${process.env.NEXT_PUBLIC_SERVER_MAIN}/app/info`, { next: { revalidate: 0 } });
        const $DATA = await $FETCH.json();
        return $DATA;
    } catch (error) {
        return false;
    }
}
export const fetchInfoFind = async ({app, menu, category})=>{
    const $FETCH_INFO = await fetchInfo();
    return $FETCH_INFO.find((e)=>{ return e.app_type !== 'menu' && e.app === app && e.menu === menu && e.category === category })
}
export async function fetchUser() { // store
    const $COOKIES = await cookies()
    const $TOKEN = $COOKIES.get(process.env.NEXT_PUBLIC_APP_NAME)?.value;
    try {
        const $FETCH = await fetch(`${process.env.NEXT_PUBLIC_SERVER_MAIN}/app/store`, { 
            next: { revalidate: fetchCacheTime(3600) }, headers: { authorization : `Bearer ${$TOKEN}` } 
        });
        const $DATA = await $FETCH.json();
        return $DATA;
    } catch (error) {
        return false;
    }
}
export async function fetchBoard(url){
    const $COOKIES = await cookies()
    const $TOKEN = $COOKIES.get(process.env.NEXT_PUBLIC_APP_NAME)?.value;
    try{
        const $FETCH = await fetch(`${process.env.NEXT_PUBLIC_SERVER_MAIN}/board/${url}`, {
            next: { revalidate: 0 }, headers: { authorization : `Bearer ${$TOKEN}` }})
            const $DATA = await $FETCH.json();
            return $DATA;
    }catch(err){
        return {code: 9, msg: '데이터를 가져오지 못했습니다.\ncode: fetchBoard'}
    }
}
export async function fetchChat(url){
    const $COOKIES = await cookies()
    const $TOKEN = $COOKIES.get(process.env.NEXT_PUBLIC_APP_NAME)?.value;
    try{
        const $FETCH = await fetch(`${process.env.NEXT_PUBLIC_SERVER_MAIN}/chat/${url}`, {
            next: { revalidate: 0 }, headers: { authorization : `Bearer ${$TOKEN}` }})
            const $DATA = await $FETCH.json();
            return $DATA;
    }catch(err){
        return {code: 9, msg: '데이터를 가져오지 못했습니다.\ncode: fetchChat'}
    }
}
export async function fetchMessenger(url){
    const $COOKIES = await cookies()
    const $TOKEN = $COOKIES.get(process.env.NEXT_PUBLIC_APP_NAME)?.value;
    try{
        const $FETCH = await fetch(`${process.env.NEXT_PUBLIC_SERVER_MAIN}/messenger/${url}`, {
            next: { revalidate: 0 }, headers: { authorization : `Bearer ${$TOKEN}` }})
            const $DATA = await $FETCH.json();
            return $DATA;
    }catch(err){
        return {code: 9, msg: '데이터를 가져오지 못했습니다.\ncode: fetchMessenger'}
    }
}
export async function fetchData(url) {
    try {
        const $FETCH = await fetch(`${process.env.NEXT_PUBLIC_SERVER_MAIN}${url}`, { next: { revalidate: 0 } });
        const $DATA = await $FETCH.json();
        return $DATA;
    } catch (error) {
        return false;
    }
}