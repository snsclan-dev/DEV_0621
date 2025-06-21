import { useState } from "react";
import { useAxios, storeApp, storeUser, View_Char } from "modules";
import { $FILE_UPLOAD } from "modules/SYSTEM";

export const Board_Upload = ({setInput, setModal})=>{
    const user = storeUser((state)=>state.user)
    const { setPopup, setLoading } = storeApp((state)=>state)
    const [preView, setPreView] = useState([]); // image preview
    const [file, setFile] = useState([]); // image files

    const imageView = (e)=> {
        const files = e.target.files;
        const viewArr = [];
        if (files.length > $FILE_UPLOAD.image) return setPopup({msg: `이미지는 최대 ${$FILE_UPLOAD.image}개까지 동시에 선택이 가능합니다.`})
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
            if (file.length > $FILE_UPLOAD.image) return setPopup({msg: `이미지는 최대 ${$FILE_UPLOAD.image}개 / ${$FILE_UPLOAD.maxSize}MB 까지 선택이 가능합니다.`})
            for (let i = 0; i < file.length; i++){
                form.append("fileUpload", file[i]);
            }
        }
        const $DATA = await useAxios.post('/upload/image/temp', form)
        if($DATA) setInput({image: $DATA.image[0]})
        setFile([]), setModal(false);
    }

    return(
        <div>
            {/* <p className="fs_13"><View_Char char='li' style="c_blue"/>대표 이미지는 목록에 표시됩니다.</p> */}
            <p className="fs_13 mg_b2"><View_Char char='li' style="c_blue"/>최대 <span className="c_blue fwb">{$FILE_UPLOAD.image}개 / {$FILE_UPLOAD.maxSize}MB</span> 까지 선택이 가능합니다.</p>
            <div className="preview_image bg" onClick={openFile}>
                {!preView.length && <p className="placeholder c_gray fwb">이미지를 선택해 주세요 (클릭)</p>}
                {preView.map((e, i) => <div key={i} className="preview_map1"><img src={e} alt="preview"/></div>)}
            </div>

            <input id="file" className="none" type="file" name="fileUpload" accept="image/*" onChange={onChangeImage}/>

            <div className="ta_c pd_t2">
                <button className="bt_3m c_blue" onClick={sendImage}>이미지 등록</button>
            </div>
        </div>
    )
}