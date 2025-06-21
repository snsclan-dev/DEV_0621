import { useEffect } from "react";

export const User_Map = ({ location, setModal }) => {

    useEffect(() => {
        if (!location) return; // 위치 정보가 없을 경우 종료
        const [lat, lng] = location.split(",").map(Number);
        if (isNaN(lat) || isNaN(lng)) return
        
        window.kakao.maps.load(() => {
            const mapContainer = document.getElementById("location");
            const mapOption = { center: new window.kakao.maps.LatLng(lat, lng), level: 3 };
            const map = new window.kakao.maps.Map(mapContainer, mapOption);
            
            // 마커 생성 및 지도에 추가
            new window.kakao.maps.Marker({ position: new window.kakao.maps.LatLng(lat, lng), map });
        });
    }, [location]);

    return(<>
        <div id="location" className="box kakao_map mg_h2" />
        <div className="ta_c">
            <button className="bt_modal c_gray mg_l1" onClick={()=>setModal(null)}>닫기 (뒤로)</button>
        </div>
    </>)
};
