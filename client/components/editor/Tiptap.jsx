'use client'
import parse from 'html-react-parser';
import { useModal } from 'modules'
import { onClickImage, onErrorImage } from 'modules/SYSTEM';
import { Modal, Modal_Image } from 'components/app'
import { Tiptap_Link, Tiptap_Preview_Image, Tiptap_Preview_Video, Tiptap_Svg, Tiptap_Upload } from 'components/editor';
import './tiptap.css'

// tiptap
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Image from '@tiptap/extension-image'
import Bold from '@tiptap/extension-bold'
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Color } from '@tiptap/extension-color'
import Link from '@tiptap/extension-link'
import Strike from '@tiptap/extension-strike'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import History from '@tiptap/extension-history'
import Dropcursor from '@tiptap/extension-dropcursor'

// custom
import Iframe from 'components/editor/Tiptap_Iframe';
import { Video } from './Tiptap_Video';

export const Tiptap_Note = ({type, image, note})=>{
    const [modal, setModal] = useModal(false)
    
    const $STYLE = ()=>{
        if(type === 'comment') return 'tiptap_comment'; // height: 20 > 30rem
        return 'tiptap_note'; // height: 20 > 40rem
    }

    return (<>
        {modal.image && <Modal_Image src={modal.image} setModal={setModal}/>}
        {image && <p className="wrap tiptap_image mg_h3 ta_c"><img src={image} alt="image" onClick={(e)=>onClickImage(e, setModal)} onError={onErrorImage}/></p>}
        <div className={`tiptap ${$STYLE(type)}`} onClick={(e)=>onClickImage(e, setModal)}>{parse(note || '')}</div>
    </>);
}
export const Tiptap_Editor = ({id, value, upload}) => { // upload: upload image length
    const [modal, setModal] = useModal(false)

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [ Document, Paragraph, Bold, TaskList, Text, TextStyle, HorizontalRule, Strike, History, Dropcursor,
            Iframe, Video, // custom extension
            Image.configure({ inline: true }),
            Link.configure({ validate: href => /^https:\/\//.test(href), openOnClick: false, autolink: true }),
            Color.configure({ types: ['textStyle'] }),
            TaskItem.configure({ nested: true }),
            TextAlign.configure({ types: ['paragraph'] }),  
        ],
        content: value,
    })

    if(!editor) return null
    return (<>
        {modal.link && <Modal title='주소(링크) 입력' setModal={setModal}><Tiptap_Link editor={editor} setModal={setModal}/></Modal>}
        {modal.link_image && <Modal title='이미지 등록(URL)' setModal={setModal}><Tiptap_Preview_Image editor={editor} setModal={setModal}/></Modal>}
        {modal.upload_video && <Modal title='동영상 등록(URL)' setModal={setModal}><Tiptap_Preview_Video editor={editor} setModal={setModal}/></Modal>}
        {modal.upload_image && <Modal title='이미지 등록(파일)' setModal={setModal}><Tiptap_Upload upload={upload} editor={editor} setModal={setModal}/></Modal>}

        <div className='box'>
            <div className='box tiptab_toolbar bg pd_w1'>
                <button className='bt_tiptap' onClick={()=>setModal({upload_image: true})}><Tiptap_Svg name='image'/></button>
                <button className='bt_tiptap' onClick={()=>setModal({upload_video: true})}><Tiptap_Svg name='video'/></button>
                <button className='bt_tiptap' onClick={()=>setModal({link: true})}><Tiptap_Svg name='link'/></button>

                <button className='bt_tiptap' onClick={() => editor.chain().focus().toggleBold().run()}><Tiptap_Svg name='bold' color={editor.isActive('bold') ? 'black' : 'gray'}/></button>
                <button className='bt_tiptap'><input className='input_color' type="color" onInput={event => editor.chain().focus().setColor(event.target.value).run()} data-testid="setColor"/></button>
                <button className='bt_tiptap' onClick={() => editor.chain().focus().unsetColor().run()} data-testid="unsetColor"><Tiptap_Svg name='color_reset'/></button>

                <button className='bt_tiptap' onClick={() => editor.chain().focus().setTextAlign('left').run()}><Tiptap_Svg name='align_left' color={editor.isActive({ textAlign: 'left' }) ? 'black' : 'gray'}/></button>
                <button className='bt_tiptap' onClick={() => editor.chain().focus().setTextAlign('center').run()}><Tiptap_Svg name='align_center' color={editor.isActive({ textAlign: 'center' }) ? 'black' : 'gray'}/></button>
                <button className='bt_tiptap' onClick={() => editor.chain().focus().setTextAlign('right').run()}><Tiptap_Svg name='align_right' color={editor.isActive({ textAlign: 'right' }) ? 'black' : 'gray'}/></button>

                <button className='bt_tiptap' onClick={() => editor.chain().focus().setHorizontalRule().run()}><Tiptap_Svg name='hr'/></button>
                <button className='bt_tiptap' onClick={() => editor.chain().focus().toggleTaskList().run()}><Tiptap_Svg name='check_list' color={editor.isActive(('taskList')) ? 'black' : 'gray'}/></button>

                <button className='bt_tiptap' onClick={() => editor.chain().focus().toggleStrike().run()}><Tiptap_Svg name='strike' color={editor.isActive('strike') ? 'black' : 'gray'}/></button>
            </div>
            <EditorContent className='tiptap_editor' id={id} editor={editor} />
        </div>
    </>)
}