import { $REGEX } from "modules"

const $EDITOR_CHECK = [ // check length
    { type: 'user', text: 1000, html: 50000, image: 10 }, // admin user note
    { type: 'board', text: 10000, html: 50000, image: 50, video: 10 }, // board
    { type: 'comment', text: 1000, html: 10000, image: 3, video: 1 },
    { type: 'event', text: 500, html: 10000, image: 3 },
    { type: 'messenger', text: 5000, html: 50000, image: 20, video: 5 }, // messenger
]
export const editorCheck = ({type, selector='', line=500})=>{
    const $EDITOR = document.querySelector(`${selector} .ProseMirror`)
    const $CHECK = $EDITOR_CHECK.find((e)=>{ return e.type === type })
    const $TEXT = $EDITOR.editor.getText(), $HTML = $EDITOR.editor.getHTML()

    if(type !== 'user'){ // memo
        if($TEXT.replace(/\s+/g, '').length < 6) return {code: 8, msg: '내용: 6자 이상 입력해 주세요.'}
    }
    if($TEXT.length > $CHECK.text || $HTML.length > $CHECK.html) return {code: 8, msg: '내용(HTML)이 너무 많습니다.'}
    
    const $FIND_IMAGE = $HTML.match($REGEX.url_image)?.length || 0;
    const $FIND_VIDEO = $HTML.match($REGEX.url_video)?.length || 0;

    if($FIND_IMAGE > $CHECK.image) return { code: 8, msg: <>
        <p>이미지(파일 + 태그)는 최대 <span className="c_blue fwb">{$CHECK.image}</span>개까지 등록이 가능합니다.</p>
        <p>현재 등록된 이미지 <span className="c_red fwb">{$FIND_IMAGE}</span>개</p>
    </>};
    if($FIND_VIDEO > $CHECK.video) return { code: 8, msg: <>
        <p>영상(파일 + 태그)는 최대 <span className="c_blue fwb">{$CHECK.video}</span>개까지 등록이 가능합니다.</p>
        <p>현재 등록된 영상 <span className="c_red fwb">{$FIND_VIDEO}</span>개</p>
    </>};

    if(line){
        const $LINE = ($HTML.match(/<p>/g) || []).length;
        if($LINE > line) return { code: 8, msg: <><p>최대 <span className="c_green fwb">[ {line} ]</span>줄까지 입력이 가능합니다.</p><p>현재 <span className="c_red fwb">[ {$LINE} ]</span>줄 입력되었습니다.</p></> };
    }

    // const $HTML_REPLACE = $HTML.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/g, (match, content) => { return /<[^>]+>/.test(content) ? content : match })
    // return { code: 0, editor: $EDITOR.editor.commands, data: $HTML_REPLACE.replace(/(<p><\/p>){4,}/g, '<p></p><p></p><p></p>')} // editor: clearContent()
    // return { code: 0, editor: $EDITOR.editor.commands, data: $HTML_REPLACE.replace(/(<p><\/p>){3,}/g, '<p></p><p></p>')} // editor: clearContent()

    return { code: 0, editor: $EDITOR.editor.commands, data: $HTML.replace(/(<p><\/p>){3,}/g, '<p></p><p></p>')} // editor: clearContent()
}