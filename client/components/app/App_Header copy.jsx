import axios from "axios"
import Cookies from "js-cookie"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { $META, useAxios, storeUser, storeApp, useModal, View_Svg } from "modules"
import { checkAdmin, watermark } from "modules/SYSTEM"
import { Confirm, Loading, Modal, Popup } from "components/app"

export const App_Header = ({info, user})=>{
    const path = usePathname()
    const { push } = useRouter()
    const { loading, setLoading, popup, setPopup, confirm, setConfirm } = storeApp((state)=>state)
    const { user: $USER, setUser, socket, getSocket } = storeUser((state)=>state)
    const [modal, setModal] = useModal(false)
    const [count, setCount] = useState(false)
    
    useEffect(() => {
        storeApp.getState().initialize({ info: info });
        storeUser.getState().initialize({ user: { ...user } });
        getSocket()
        watermark(user)
        // const $MARK = watermark(user);
        // return () => $MARK();
    }, [info, user, getSocket]);

    useEffect(()=>{
        socket.on('MESSENGER_NOTICE', (data)=>{
            if(data.msg) setPopup({ msg: data.msg })
            setCount(data.count)
        })
        return ()=> socket.removeAllListeners();
    }, [socket])

    const $MENU = info.filter((e)=>{ return e.app_type === 'menu' && e.level_read <= user.level }) // 메인 메뉴
    
    const $STYLE = (app)=>{
        if(app === path.split('/')[1]) return "c_blue bg"
        return "c_gray"
    }
    const clickMenu = (menu)=>{
        if(menu === 'menu') return setModal({menu: true})
        if(menu === 'login') push('/login')
        if(menu === 'admin'){
            const $CONFIRM = ()=> push('/admin/monitor')
            setConfirm({ msg: '관리자 페이지로 이동하시겠습니까?', confirm: $CONFIRM })
        }
        if(menu === 'messenger'){
            const $CONFIRM = ()=> push('/messenger')
            setConfirm({ msg: '메신저로 이동하시겠습니까?', confirm: $CONFIRM })
        }
        if(menu === 'profile'){
            const $CONFIRM = ()=> push('/user/profile')
            setConfirm({ msg: '내 정보(설정)로 이동하시겠습니까?', confirm: $CONFIRM })
        }
        setModal(false)
    }
    const clickGuest = async ()=>{ // 손님 로그인
        const $CONFIRM = ()=>{
            setLoading(1000)
            setUser({ guest: !$USER.guest ? true : null })
        }
        setConfirm({ msg: !$USER.guest ? '손님으로 로그인 하시겠습니까?' : '로그아웃 하시겠습니까?', confirm: $CONFIRM })
    }
    const clickLogout = async ()=>{
        const $DATA = await useAxios.get('/main/logout')
        if($DATA){
            axios.defaults.headers.Authorization = 'Bearer undefined';
            Cookies.remove(process.env.NEXT_PUBLIC_APP_NAME);
            return location.replace('/')
        }
    }
    const Login_View = ()=>{
        if(user.id) return(<div className="line" onClick={()=>clickMenu('menu')}>
            <button className="bt_none">{count && <View_Svg name='message' size={22} color="blue"/>}</button>
            <button className={`${user.id ? 'c_orange' : 'c_lgray' } header_bt`}>메뉴</button>
        </div>)
        if($USER.guest) return(<button className="bt_none c_lgray" onClick={clickGuest}>손님</button>)
        return(<p>
            <button className='header_bt c_white' onClick={clickGuest}>손님</button>
            <Link href="/login"><button className="header_bt c_lgray">로그인</button></Link>
        </p>)
    }
    const Modal_Menu = ()=>{
        if(!user.id) return null;
        return(<>
            <p className="pd_l1 c_gray mg_b2 ta_c">※ 작업을 모두 종료한 후 클릭해 주세요.</p>
            <div className="box pd_1 mg_b2 ta_c">
                <p className="align mg_b2">
                    <View_Svg name='message' size={20} color={count ? "blue" : "gray"}/>
                    {count ? <span className="c_blue mg_l1">새로운 메세지가 도착했습니다.</span> : <span className="c_gray mg_l1">메세지를 모두 확인했습니다.</span>}
                </p>
                <div className="mg_b">
                    <button className="bt_modal c_blue" onClick={()=>clickMenu('messenger')}>메신저</button>
                </div>
            </div>
            <div className="ta_c">
                <button className="bt_modal c_orange" onClick={()=>clickMenu('profile')}>내 정보(설정)</button>
                <button className="bt_modal c_red" onClick={clickLogout}>로그아웃</button>
                {checkAdmin(user.level) && <button className="bt_modal c_orange" onClick={()=>clickMenu('admin')}>⚙️관리자</button>}
            </div>
        </>)
    }
    const clickLocation = ()=>{ // 위치 권한 요청
        navigator.geolocation.getCurrentPosition((position) => {}, (error)=>{
            if(error.code === error.PERMISSION_DENIED){
                setPopup({ msg: '위치 권한이 차단되었습니다.\n브라우저 설정에서 권한을 다시 허용해 주세요.' });
            }else{
                setPopup({ msg: `위치 권한 요청 오류!\n${error.message}`});
            }
        }, { enableHighAccuracy: true, maximumAge: 0 });
    }

    return(<>
        {loading && <Loading/>}
        {popup && <Popup code={popup.code} msg={popup.msg} setPopup={setPopup}/>}
        {confirm && <Confirm msg={confirm.msg} confirm={confirm.confirm} setConfirm={setConfirm}/>}
        {modal.menu && <Modal title='메뉴' setModal={setModal}><Modal_Menu/></Modal>}
        
        <div className="header_line">
            <div className="max_w100 mg_0a">
                <div className="line w_70">
                    <Link href={`${process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_APP_URL : process.env.NEXT_PUBLIC_CLIENT_HOST}`} target="_parent">&nbsp;<button className="header_menu c_blue">{$META.app_name}</button></Link>
                    {$MENU.map((e)=> <Link key={e.num} href={`/${e.app}`}><button className={$STYLE(e.app) + " header_menu"}>{e.app_name}</button></Link>)}
                </div>
                <div className="line w_30 ta_r pd_w1 align">
                    <Login_View/>
                    <button className="bt_none" onClick={clickLocation}><View_Svg name='location' size={20} color={$USER.location ? 'green' : 'red'}/></button>
                </div>
            </div>
        </div>
    </>)
}