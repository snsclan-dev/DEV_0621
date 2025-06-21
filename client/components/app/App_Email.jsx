import Link from "next/link";
import { Message } from "components/app";

export const App_Email = async ()=>{
    return(<Message>
        <p className="lh_3 c_green fwb">이메일 인증에 성공하였습니다.</p>
        <p className="lh_3"><Link href="/login"><button className="bt_3 tc_gray mg_l1">로그인</button></Link></p>
    </Message>)
}