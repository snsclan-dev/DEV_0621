// export const $MESSENGER_STATE = { '0_send': 0, '1_read': 1, '6_report': 6, '7_view': 7, '8_delete': 8, '9_delete_admin': 9, '10_delete_data': 10 }
export const $MESSENGER_STATE = { '0_send': 0, '1_read': 1, '6_report': 6 }

export const Msg_State = ({obj, user})=>{
    const { user_id, state } = obj;
    if(user_id === user.id){
        if(state === 0) return <span className="c_gray">메세지를 전송했습니다.</span>
        if(state === 1 || state === 6) return <span className="c_green">상대방이 메세지를 확인했습니다.</span>
    }
    if(user_id !== user.id){
        if(state === 0) return <span className="c_blue">새로운 메세지가 도착했습니다.</span>
        if(state === 1 || state === 6) return <span className="c_gray">메세지를 모두 확인했습니다.</span>
    }
    return null
}
export const msgRoom = (listId)=>{ // create room ARRAY
    const $SORT = listId.sort().join('-')
    return encodeURIComponent(btoa($SORT))
}