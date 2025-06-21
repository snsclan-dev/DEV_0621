import { useEffect } from "react"

export const Location = ({ latitude, longitude })=>{
    console.log('location : ', latitude, longitude);
    
    useEffect(() => {
        const kakaoMapScript = document.createElement('script')
        kakaoMapScript.async = false
        kakaoMapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP}&autoload=false`
        document.head.appendChild(kakaoMapScript)

        const onLoadKakaoAPI = () => {
            window.kakao.maps.load(() => {
                var container = document.getElementById('map')
                var options = { center: new window.kakao.maps.LatLng(latitude, longitude), level: 3 }
                var map = new window.kakao.maps.Map(container, options)

                var positions = [
                    { title: '카카오',  latlng: new window.kakao.maps.LatLng(33.450705, 126.570677) },
                    { title: '생태연못',  latlng: new window.kakao.maps.LatLng(33.450936, 126.569477) },
                    { title: '텃밭',  latlng: new window.kakao.maps.LatLng(33.450879, 126.569940) },
                    { title: '근린공원', latlng: new window.kakao.maps.LatLng(33.451393, 126.570738) }
                ];

                var imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; 

                positions.forEach((e)=>{
                    const position = new window.kakao.map.LatLng(e.latitude, e.longitude)
                    new window.kakao.maps.Marker({
                        map: map, position: position, image: imageSrc
                    })
                })
    
                // for (var i = 0; i < positions.length; i ++) {
                //     var imageSize = new window.kakao.maps.Size(24, 35); 
                //     var markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize); 
                //     var marker = new window.kakao.maps.Marker({
                //         map: map, // 마커를 표시할 지도
                //         position: positions[i].latlng, // 마커를 표시할 위치
                //         title : positions[i].title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
                //         image : markerImage // 마커 이미지 
                //     });
                // }

                // var markerPosition  = new window.kakao.maps.LatLng(latitude, longitude); 
                // var marker = new window.kakao.maps.Marker({
                //     position: markerPosition
                // });
                
                // marker.setMap(map);
            })
        }
        kakaoMapScript.addEventListener('load', onLoadKakaoAPI)
    }, [map, markers])

    return(<div id="map" className="box" style={{ width: "100%", height: "600px" }} />)
}