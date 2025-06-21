import { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import dayjs from "dayjs";
import ko from 'date-fns/locale/ko';
import 'dayjs/locale/ko';
registerLocale('ko', ko);
import "react-datepicker/dist/react-datepicker.css";

// timer : before date(false), after date(true)
// setInput({period_select: data})
export const Date_Picker = ({timer = true, setInput, value}) => {
    // const [date, setDate] = useState(value ? dayjs(value).add(-1, 'day').$d : null);
    const [date, setDate] = useState(value ? dayjs(value).format('YYYY-MM-DD') : null);
    
    return (<DatePicker className="input mg_b2" onChange={(date) => {
            setDate(date)
            // setInput({period_select: date ? dayjs(date).add(1, 'day').format('YYYY-MM-DD') : ''})
            // setInput({period: date ? dayjs(date).add(1, 'day').format('YYYY-MM-DD') : ''})
            setInput({period: date ? dayjs(date).format('YYYY-MM-DD') : ''})
        }}
        locale={ko} utcOffset={9} selected={date} timeIntervals={10} isClearable={true}
        minDate={timer ? dayjs().add(1, 'day').$d : dayjs()}
        maxDate={timer ? dayjs().add(30, 'day').$d : dayjs().add(0, 'day').$d}
        onChangeRaw={(e)=> e.preventDefault()}
        placeholderText="기간(날짜)을 선택해 주세요" 
        dateFormat={"yy년 MM월 dd일 (eee) 까지"}
    />);
};