import { useState } from "react";
import { useAxios, storeApp, storeUser } from "modules";
import { $FILE_UPLOAD } from "modules/SYSTEM";

export const Tiptap_Upload = ({upload, editor, setModal})=>{ // upload: 1,3,5 > css preview_map1~5
    const { user } = storeUser.getState()
    const { setPopup, setLoading } = storeApp((state)=>state)
    const [preView, setPreView] = useState([]); // image preview
    const [file, setFile] = useState([]); // image files

    const imageView = (e)=> {
        const files = e.target.files;
        const viewArr = [];
        if (files.length > upload) return setPopup({msg: `이미지는 최대 ${upload}개까지 동시에 선택이 가능합니다.`})
        setFile(files);
        for (let i = 0; i < files.length; i++) {
            if(files[i].type?.split('/')[0] !== 'image'){
                setLoading(null);
                return setPopup({msg: '이미지만 등록이 가능합니다.'})
            } 
            if(files[i].size > $FILE_UPLOAD.fileSize){
                setLoading(null);
                return setPopup({msg: `이미지는 최대 ${$FILE_UPLOAD.maxSize}MB까지 등록이 가능합니다.`})
            } 
            let reader = new FileReader();
            reader.onload = () => {
                viewArr[i] = reader.result;
                setPreView([...viewArr]);
            }
            reader.readAsDataURL(files[i]);
        }
    }
    const onChangeImage = (e)=>{
        setLoading(true);
        imageView(e);
        const files = e.target.files;
        const filesArr = Array.prototype.slice.call(files);
        filesArr.forEach(file => {
            const reader = new FileReader();
            reader.onload = e => {
                const image = new Image();
                image.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
        setLoading(null);
    };
    const openFile = ()=> {
        if(!user.id) return setPopup({msg: '로그인이 필요합니다.'})
        setPreView([]);
        setFile([]);
        document.getElementById('file').value = '';
        document.getElementById('file').click();
    }
    const sendImage = async ()=>{
        if(!user.id) return setPopup({msg: '로그인이 필요합니다.'})
        const form = new FormData();
        if(!file.length) return setPopup({msg: '이미지를 선택해 주세요.'})
        if(file.length) {
            if (file.length > upload) return setPopup({msg: `이미지는 최대 ${upload}개 / ${$FILE_UPLOAD.maxSize}MB 까지 선택이 가능합니다.`})
            for (let i = 0; i < file.length; i++){
                form.append("fileUpload", file[i]);
            }
        }
        const data = await useAxios.post('/upload/image/temp', form)
        if(data) data.image.forEach(e => { editor.commands.setImage({ src: e }) });
        setFile([]), setModal(false);
    }

    return(<div>
        <p className="lh_1 fs_13 mg_b1"><span className="li c_blue">&bull;</span>이미지는 최대 <span className="c_blue fwb">{upload}개 / {$FILE_UPLOAD.maxSize}MB</span> 까지 선택이 가능합니다.</p>
        
        <div className="preview_image bg mg_b2" onClick={openFile}>
            {!preView.length && <p className="placeholder c_gray fwb">이미지를 선택해 주세요 (클릭)</p>}
            {preView.map((e, i) => <div key={i} className={`preview_map${upload}`}><img src={e} alt="preview"/></div>)}
        </div>

        <input id="file" className="none" type="file" name="fileUpload" accept="image/*" onChange={onChangeImage} multiple/>

        <div className="ta_c mg_t3">
            <button className="bt_3m c_green" onClick={()=>setModal({link_image: true})}>주소(URL) 입력</button>
            <button className="bt_3m c_blue" onClick={sendImage}>이미지 등록</button>
        </div>
    </div>)
}