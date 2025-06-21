import { useEffect, useRef, useState } from "react";
import { getDistance } from "modules/SYSTEM";

export const Kakao_Map = ({ user }) => {
    const mapRef = useRef(null); // map 객체를 캐싱할 useRef
    const markersRef = useRef([]); // 마커 객체들을 저장할 useRef
    const infowindowsRef = useRef({}); // 인포윈도우를 관리할 객체
    const [auto, setAuto] = useState(true) // map 자동 조정
    const [update, setUpdate] = useState(true) // map 업데이트 여부

    const initializeMap = () => {
        if (mapRef.current) return; // 이미 맵이 초기화되었다면 return
        window.kakao.maps.load(() => {
            const mapContainer = document.getElementById("map");
            const mapOption = { center: new window.kakao.maps.LatLng(37.567513, 126.817353), level: 3 };
            mapRef.current = new window.kakao.maps.Map(mapContainer, mapOption); // 한 번만 생성
            window.kakao.maps.event.addListener(mapRef.current, "dragend", () => setAuto(false)); // 사용자 지도 이동 감지
            // window.kakao.maps.event.addListener(mapRef.current, "zoom_changed", () => setAuto(false));
        });
    };
    const clickAuto = ()=>{ // 자동 모드로 전환될 때만
        if(!auto){
            const bounds = new window.kakao.maps.LatLngBounds();
            markersRef.current.forEach(marker => bounds.extend(marker.getPosition()));
            mapRef.current.setBounds(bounds);
        }
        setAuto(!auto)
    }
    const clickUpdate = ()=> setUpdate((prev) => !prev)

    useEffect(() => {
        if(window.kakao && window.kakao.maps) initializeMap();
    }, []); // 초기 1회만 실행

    useEffect(() => {
        if (!update) return; // 업데이트 중지 상태면 아무것도 하지 않음
        if (!mapRef.current) return; // map이 초기화되지 않았다면 return
        if (!mapRef.current) return; // map이 초기화되지 않았다면 return

        // 기존 마커 삭제
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = []; // 마커 배열 초기화

        // 기존 인포윈도우 제거
        Object.values(infowindowsRef.current).forEach(infowindow => infowindow.close());
        infowindowsRef.current = {}; // 인포윈도우 객체 초기화

        const bounds = new window.kakao.maps.LatLngBounds();
        const nameMap = {};

        user.forEach((e) => {
            if (!e.location || !e.location.latitude || !e.location.longitude) return;
            const markerPosition = new window.kakao.maps.LatLng(e.location.latitude, e.location.longitude);
            const key = `${e.location.latitude},${e.location.longitude}`;

            let found = false;
            for (const existingKey in nameMap) {
                const [existingLat, existingLng] = existingKey.split(",");
                const $DIST = getDistance(parseFloat(existingLat), parseFloat(existingLng), e.location.latitude, e.location.longitude);
                if ($DIST <= 10) {
                    nameMap[existingKey].push(e.name ? e.name : '손님');
                    found = true;
                    break;
                }
            }
            if (!found) nameMap[key] = [e.name];
            bounds.extend(markerPosition);
        });

        if (Object.keys(nameMap).length === 0) return; // nameMap이 비어 있으면 실행 안 함
        Object.keys(nameMap).forEach((key) => {
            const [lat, lng] = key.split(",");
            const markerPosition = new window.kakao.maps.LatLng(parseFloat(lat), parseFloat(lng));
            const marker = new window.kakao.maps.Marker({ map: mapRef.current, position: markerPosition, title: nameMap[key].join(", ") });
            markersRef.current.push(marker); // 새로운 마커를 배열에 추가

            // 해당 위치에 이미 인포윈도우가 열려있는지 확인
            if (!infowindowsRef.current[key]) {
                // const infowindow = new window.kakao.maps.InfoWindow({ content: `<div style="padding:5px;">${nameMap[key].join(", ")}</div>` });
                const infowindow = new window.kakao.maps.InfoWindow({ content: `<div style="width: 180px;padding:5px;">${nameMap[key].join("<br/>")}</div>` });
                infowindow.open(mapRef.current, marker); // 인포윈도우를 바로 표시
                infowindowsRef.current[key] = infowindow; // 해당 위치에 대한 인포윈도우 저장
            }
        });

        // mapRef.current.setBounds(bounds);
        if(auto) mapRef.current.setBounds(bounds); // 사용자가 이동하지 않았을 때만 자동으로 bounds 조정
    }, [user, update]); // user, update가 변경될 때마다 마커 업데이트

    // return <div id="map" className="box kakao_map mg_h2" />;
    return(<>
        <div id="map" className="box kakao_map mg_h2" />
        <div className="mg_b2">
            {/* <button className="bt_map" onClick={clickAuto}><View_Svg name='location' color={auto ? 'green' : 'gray'}/>&nbsp;{auto ? <span className="c_green">자동</span> : <span className="c_gray">수동</span>}</button> */}
            <button className="bt_3m" onClick={clickAuto}>{auto ? <span className="c_green">자동</span> : <span className="c_gray">수동</span>}</button>
            <button className="bt_3m" onClick={clickUpdate}>{update ? <span className="c_green">실시간 업데이트</span> : <span className="c_gray">업데이트 중지</span>}</button>
        </div>
    </>)
};