const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const $PATH = require.main.path;
const { checkError } = require(`${$PATH}/config/system`);
const { pool } = require(`${$PATH}/config/mysql`)
const { telegram } = require(`${$PATH}/modules`);
const { eventConn, eventNote, eventImage, eventPuppet } = require(`${$PATH}/event/EVENT`);

// 테이블 인덱스 생성성
// ALTER TABLE event ADD INDEX idx_event_id (event_id);
// ALTER TABLE event ADD UNIQUE INDEX idx_event_id (event_id);
const $MENU = 'convenience';

const cu = async ()=>{
    const $LIST_URL = 'https://www.pocketcu.co.kr/event/main'; // event list
    const $READ_URL = 'https://www.pocketcu.co.kr/event/eventView/'; // event read
    const $LIST_SELECTOR = '.event_list .bnr_set';
    const $COUNT = { length: 0 } // 등록 갯수
    try{
        const $EVENT = await pool(`SELECT event_id FROM event WHERE category=?;`, ['cu'], 'convenience.js > cu')
        const $SET = new Set($EVENT.map(e => e.event_id));
        const $LIST_CONTENT = await eventConn($LIST_URL, $LIST_SELECTOR)
        const $LIST = cheerio.load($LIST_CONTENT);
        const $LIST_HTML = $LIST($LIST_SELECTOR);
        for(const e of $LIST_HTML) {
            const id = $LIST(e).find('.img_wrap').attr('id').replace(/[^\d]/g, ''); // evt9004240504818
            if($SET.has(`cu_${id}`)) continue;
            $COUNT.length += 1; // 등록
            const image = $LIST(e).find('.img_wrap img').attr('src');
            const title = $LIST(e).find('.tit_16').text();
            const period = $LIST(e).find('.date').text();
            const $LINK = $READ_URL + id
            const $DATA = { event_id: `cu_${id}`, menu: $MENU, category: 'cu',  image, title: `[CU] ${title}`, note: [], period, link: $LINK, tag: '편의점,씨유,cu' }
            const $LIST_IMAGE = await eventImage('cu', image)
            $DATA.image = $LIST_IMAGE; // thumbnail
            try{
                const $READ_SELECTOR = '.event_area img';
                const $READ_CONTENT = await eventConn($LINK, $READ_SELECTOR)
                const $READ = cheerio.load($READ_CONTENT);
                const $READ_HTML = $READ($READ_SELECTOR);
                for(const e of $READ_HTML){
                    const $IMG = $READ(e).attr('src')
                    if($IMG){
                        const $READ_IMAGE = await eventImage('cu', $IMG)
                        $DATA.note.push(`<p><img src="${$READ_IMAGE}" alt="image"/></p>`)
                    }
                }
            }catch(err){
                checkError(err, `CU 이벤트 진행 실패! [ ${id} ]`)
            }
            const $SQL = `INSERT INTO event(event_id, menu, category, image, title, period, note, link, tag) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            await pool($SQL, [$DATA.event_id, $DATA.menu, $DATA.category, $DATA.image, $DATA.title, $DATA.period, eventNote($DATA.note), $DATA.link, $DATA.tag], 'convenience.js > cu')
        }
        telegram({ msg: `CU 이벤트 등록(업데이트) 완료! [ ${$COUNT.length} ]개` });
    }catch(err){
        checkError(err, 'CU 이벤트 등록(업데이트) 실패!')
    }
}
const emart24 = async ()=>{
    const $LIST_URL = 'https://www.emart24.co.kr/event/ing';
    const $READ_URL = 'https://www.emart24.co.kr'
    const $LIST_SELECTOR = '.eventWrap';
    const $COUNT = { length: 0 } // 등록 갯수
    try{
        const $EVENT = await pool(`SELECT event_id FROM event WHERE category=?;`, ['emart24'], 'convenience.js > emart24')
        const $SET = new Set($EVENT.map(e => e.event_id));
        const $LIST_CONTENT = await eventConn($LIST_URL, $LIST_SELECTOR)
        const $LIST = cheerio.load($LIST_CONTENT);
        const $LIST_HTML = $LIST($LIST_SELECTOR);
        for (const e of $LIST_HTML){
            const id = $LIST(e).attr('href'); // /event/2603
            if($SET.has(`emart24_${id.replace(/[^\d]/g, '')}`)) continue;
            $COUNT.length += 1; // 등록
            const image = $LIST(e).find('.eventImg img').attr('src');
            const p = $LIST(e).find('p').parent().text().replace(/\s{2,}/g, ' ').trim();
            const title = p.substring(24,);
            const period = p.substring(0, 23);
            const $LINK = $READ_URL + id;
            const $DATA = { event_id: `emart24_${id.replace(/[^\d]/g, '')}`, menu: $MENU, category: 'emart24', image, title: `[EMART24] ${title}`, note: [], period, link: $LINK, tag: '편의점,이마트24,emart24' }
            const $LIST_IMAGE = await eventImage('emart24', image)
            $DATA.image = $LIST_IMAGE;
            try{
                const $READ_SELECTOR = '.contentWrap img';
                const $READ_CONTENT = await eventConn($LINK, $READ_SELECTOR)
                const $READ = cheerio.load($READ_CONTENT);
                const $READ_HTML = $READ($READ_SELECTOR);
                for (const e of $READ_HTML) {
                    const $IMG = $READ(e).attr('src')
                    if($IMG){
                        const $READ_IMAGE = await eventImage('emart24', $IMG)
                        $DATA.note.push(`<p><img src="${$READ_IMAGE}" alt="image"/></p>`)
                    }
                }
            }catch(err){
                checkError(err, `EMART24 이벤트 진행 실패! [ ${id} ]`)
            }
            const $SQL = `INSERT INTO event(event_id, menu, category, image, title, period, note, link, tag) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            await pool($SQL, [$DATA.event_id, $DATA.menu, $DATA.category, $DATA.image, $DATA.title, $DATA.period, eventNote($DATA.note), $DATA.link, $DATA.tag], 'convenience.js > emart24')
        }
        telegram({ msg: `EMART24 이벤트 등록(업데이트) 완료! [ ${$COUNT.length} ]개` });
    }catch(err){
        checkError(err, 'EMART24 이벤트 등록(업데이트) 실패!')
    }
}
const gs25 = async ()=>{
    const $LIST_URL = 'http://gs25.gsretail.com/gscvs/ko/customer-engagement/event/current-events';
    const $READ_URL = 'http://gs25.gsretail.com';
    const $LIST_SELECTOR = '.evt_list tbody tr';
    const $COUNT = { length: 0 } // 등록 갯수
    try{
        const $EVENT = await pool(`SELECT event_id FROM event WHERE category=?;`, ['gs25'], 'convenience.js > gs25')
        const $SET = new Set($EVENT.map(e => e.event_id));
        const $LIST_CONTENT = await eventConn($LIST_URL, $LIST_SELECTOR)
        const $LIST = cheerio.load($LIST_CONTENT);
        const $LIST_HTML = $LIST($LIST_SELECTOR);
        for (const e of $LIST_HTML) {
            const id = $LIST(e).find('td:eq(0)').text()
            if($SET.has(`gs25_${id}`)) continue;
            $COUNT.length += 1; // 등록
            const type = $LIST(e).find('.evt_type').text() // 온라인/오프라인
            const image = $LIST(e).find('a img').attr('src')
            const title = $LIST(e).find('.tit').text()
            const $LINK = $READ_URL + $LIST(e).find('.tit a').attr('href')
            const period = $LIST(e).find('.period').text().match(/\d.*$/)[0] // 기간 : 2024.07.04 ~ 2024.08.31(* 조기 재고 소진이 될 수 있습니다.)
            const $DATA = { event_id: `gs25_${id}`, menu: $MENU, category: 'gs25', image, title: `[GS25/${type}] ${title}`, note: [], period, link: $LINK, tag: '편의점,gs25,지에스25' }
            const $LIST_IMAGE = await eventImage('gs25', image)
            $DATA.image = $LIST_IMAGE;
            try{
                const $READ_SELECTOR = '.event-web-contents img';
                const $READ_CONTENT = await eventConn($LINK, $READ_SELECTOR)
                const $READ = cheerio.load($READ_CONTENT);
                const $READ_HTML = $READ($READ_SELECTOR);
                for (const e of $READ_HTML) {
                    const $IMG = $READ(e).attr('src')
                    if($IMG){
                        const $READ_IMAGE = await eventImage('gs25', $IMG)
                        $DATA.note.push(`<p><img src="${$READ_IMAGE}" alt="image"/></p>`)
                    }
                }
            }catch(err){
                checkError(err, `GS25 이벤트 진행 실패! [ ${id} ]`)
            }
            const $SQL = `INSERT INTO event(event_id, menu, category, image, title, period, note, link, tag) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            await pool($SQL, [$DATA.event_id, $DATA.menu, $DATA.category, $DATA.image, $DATA.title, $DATA.period, eventNote($DATA.note), $DATA.link, $DATA.tag], 'convenience.js > gs25')
        }
        telegram({ msg: `GS25 이벤트 등록(업데이트) 완료! [ ${$COUNT.length} ]개` });
    }catch(err){
        checkError(err, 'GS25 이벤트 등록(업데이트) 실패!')
    }
}
const sevenEleven = async ()=>{
    const $LIST_URL = 'https://www.7-eleven.co.kr/event/eventList.asp';
    const $READ_URL = 'https://www.7-eleven.co.kr/event/eventView.asp?seqNo=';
    const $HOME_URL = 'https://www.7-eleven.co.kr'; // image link
    const $LIST_SELECTOR = '#listUl li';
    const browser = await puppeteer.launch({ args: [ "--disable-gpu", "--disable-dev-shm-usage", "--disable-setuid-sandbox", "--no-sandbox" ] });
    const page = await browser.newPage();  // page 객체 생성
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
    const $COUNT = { length: 0 } // 등록 갯수
    try{
        const $EVENT = await pool(`SELECT event_id FROM event WHERE category=?;`, ['7eleven'], 'convenience.js > 7eleven')
        const $SET = new Set($EVENT.map(e => e.event_id));
        const $LIST_CONTENT = await eventConn($LIST_URL, $LIST_SELECTOR)
        const $LIST = cheerio.load($LIST_CONTENT);
        const $LIST_HTML = $LIST($LIST_SELECTOR);
        for (const e of $LIST_HTML) {
            const id = $LIST(e).find('a').attr('href').match(/\d+/)[0]; // javascript: fncGoView('1102', '1');
            if($SET.has(`7eleven_${id}`)) continue;
            $COUNT.length += 1; // 등록
            const image = $LIST(e).find('a img').attr('src');
            const $IMAGE = $HOME_URL + image;
            const title = $LIST(e).find('.event_over dl dt').text();
            const period = $LIST(e).find('.event_over dl .date').text();
            const $LINK = $READ_URL + id;
            const $DATA = { event_id: `7eleven_${id}`, menu: $MENU, category: '7eleven', image: $IMAGE, title: `[7ELEVEN] ${title}`, note: [], period, link: $LINK, tag: '편의점,세븐일레븐,7eleven' }
            const $LIST_IMAGE = await eventPuppet('7eleven', page, $IMAGE)
            $DATA.image = $LIST_IMAGE;
            try{
                const $READ_SELECTOR = '.gallery_view img';
                const $READ_CONTENT = await eventConn($LINK, $READ_SELECTOR)
                const $READ = cheerio.load($READ_CONTENT);
                const $READ_HTML = $READ($READ_SELECTOR);
                for (const e of $READ_HTML) {
                    const $IMG = $READ(e).attr('src')
                    if($IMG){
                        const $READ_IMAGE = await eventPuppet('7eleven', page, $HOME_URL + $IMG)
                        $DATA.note.push(`<p><img src="${$READ_IMAGE}" alt="image"/></p>`)
                    }
                }
            }catch(err){
                checkError(err, `7ELEVEN 이벤트 진행 실패! [ ${id} ]`)
            }
            const $SQL = `INSERT INTO event(event_id, menu, category, image, title, period, note, link, tag) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            await pool($SQL, [$DATA.event_id, $DATA.menu, $DATA.category, $DATA.image, $DATA.title, $DATA.period, eventNote($DATA.note), $DATA.link, $DATA.tag, $DATA.period], 'convenience.js > sevenEleven')
        }
        telegram({ msg: `7ELEVEN 이벤트 등록(업데이트) 완료! [ ${$COUNT.length} ]개` });
    }catch(err){
        checkError(err, '7ELEVEN 이벤트 등록(업데이트) 실패!')
    }
}

module.exports = { cu, emart24, gs25, sevenEleven };