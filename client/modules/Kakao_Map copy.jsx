import { useEffect } from "react";

export const Kakao_Map = ({ user }) => {

    const initializeMap = () => {
        window.kakao.maps.load(() => {
            const mapContainer = document.getElementById("map");
            const mapOption = { center: new window.kakao.maps.LatLng(37.567513, 126.817353), level: 3 } // 9호선 신방화역 (위도: 37.567513, 경도: 126.817353)
            const map = new window.kakao.maps.Map(mapContainer, mapOption);
            const bounds = new window.kakao.maps.LatLngBounds(); // LatLngBounds 객체 생성

            user.forEach((e)=>{
                const markerPosition = new window.kakao.maps.LatLng(e.location.latitude, e.location.longitude);
                const marker = new window.kakao.maps.Marker({ map, position: markerPosition, title: e.name });
                const infowindow = new window.kakao.maps.InfoWindow({ content: `<div style="padding:5px;">${e.name}</div>` }); // InfoWindow 생성
                infowindow.open(map, marker); // 인포윈도우를 바로 표시
                bounds.extend(markerPosition); // Bounds에 현재 마커의 좌표 추가
            });
            map.setBounds(bounds); // 모든 마커가 보이도록 지도 범위 재설정
        });
    };

    useEffect(() => {
        if(window.kakao && window.kakao.maps) initializeMap();
    }, [user]);

    return(<div id="map" className='box kakao_map mg_h2'/>)
};
