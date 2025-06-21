import { storeApp, storeUser, View_Svg } from "modules"
import { clickScroll } from "modules/SYSTEM"

export const App_Footer = ()=>{
    const { setPopup } = storeApp((state)=>state)
    const { user } = storeUser((state)=>state)

    const clickLocation = ()=>{ // 위치 권한 요청
        navigator.geolocation.getCurrentPosition((position) => {}, (error)=>{
            if(error.code === error.PERMISSION_DENIED){
                setPopup({ msg: '위치 권한이 차단되었습니다.\n브라우저 설정에서 권한을 다시 허용해 주세요.' });
            }else{
                setPopup({ msg: `위치 권한 요청 오류!\n${error.message}`});
            }
        }, { enableHighAccuracy: true, maximumAge: 0 });
    }
    const clickView = ()=>{ // 뷰 변경
        const images = document.querySelectorAll('.tiptap_note img, .tiptap_note video');
        images.forEach(img => {
            const view = img.classList.toggle('expanded');
            if (view) {
                img.style.width = '100%';
                img.style.height = 'auto';
            } else {
                img.style.width = '';
                img.style.height = ''; // 기본값으로 초기화
            }
        })
    }

    return(<div className="footer pd_1">
        <div className="line w_20">
            <button className="bt_2" onClick={clickLocation}><View_Svg name='location' size={22} color={user.location ? 'green' : 'red'}/></button>
        </div>
        <div className="line w_60 ta_c">
            <button className="bt_2 tc_blue mg_l1" onClick={()=>clickScroll('top')}><View_Svg name='up' size={22} color='blue'/></button>
            <button className="bt_2 tc_blue mg_l1" onClick={()=>clickScroll('bottom')}><View_Svg name='down' size={22} color='blue'/></button>
            <button className="bt_2 tc_blue mg_l1" onClick={clickView}><View_Svg name='view' size={24} color='blue'/></button>
        </div>
        <div className="line w_20 ta_r">
            <button className="bt_hidden"></button>
        </div>
    </div>)
}