const cheerio = require('cheerio');

const $PATH = require.main.path;
const { checkError } = require(`${$PATH}/config/system`);
const { pool } = require(`${$PATH}/config/mysql`)
const { telegram } = require(`${$PATH}/modules`);
const { eventConn, eventNote, eventImage } = require(`${$PATH}/event/EVENT`);

const $MENU = 'food'

const hansot = async ()=>{
    const $LIST_URL = 'https://www.hsd.co.kr/event/event_list';
    const $READ_URL = 'https://www.hsd.co.kr/event/event_view/';
    const $LIST_SELECTOR = '.event_list_wrap li';
    const $COUNT = { length: 0 } // 등록 갯수
    try{
        const $EVENT = await pool(`SELECT event_id FROM event WHERE category=?;`, ['hansot'], 'food.js > hansot')
        const $SET = new Set($EVENT.map(e => e.event_id));
        const $LIST_CONTENT = await eventConn($LIST_URL, $LIST_SELECTOR)
        const $LIST = cheerio.load($LIST_CONTENT);
        const $LIST_HTML = $LIST($LIST_SELECTOR);
        for (const e of $LIST_HTML) {
            const id = $LIST(e).find('.event_link').attr('href').split('\'')[1];  // id 숫자: 1234
            if($SET.has(`hansot_${id}`)) continue;
            $COUNT.length += 1; // 등록
            const image = $LIST(e).find('.ev_wrap img').attr('src');
            const title = $LIST(e).find('.h3_tit').text().replace(/["]/g, '\'').trim();
            const period = $LIST(e).find('.date').text();
            const $LINK = $READ_URL + id;
            const $DATA = { event_id: `hansot_${id}`, menu: $MENU, category: 'hansot', image, title: `[한솥] ${title}`, note: [], period, link: $LINK, tag: '한솥,도시락,hansot' }
            const $LIST_IMAGE = await eventImage('hansot', image)
            $DATA.image = $LIST_IMAGE;
            try{
                const $READ_SELECTOR = '.view_txt.pa_02 img';
                const $READ_CONTENT = await eventConn($LINK, $READ_SELECTOR)
                const $READ = cheerio.load($READ_CONTENT);
                const $READ_HTML = $READ($READ_SELECTOR);
                for (const e of $READ_HTML) {
                    const $IMG = $READ(e).attr('src');
                    if($IMG){
                        const $READ_IMAGE = await eventImage('hansot', $IMG)
                        $DATA.note.push(`<p><img src="${$READ_IMAGE}" alt="image"/></p>`);
                    }
                }
            }catch(err){
                checkError(err, `한솥 이벤트 진행 실패! [ ${id} ]`)
            }
            const $SQL = `INSERT INTO event(event_id, menu, category, image, title, period, note, link, tag) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            await pool($SQL, [$DATA.event_id, $DATA.menu, $DATA.category, $DATA.image, $DATA.title, $DATA.period, eventNote($DATA.note), $DATA.link, $DATA.tag], 'food.js > hansot')
        }
        telegram({ msg: `한솥 이벤트 등록(업데이트) 완료! [ ${$COUNT.length} ]개` });
    }catch(err){
        checkError(err, '한솥 이벤트 등록(업데이트) 실패!')
    }
}
const lotteEatz = async ()=>{
    const $LIST_URL = 'https://www.lotteeatz.com/event/main';
    const $HOME_URL = 'https://www.lotteeatz.com';
    const $LIST_SELECTOR = '.grid-list .grid-item';
    const $COUNT = { length: 0 } // 등록 갯수
    try{
        const $EVENT = await pool(`SELECT event_id FROM event WHERE category=?;`, ['lotteeatz'], 'food.js > lotteeatz')
        const $SET = new Set($EVENT.map(e => e.event_id));
        const $LIST_CONTENT = await eventConn($LIST_URL, $LIST_SELECTOR)
        const $LIST = cheerio.load($LIST_CONTENT);
        const $LIST_HTML = $LIST($LIST_SELECTOR);
        for(const e of $LIST_HTML){
            const id = $LIST(e).find('.btn-link').attr('href') // /event/main/selectEvent/3660
            if($SET.has(`lotteeatz_${id.replace(/[^\d]/g, '')}`)) continue;
            $COUNT.length += 1; // 등록
            const image = $LIST(e).find('.thumb-box img').attr('src');
            const type1 = $LIST(e).find('.grid-info-box .text:eq(0)').text()
            const type2 = $LIST(e).find('.grid-info-box .text:eq(1)').text()
            const $TYPE = type2 ? `${type1}/${type2}` : type1
            const title = $LIST(e).find('.grid-title').text()
            const period = $LIST(e).find('.grid-period').text().replace(/[\n\t]/g, '').trim();
            const $LINK = $HOME_URL + id;
            const $DATA = { event_id: `lotteeatz_${id.replace(/[^\d]/g, '')}`, menu: $MENU, category: 'lotteeatz', image, title: `[${$TYPE}] ${title}`, note: [], period, link: $LINK, tag: `롯데잇츠,lotteeatz,${$TYPE}` } 
            const $LIST_IMAGE = await eventImage('lotteeatz', image)
            $DATA.image = $LIST_IMAGE;
            try{
                const $READ_SELECTOR = '.board-body img';
                const $READ_CONTENT = await eventConn($LINK, $READ_SELECTOR)
                const $READ = cheerio.load($READ_CONTENT);
                const $READ_HTML = $READ($READ_SELECTOR);
                for (const e of $READ_HTML) {
                    const $IMG = $READ(e).attr('src')
                    if($IMG){
                        const $READ_IMAGE = await eventImage('lotteeatz', $IMG)
                        $DATA.note.push(`<p><img src="${$READ_IMAGE}" alt="image"/></p>`);
                    }
                }
            }catch(err){
                checkError(err, `롯데이츠 이벤트 진행 실패! [ ${id} ]`)
            }
            const $SQL = `INSERT INTO event(event_id, menu, category, image, title, period, note, link, tag) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            await pool($SQL, [$DATA.event_id, $DATA.menu, $DATA.category, $DATA.image, $DATA.title, $DATA.period, eventNote($DATA.note), $DATA.link, $DATA.tag], 'food.js > lotteeatz')
        }
        telegram({ msg: `롯데이츠 이벤트 등록(업데이트) 완료! [ ${$COUNT.length} ]개` });
    }catch(err){
        checkError(err, '롯데이츠 이벤트 등록(업데이트) 실패!')
    }
}

module.exports = { hansot, lotteEatz };