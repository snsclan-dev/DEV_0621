import { useEffect } from "react";
import { getDistance } from "modules/SYSTEM";

export const Kakao_Map = ({ user }) => {

    const initializeMap = () => {
        window.kakao.maps.load(() => {
            const mapContainer = document.getElementById("map");
            const mapOption = { center: new window.kakao.maps.LatLng(37.567513, 126.817353), level: 3 }; // 9호선 신방화역
            const map = new window.kakao.maps.Map(mapContainer, mapOption);
            const bounds = new window.kakao.maps.LatLngBounds(); // LatLngBounds 객체 생성
            const nameMap = {}; // 위치별로 이름을 모을 객체

            user.forEach((e) => {
                const markerPosition = new window.kakao.maps.LatLng(e.location.latitude, e.location.longitude);
                const key = `${e.location.latitude},${e.location.longitude}`; // 위치를 key로 사용하여 이름들을 모을 수 있도록

                // 위치별로 기존에 존재하는 마커들과의 거리 계산
                let found = false; // 이미 동일한 위치로 간주될 수 있는 마커가 있는지 여부
                for (const existingKey in nameMap) {
                    const [existingLat, existingLng] = existingKey.split(",");
                    const $DIST = getDistance(parseFloat(existingLat), parseFloat(existingLng), e.location.latitude, e.location.longitude);
                    if ($DIST <= 10) { // 반경 10m 기준으로 동일한 위치로 간주
                        nameMap[existingKey].push(e.name); // 이미 있는 위치에 이름 추가
                        found = true;
                        break;
                    }
                }
                // 동일한 위치가 없으면 새로 추가
                if (!found) nameMap[key] = [e.name];
                bounds.extend(markerPosition); // Bounds에 현재 마커의 좌표 추가
            });
            // nameMap 객체에서 각 위치별로 인포윈도우를 생성
            Object.keys(nameMap).forEach((key) => {
                const [lat, lng] = key.split(",");
                const markerPosition = new window.kakao.maps.LatLng(parseFloat(lat), parseFloat(lng));
                const marker = new window.kakao.maps.Marker({ map, position: markerPosition, title: nameMap[key].join(", ") }); // 여러 이름을 콤마로 구분하여 title에 설정
                const infowindow = new window.kakao.maps.InfoWindow({ content: `<div style="padding:5px;">${nameMap[key].join(", ")}</div>` }); // 여러 이름을 콤마로 구분하여 표시
                infowindow.open(map, marker); // 인포윈도우를 바로 표시
            });
            map.setBounds(bounds); // 모든 마커가 보이도록 지도 범위 재설정
        });
    };

    useEffect(() => {
        if (window.kakao && window.kakao.maps) initializeMap();
    }, [user]);

    return <div id="map" className="box kakao_map mg_h2" />;
};
