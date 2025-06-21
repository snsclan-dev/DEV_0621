import Link from 'next/link'
import { Message } from 'components/app'

export default function NotFound() {
    return (<Message>
        <h2>페이지를 찾을 수 없습니다.</h2>
        <br/>
        <Link href='/'><button className='bt_3m'>처음 화면으로</button></Link>
    </Message>)
}