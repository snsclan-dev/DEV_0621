import io from 'socket.io-client';
import { create } from "zustand";
import { checkAdmin, getDistance } from "modules/SYSTEM";

const $SOCKET_OPTION = { path: '/socket/', transports: ['websocket'], withCredentials: true, autoConnect: false }
// const $SOCKET = process.env.NODE_ENV === 'production' ? io($SOCKET_OPTION) : io(process.env.NEXT_PUBLIC_SERVER_SOCKET, $SOCKET_OPTION)
const $SOCKET = io(process.env.NEXT_PUBLIC_SERVER_SOCKET, $SOCKET_OPTION) ///
const $POSITION = { id: null, latitude: null, longitude: null } // id: watch

const geoLocation = (set, user)=>{
    if ($POSITION.id) navigator.geolocation.clearWatch($POSITION.id); // 중복 방지
    $POSITION.id = navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        if(!$POSITION.latitude && !$POSITION.longitude){
            set((state)=> ({ user: { ...state.user, location: { latitude, longitude } } })) // client location
            if(user.id) $SOCKET.emit('USER_LOCATION', { id: user.id, location: `${latitude},${longitude}` })
        }
        if($POSITION.latitude && $POSITION.longitude){
            const $DISTANCE = getDistance($POSITION.latitude, $POSITION.longitude, latitude, longitude);
            if($DISTANCE < 10) return; // 10m
        }
        $POSITION.latitude = latitude, $POSITION.longitude = longitude
        const $LOCATION = { latitude, longitude }
        $SOCKET.emit('SOCKET_LOCATION', { location: $LOCATION })
    }, (err)=>{
        // navigator.geolocation.clearWatch()
        set((state)=> ({ user: { ...state.user, location: null } })) // location off
        // storeApp.getState().setPopup({ msg: '원할한 이용을 위해 위치 권한을 허용해 주세요.' })
        $SOCKET.emit('SOCKET_LOCATION', { location: null })
    }, { enableHighAccuracy: checkAdmin(user.level) ? false : true, maximumAge: 30000, timeout: 15000 })
}
// 권한 상태 감지 로직
const changeLocation = async (set, user)=>{
    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
    if (permissionStatus.state === 'granted'){
        $POSITION.latitude = null;
        $POSITION.longitude = null;
        geoLocation(set, user);
    }
    if (permissionStatus.state === 'prompt') {
        geoLocation(set, user); // 사용자 선택을 대기하고 허용 시 자동으로 위치 갱신
    }
    permissionStatus.onchange = () => {
        if (permissionStatus.state === 'granted'){
            $POSITION.latitude = null;
            $POSITION.longitude = null;
            geoLocation(set, user);
        }
    };
}
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
                changeLocation(set, user)
            })
            if(user.id) $SOCKET.emit('MESSENGER_CHECK', { id: user.id });
        })
        $SOCKET.on('disconnect', (reason)=>{
            set((state)=> ({ user: { ...state.user, chat: null } }))
            console.log('SOCKET DISCONNECT', reason); ///
            // storeApp.getState().setPopup({ code: 9, msg: '채팅(대화방) 서버와 연결이 끊어졌습니다.\ncode: SOCKET_DISCONNECT'})
        })
    },
    setUser: (data) => {
        set((state)=> ({ user: { ...state.user, ...data} }))
    },
}))