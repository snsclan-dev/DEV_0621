import { storeApp, Text_Area, useInput } from "modules"
import { onErrorImage } from "modules/SYSTEM"

export const Tiptap_Preview_Image = ({ editor, setModal })=>{
    const { setPopup } = storeApp((state)=>state)
    const [input, setInput] = useInput({link: ''})
    const $LINK = input.link.split(/[\s,]+/).filter(e => e.trim());

    const clickLink = ()=>{
        if($LINK.length > 5) return setPopup({ msg: `이미지는 한번에 5개까지 등록 가능합니다.\n현재 입력된 이미지 수 : ${$LINK.length}개` });
        $LINK.forEach(e => { editor.commands.setImage({ src: e }) });
        editor.commands.focus();
        setModal(false);
    }

    return(<div>
        <p className="lh_1 fs_13"><span className="li c_blue">&bull;</span>이미지 표시 여부를 확인할 수 있습니다.</p>
        <div className="preview_image mg_b2">
            {$LINK.slice(0, 5).map((e, i)=> <div key={i} className="preview_map5"><img src={e} alt="preview" onError={onErrorImage}/></div>)}
        </div>

        <p className="lh_1 fs_13"><span className="li c_blue">&bull;</span>이미지 주소(URL)를 입력해주세요. 공백, 콤마( , )로 구분</p>
        <div className="mg_b2"><Text_Area className="textarea scroll" minRows={5} maxRows={8} name='link' maxLength={2000} onChange={setInput} value={input.link}/></div>
        <div className="ta_c">
            <button className="bt_3m c_green" onClick={()=>setModal({upload_image: true})}>뒤로가기(취소)</button>
            <button className="bt_3m c_blue" onClick={clickLink}>이미지 등록</button>
        </div>
    </div>)
}
export const Tiptap_Preview_Video = ({ editor, setModal })=>{
    const { setPopup } = storeApp((state)=>state)
    const [input, setInput] = useInput({video: ''})
    const $LINK = input.video.split(/[\s,]+/).filter(e => e.trim());

    const clickVideo = ()=>{
        if($LINK.length > 3) return setPopup({ msg: `동영상은 한번에 3개씩 등록 가능합니다.\n현재 입력된 동영상 수 : ${$LINK.length}개` });
        const $FILTER = $LINK.filter(e => /\.(mp4|webm|ogg)$/i.test(e));
        if($FILTER.length !== $LINK.length) return setPopup({ msg: '지원하지 않는 동영상 형식이 포함되어 있습니다.\n(MP4, WEBM, OGG만 지원)' });
        // $FILTER.forEach(link => editor.commands.setVideo({ src: link }));
        const $VIDEO = $FILTER.map(link => ({ type: 'video', attrs: { src: link, muted: true } }));
        editor.commands.insertContent($VIDEO);
        editor.commands.focus();
        setModal(false);
    }

    return(<>
        <p className="fs_13"><span className="li c_blue">&bull;</span>동영상 재생 여부를 확인할 수 있습니다.</p>
        <div className="preview_image">
            {$LINK.slice(0, 3).map((e, i)=><div key={i} className="preview_map3">
            {/* {$LINK.slice(0, 2).map((e, i)=><div key={i} className="preview_map2"> */}
                <video controls muted><source src={e} type='video/mp4'/>지원하지 않는 영상입니다</video>
            </div>)}
        </div>
        <p className="lh_1 fs_13"><span className="li c_blue">&bull;</span>동영상 주소(URL)를 입력해주세요. 공백, 콤마( , )로 구분</p>
        <div className="mg_b2"><Text_Area className="textarea scroll" minRows={5} maxRows={8} name='video' maxLength={2000} onChange={setInput} value={input.video}/></div>
        <div className="ta_c mg_t2">
            <button className="bt_modal c_blue" onClick={clickVideo}>동영상 등록</button>
        </div>
    </>)
}