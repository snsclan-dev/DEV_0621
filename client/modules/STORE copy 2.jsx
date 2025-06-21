import io from 'socket.io-client';
import { create } from "zustand";
import { $POSITION } from 'modules';
import { getDistance } from "modules/SYSTEM";

const $SOCKET_OPTION = { path: '/socket/', transports: ['websocket'], withCredentials: true, autoConnect: false }
const $SOCKET = process.env.NODE_ENV === 'production' ? io($SOCKET_OPTION) : io(process.env.NEXT_PUBLIC_SERVER_SOCKET, $SOCKET_OPTION)

export const storeApp = create((set, get)=>({
    info: [], popup: null, confirm: null, loading: null,
    initialize: (initialState) => set(initialState),
    setLoading: (time) => {
        set({ loading: true })
        if(time === true) return
        if(!time) return set({ loading: null })
        if(time) setTimeout(() => set({ loading: null }), time);
    },
    setPopup: (data) => { set({ popup: data }) },
    setConfirm: (data) => { set({ confirm: data }) },
}))
export const storeUser = create((set, get)=>({
    user: { id: null, name: null, location: null }, socket: $SOCKET,
    initialize: (initialState) => set(initialState),
    getSocket: ()=>{
        const { user } = get()
        $SOCKET.connect()
        $SOCKET.on('connect', ()=>{
            $SOCKET.emit('SOCKET_CREATE', { id: user.id, name: user.name, level: user.level }, (data)=>{
                if(data.code) return storeApp.getState().setPopup({ code: 9, msg: '관리자에게 문의(전달)해 주세요.\ncode: SOCKET_CREATE'})
                    navigator.geolocation.watchPosition((position) => {
                        const { latitude, longitude } = position.coords;
                        set((state)=> ({ user: { ...state.user, location: { latitude, longitude } } })) // client location true/false
                        if($POSITION.latitude && $POSITION.longitude){
                            const $DISTANCE = getDistance($POSITION.latitude, $POSITION.longitude, latitude, longitude);
                            if($DISTANCE < 10) return; // 10m
                        }
                        $POSITION.latitude = latitude, $POSITION.longitude = longitude
                        const $LOCATION = { latitude, longitude }
                        $SOCKET.emit('SOCKET_LOCATION', { location: $LOCATION })
                        return true
                    }, (err)=>{
                        // navigator.geolocation.clearWatch()
                    }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 })
                })
            if(user.id) $SOCKET.emit('MESSENGER_CHECK', { id: user.id });
        })
    },
    setUser: (data) => {
        set((state)=> ({ user: { ...state.user, ...data} }))
    },
}))