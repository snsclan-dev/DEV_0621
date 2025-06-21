const cheerio = require('cheerio');

const $PATH = require.main.path;
const { checkError } = require(`${$PATH}/config/system`);
const { pool } = require(`${$PATH}/config/mysql`)
const { telegram } = require(`${$PATH}/modules`);
const { eventConn, eventNote, eventImage } = require(`${$PATH}/event/EVENT`);

const $MENU = 'coffee'

const starbucks = async ()=>{
    const $LIST_URL = 'https://www.starbucks.co.kr/whats_new/campaign_list.do';
    const $READ_URL = 'https://www.starbucks.co.kr/whats_new/campaign_view.do?pro_seq=';
    const $LIST_SELECTOR = '.campaign_list dd:nth-child(2) li';
    const $COUNT = { length: 0 } // 등록 갯수
    try{
        const $EVENT = await pool(`SELECT event_id FROM event WHERE category=?;`, ['starbucks'], 'coffee.js > starbucks')
        const $SET = new Set($EVENT.map(e => e.event_id));
        const $LIST_CONTENT = await eventConn($LIST_URL, $LIST_SELECTOR)
        const $LIST = cheerio.load($LIST_CONTENT);
        const $LIST_HTML = $LIST($LIST_SELECTOR);
        for (const e of $LIST_HTML) {
            const id = $LIST(e).find('.goPromotionView').attr('prod');  // id 숫자: 1234
            if($SET.has(`starbucks_${id}`)) continue;
            $COUNT.length += 1; // 등록
            const image = $LIST(e).find('.goPromotionView img').attr('src');
            const title = $LIST(e).find('h4').text();
            const period = $LIST(e).find('.date').text();
            const $LINK = $READ_URL + id;
            const $DATA = { event_id: `starbucks_${id}`, menu: $MENU, category: 'starbucks', image, title: `[스타벅스] ${title}`, note: [], period, link: $LINK, tag: '스타벅스,카페,커피,starbucks' }
            const $LIST_IMAGE = await eventImage('starbucks', image)
            $DATA.image = $LIST_IMAGE;
            try{
                const $READ_SELECTOR = '.campaign_veiw_info_inner img';
                const $READ_CONTENT = await eventConn($LINK, $READ_SELECTOR)
                const $READ = cheerio.load($READ_CONTENT);
                const $READ_HTML = $READ($READ_SELECTOR);
                for (const e of $READ_HTML) {
                    const $IMG = $READ(e).attr('src');
                    if($IMG){
                        const $READ_IMAGE = await eventImage('starbucks', $IMG)
                        $DATA.note.push(`<p><img src="${$READ_IMAGE}" alt="image"/></p>`);
                    }
                }
            }catch(err){
                checkError(err, `스타벅스 이벤트 진행 실패! [ ${id} ]`)
            }
            const $SQL = `INSERT INTO event(event_id, menu, category, image, title, period, note, link, tag) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            await pool($SQL, [$DATA.event_id, $DATA.menu, $DATA.category, $DATA.image, $DATA.title, $DATA.period, eventNote($DATA.note), $DATA.link, $DATA.tag], 'coffee.js > starbucks')
        }
        telegram({ msg: `스타벅스 이벤트 등록(업데이트) 완료! [ ${$COUNT.length} ]개` });
    }catch(err){
        checkError(err, '스타벅스 이벤트 등록(업데이트) 실패!')
    }
}
const mega = async ()=>{
    const $LIST_URL = 'https://www.mega-mgccoffee.com/bbs/?bbs_category=3';
    const $READ_URL = 'https://www.mega-mgccoffee.com/bbs/detail/?bbs_idx=';
    const $HOME_URL = 'https://www.mega-mgccoffee.com'; // home image link
    const $LIST_SELECTOR = '.board_list_gallery li';
    const $COUNT = { length: 0 } // 등록 갯수
    try{
        const $EVENT = await pool(`SELECT event_id FROM event WHERE category=?;`, ['mega'], 'coffee.js > mega')
        const $SET = new Set($EVENT.map(e => e.event_id));
        const $LIST_CONTENT = await eventConn($LIST_URL, $LIST_SELECTOR)
        const $LIST = cheerio.load($LIST_CONTENT);
        const $LIST_HTML = $LIST($LIST_SELECTOR);
        for (const e of $LIST_HTML) {
            if(!$LIST(e).find('.cont_text_title').length) continue;
            const id = $LIST(e).find('a').attr('href').match(/bbs_idx=(\d+)/)[1]; // detail/?bbs_idx=357&bbs_category=3&bbs_page=1
            if($SET.has(`mega_${id}`)) continue;
            $COUNT.length += 1; // 등록
            const image = $LIST(e).find('img').attr('src');
            const title = $LIST(e).find('.cont_text.cont_text_title').text().trim();
            const period = null;
            const $LINK = $READ_URL + id;
            const $DATA = { event_id: `mega_${id}`, menu: $MENU, category: 'mega', image, title: `[메가] ${title}`, note: [], period, link: $LINK, tag: '메가,카페,커피,mega,mgc' }
            const $LIST_IMAGE = await eventImage('mega', image)
            $DATA.image = $LIST_IMAGE;
            try{
                const $READ_SELECTOR = '.board_detail_text img';
                const $READ_CONTENT = await eventConn($LINK, $READ_SELECTOR)
                const $READ = cheerio.load($READ_CONTENT);
                const $READ_HTML = $READ($READ_SELECTOR);
                for (const e of $READ_HTML) {
                    let $IMG = $READ(e).attr('src'); // 이미지 url 체크
                    if($IMG){
                        if ($IMG.startsWith('/')) $IMG = `${$HOME_URL}${$IMG}`;
                        const $READ_IMAGE = await eventImage('mega', $IMG)
                        $DATA.note.push(`<p><img src="${$READ_IMAGE}" alt="image"/></p>`);
                    }
                }
            }catch(err){
                checkError(err, `메가 이벤트 진행 실패! [ ${id} ]`)
            }
            const $SQL = `INSERT INTO event(event_id, menu, category, image, title, period, note, link, tag) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            await pool($SQL, [$DATA.event_id, $DATA.menu, $DATA.category, $DATA.image, $DATA.title, $DATA.period, eventNote($DATA.note), $DATA.link, $DATA.tag], 'coffee.js > mega')
        }
        telegram({ msg: `메가 이벤트 등록(업데이트) 완료! [ ${$COUNT.length} ]개` });
    }catch(err){
        checkError(err, '메가 이벤트 등록(업데이트) 실패!')
    }
}

module.exports = { starbucks, mega };