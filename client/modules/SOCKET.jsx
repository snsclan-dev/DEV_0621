import io from 'socket.io-client';
import { storeApp } from "modules";
// import { getDistance } from 'modules/SYSTEM';

const $SOCKET_OPTION = { path: '/socket/', transports: ['websocket'], withCredentials: true, autoConnect: false }
export const $SOCKET = process.env.NODE_ENV === 'production' ? io($SOCKET_OPTION) : io(process.env.NEXT_PUBLIC_SERVER_SOCKET, $SOCKET_OPTION)

export const socketData = (data)=>{
    const { setLoading, setPopup, setConfirm } = storeApp.getState()
    const { code, msg } = data;
    setLoading(1200);
    if(code === 3){
        const $CONFIRM = async ()=>{ return location.replace('/chat') }
        setConfirm({ msg: '대화명 정보가 없습니다. 대화명 입력 페이지로 이동하시겠습니까?', confirm: $CONFIRM})
        return false;
    }
    if(msg) setPopup({ code, msg });
    if(code > 0) return false;
    return data;
}

// export const $POSITION = { latitude: null, longitude: null }
// export const socketLocation = ()=>{
//     navigator.geolocation.watchPosition((position) => {
//         const { latitude, longitude } = position.coords;
//         if($POSITION.latitude && $POSITION.longitude){
//             const $DISTANCE = getDistance($POSITION.latitude, $POSITION.longitude, latitude, longitude) * 1000; // km → m 변환
//             if($DISTANCE < 5) return; // 5m 이하 이동 시 무시
//         }
//         $POSITION.latitude = latitude, $POSITION.longitude = longitude // 새로운 위치 업데이트
//         const $LOCATION = { latitude, longitude }
//         // $SOCKET.emit('SOCKET_LOCATION', { location: $LOCATION }, (data)=>{})
//         $SOCKET.emit('SOCKET_LOCATION', { location: $LOCATION })
//         return true
//     }, (err)=>{
//         // if(err.code === err.PERMISSION_DENIED || err.code === 1) setPopup({ code: 7, msg: "위치 권한이 필요합니다." });
//     }, {  // 옵션 추가
//         enableHighAccuracy: true,   // 정확한 위치를 요청
//         maximumAge: 10000,           // 10초 동안 동일 위치 정보를 재사용, 이후 재요청
//         timeout: 10000              // 위치 정보를 요청 후, 최대 10초 동안 받을 수 없으면 실패
//     })
// }