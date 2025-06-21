import { fetchBoard, fetchInfoFind, fetchUser } from "modules/FETCH";
import { App_Notice, Message } from "components/app";
import { User_Level } from "components/user";
import { Board_List, Board_Read, Board_Search, Board_Write, Comment, Comment_Event } from "components/board";

export async function Board_Router(app, params){ // app: table
    const [ router, menu, category, num ] = params
    const $PARAMS = [router, app, menu, category, num ]
    const $PARAMS_URL = $PARAMS.filter(Boolean).join('/');

    const $USER = await fetchUser();
    const $INFO_FIND = await fetchInfoFind({app: app, menu: menu, category: category})
    const $CHECK = { create: $INFO_FIND?.level_create <= $USER.level, read: $INFO_FIND?.level_read <= $USER.level }
    const $INFO = { ...$INFO_FIND, ...$CHECK }

    // console.log($INFO);

    if(router === 'search'){
        if(!$USER.id) return <Message>로그인이 필요합니다.</Message>
        const [router, search, num] = params
        const $SEARCH_PARAMS = [ router, app, search, num ]
        const $SEARCH_URL = $SEARCH_PARAMS.filter(Boolean).join('/');
        const $BOARD_SEARCH = await fetchBoard($SEARCH_URL)
        if($BOARD_SEARCH.code) return <Message>{$BOARD_SEARCH.msg}</Message>
        return <Board_Search app={app} search={decodeURIComponent(search)} list={$BOARD_SEARCH.list} paging={$BOARD_SEARCH.paging} user={$USER}/>
    }

    if($INFO.level_read > $USER.level) return <Message>
        <p>이용 가능 등급 <User_Level level={$INFO.level_read}/></p>
        <p>내 등급 <User_Level level={$USER.level}/></p>
    </Message>

    if($INFO.app_type === 'notice') return <App_Notice info={$INFO} user={$USER}/>
    if(router === 'list'){
        const $BOARD_LIST = await fetchBoard($PARAMS_URL);
        if($BOARD_LIST.code) return(<Message code={$BOARD_LIST.code} msg={$BOARD_LIST.msg}/>)
        return <Board_List info={$INFO} list={$BOARD_LIST.list} paging={$BOARD_LIST.paging} user={$USER}/>
    }
    if(router === 'read'){
        const $READ = await fetchBoard($PARAMS_URL) // $INFO.state: 1 > comment hidden
        if($READ.code) return(<Message code={$READ.code} msg={$READ.msg}/>)
        return(<>
            <Board_Read info={$INFO} read={$READ.read} user={$USER}/>
            {$INFO.state !== 1 && $INFO.app_type === 'event' ? <Comment_Event info={$INFO} read={$READ.read}/> : <Comment info={$INFO} read={$READ.read}/>}
        </>)
    }
    if(router === 'write'){
        if($INFO.level_create > $USER.level) return <Message>
            <p><User_Level level={$INFO.level_create}/> 이상 글쓰기가 가능합니다.</p>
            <p>내 등급 <User_Level level={$USER.level}/></p>
        </Message>
        return <Board_Write info={$INFO} user={$USER}/>
    } 
    return null;
}