import Link from "next/link"
import { usePathname } from "next/navigation"

export const User_Menu = ()=>{
    const path = usePathname()
    const $LINK = [
        { href: '/user/profile', name: '회원정보' },
        { href: '/user/modify', name: '정보수정' },
        
    ]
    const STYLE = (href)=>{
        if(path === href) return 'c_green fwb'
        return 'c_gray fwb'
    }

    return(<div className="header_line">
        <div className="max_w100 mg_0a">
            {$LINK.map((e, i)=> <Link key={i} href={e.href} prefetch={false}><button className={`${STYLE(e.href)} header_menu`}>{e.name}</button></Link>)}
        </div>
    </div>)
}