import { useEffect, useRef } from "react"
import { storeApp, useInput } from "modules"

export const Tiptap_Link = ({ editor, setModal })=>{
    const { setPopup } = storeApp((state)=> state)
    const [input, setInput] = useInput({ link: editor.getAttributes('link').href || '' })
    const ref = useRef(null)

    useEffect(()=>{
        ref.current.focus()
    }, [])

    const clickLink = ()=>{
        const $URL = input.link
        if(!$URL){
            setModal(false)
            return editor.chain().focus().extendMarkRange('link').unsetLink().run()
        }
        if(!/^https:\/\//.test($URL)) return setPopup({ msg: 'https:// 로 시작해야 합니다.' })
        editor.chain().focus().extendMarkRange('link').setLink({ href: $URL }).run()
        setModal(false)
    }

    return(<>
        <p className="fs_13"><span className="li c_blue">&bull;</span>주소(URL)를 입력해주세요.</p>
        <input ref={ref} className='input' type="text" name='link' onChange={setInput} value={input.link} />
        <div className='ta_c mg_t2'>
            <button className="bt_3m c_blue" onClick={clickLink}>주소 입력</button>
        </div>
    </>)
}