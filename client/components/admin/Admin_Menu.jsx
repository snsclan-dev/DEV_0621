'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Admin_Menu = ()=>{
    const path = usePathname()
    const $LINK = [
        { href: '/admin/monitor', name: '모니터' },
        { href: '/admin/folder', name: '폴더' },
        { href: '/admin/app', name: '앱(메뉴)' },
        { href: '/admin/socket', name: '소켓관리' },
        { href: '/admin/user', name: '회원검색' },
        { href: '/admin/block', name: '차단관리' },
        { href: '/admin/ip', name: 'IP관리' },
    ]
    const STYLE = (href)=>{
        if(path === href) return 'c_blue fwb'
        return 'c_gray fwb'
    }

    return(<div className="header_line">
        <div className="max_w100 mg_0a">
            {$LINK.map((e, i)=> <Link key={i} href={e.href} prefetch={false}><button className={`${STYLE(e.href)} header_menu`}>{e.name}</button></Link>)}
        </div>
    </div>)
}