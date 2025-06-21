import { useRef, useEffect } from 'react';

// css > line-height: 2.4rem; / padding: .4rem .8rem;
const autoSize = ({ value, onChange, maxLength, maxRows = 3 }) =>{
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            const textarea = textareaRef.current;
            const lineHeight = 24, padding = 16;
            const maxHeight = (lineHeight * maxRows) + padding; // 최대 높이 계산 (lineHeight * maxRows)
            textarea.style.height = 'auto'; // 텍스트 영역의 높이를 'auto'로 설정하여 기존 높이를 초기화

            // scrollHeight에 맞춰 textarea의 높이를 설정, 최대 높이를 넘지 않도록 제한
            const newHeight = Math.min(textarea.scrollHeight, maxHeight);
            textarea.style.height = `${newHeight}px`;

            // 최대 높이를 넘으면 스크롤바 표시
            if (textarea.scrollHeight > maxHeight) {
                textarea.style.overflowY = 'auto';
            } else {
                textarea.style.overflowY = 'hidden';
            }
        }
    }, [value, maxRows]);

    const handleChange = (e) => {
        const { value } = e.target;
        const lineCount = value.split("\n").length; // 현재 줄 개수
        if((!maxLength || value.length <= maxLength) && lineCount <= 10){ // maxLength 제한
            onChange && onChange(e); // onChange 호출
        }
    };
    return { ref: textareaRef, onChange: handleChange };
}
export const Text_Area = ({ className, maxRows, maxLength, name, onChange, value })=>{
    const { ref, onChange: handleChange } = autoSize({ value, onChange, maxLength, maxRows });
    return (<textarea ref={ref} className={className} name={name} value={value} onChange={handleChange} maxLength={maxLength}/>);
}
export const Text_View = ({ value })=>{
    return (<pre className="textview lh_1 scroll">{value}</pre>);
}