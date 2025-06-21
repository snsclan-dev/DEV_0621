import Link from "next/link";
import { storeUser } from "modules";
import { $LINK, checkAdmin } from "modules/SYSTEM";
import { App_Notice } from "components/app";

export const App_Page = ()=>{
    const { user } = storeUser((state)=>state)
    const $ADMIN = checkAdmin(user.level)
    const $GUEST = !user.id && !user.guest
    
    return(<div className="mg_t1">
        <App_Notice info={{ app: 'app', menu: 'main', category: $GUEST ? 'guest' : 'notice' }} user={user}/>
        
        {/* <div className="box_lgray pd_2 mg_t2">
            <p className="lh_1 pd_l fs_13 mg_b">대표(운영자)</p>
            <Link href={`${$LINK.admin}`} target="_blank"><button className="bt_3m c_blue">오픈채팅</button></Link>
        </div> */}

        <div className="flex mg_t2">
            <Link href={`${$LINK.admin}`} target="_blank">
                <div className="box_lgray pd_1 ta_c">
                    {/* <p className="lh_1 fs_13 mg_b">대표(운영자)</p> */}
                    <p className="lh_1 c_blue fwb">카카오톡 오픈채팅</p>
                </div>
            </Link>
            <Link href="/chat/room/guest" target="_blank">
                <div className="box_lgray pd_1 ta_c mg_l2">
                    {/* <p className="lh_1 fs_13 mg_b">대표(운영자)</p> */}
                    <p className="lh_1 c_blue fwb">연구소 채팅(대화방)</p>
                </div>
            </Link>
        </div>

        {$ADMIN && <div className="box_green pd_1 mg_h2">
            <App_Notice info={{ app: 'app', menu: 'main', category: 'guest' }} user={user}/>
        </div>}
    </div>)
}