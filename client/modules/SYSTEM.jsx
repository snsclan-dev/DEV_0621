import dayjs from "dayjs";
import 'dayjs/locale/ko';
import { storeApp } from "modules";

export const $LINK = { bot: '', open: '', admin: '' }

export const $FILE_UPLOAD = {
    maxSize: 10, fileSize: 10 * 1024 * 1024,
    image: 1, // board image select(count)
    chat: 3, // chat image
}
export const $USER_ADMIN = 200, $USER_MANAGER = 100
export const checkAdmin = (level)=>{
    if(!level) return false
    if($USER_ADMIN === level) return true
    return false
}
export const checkManager = (level)=>{
    if(!level) return false
    if($USER_MANAGER <= level) return true
    return false
}
export const dateNow = ()=>{ // board period
    return dayjs().format('YYYY-MM-DD')
}
export const onClickImage = (e, setModal)=>{
    if(e.target.nodeName !== 'VIDEO'){
        if(e.target.nodeName === 'IMG') return setModal({image: e.target.src})
    }
}
export const onClickVideo = (e, setModal)=> setModal({ video: e.target.getAttribute('src') })
export const onErrorImage = (e) => {
    if (e.target.src !== '/image_error.png') e.target.src = '/image_error.png';
};
export const popupTimer = (time = 1000)=>{
    const setPopup = storeApp((state)=>{ state.setPopup })
    return setTimeout(()=>{ setPopup({popup: false}) }, time)
}
export const clickScroll = (move)=>{
    if(move === 'top') return window.scrollTo({top: 0, behavior: 'smooth'})
    if(move === 'bottom') return window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})
}
export const delay = (time)=>{
    return new Promise((resolve) =>{
        setTimeout(() => { resolve() }, time);
    });
}
export const getDistance = (lat1, lon1, lat2, lon2) => {
    lat1 = Number(lat1), lon1 = Number(lon1), lat2 = Number(lat2), lon2 = Number(lon2);
    const R = 6371; // 지구 반지름 (km)
    const toRad = Math.PI / 180;
    const dLat = (lat2 - lat1) * toRad;
    const dLon = (lon2 - lon1) * toRad;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // 거리 (m)로 반환
};
export const getDistance_backup = (lat1, lon1, lat2, lon2)=>{ // Haversine 공식으로 거리 계산 (위도, 경도를 이용)
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    // return R * c; // 거리 (km)
    return R * c * 1000; // 거리 (m)로 반환
}
export const watermark = (user) => {
    const { id, level, ip } = user;
    if(!ip || checkAdmin(level)) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const drawWatermark = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none'; // 클릭 방지
        canvas.style.zIndex = '9999';        // 최상위 배치

        // 워터마크 스타일 설정
        const fontSize = 24;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // 매우 희미한 회색

        // 45도 회전 설정
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI / 6);  // 45도 회전

        // 반복 워터마크 그리기
        for (let x = -canvas.width; x < canvas.width; x += 200) {
            for (let y = -canvas.height; y < canvas.height; y += 180) {
                ctx.fillText(id ? id : ip, x, y);
            }
        }
    };

    // 캔버스 추가 및 워터마크 그리기
    document.body.appendChild(canvas);
    drawWatermark();

    // MutationObserver 설정 (캔버스가 없으면 다시 추가)
    const observer = new MutationObserver(() => {
        if (!document.body.contains(canvas)) {
            document.body.appendChild(canvas);
            drawWatermark();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
};