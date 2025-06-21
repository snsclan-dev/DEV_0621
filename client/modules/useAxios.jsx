import axios from "axios";
import Cookies from "js-cookie";
import { storeApp } from "modules";

const axiosHeaders = { 'cache-control': 'no-cache', 'Authorization': `Bearer ${Cookies.get(process.env.NEXT_PUBLIC_APP_NAME)}` }
const instance = axios.create({ withCredentials: true, baseURL: '/api', headers: axiosHeaders, timeout: 10000 })

const { setLoading, setPopup, setConfirm } = storeApp.getState()

instance.interceptors.request.use((config)=>{
    if(config.data) setLoading(true);
    return config;
}, (err)=>{ return Promise.reject(err) })

instance.interceptors.response.use((response)=>{
    if(response.data) setLoading(600);
    return response;
}, (err)=>{ return Promise.reject(err) })

const $AXIOS = async (method, url, data) => {
    const $OBJ = method === 'get' ? { params: data } : { data }
    try{
        const $DATA = await instance.request({ method, url, ...$OBJ }).then(res =>{ return res.data }).catch(err =>{ return { code: 2, msg: err } })
        // server response code 0: success, 1: fail(none data), 2: server error, 3: login redirect
        if($DATA){
            const { code, msg } = $DATA;
            if(code === 3) { // code: 3 token, ip check error
                axios.defaults.headers.Authorization = 'Bearer undefined';
                Cookies.remove(process.env.NEXT_PUBLIC_APP_NAME);
                const $CONFIRM = async ()=>{ return location.replace('/login') }
                setConfirm({msg: '로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?', confirm: $CONFIRM})
                return false;
            }
            if(msg) setPopup({ code: code, msg: msg });
            if(code > 0) return false;
        }
        return $DATA;
    }catch(err){
        setPopup({ code: 9, msg: '관리자에게 문의(전달)해 주세요.\ncode: AXIOS' });
        return false;
    }
};
export const useAxios = {
    get: (url, data) => $AXIOS('get', url, data),
    post: (url, data) => $AXIOS('post', url, data),
};