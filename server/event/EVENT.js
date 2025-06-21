const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const $PATH = require.main.path;
const { checkError } = require(`${$PATH}/config/system`);
const { useAxios } = require(`${$PATH}/modules`);
const { $REGEX } = require(`${$PATH}/modules/REGEX`);

const eventConn = async (url, selector, timeout = 60000)=> {
    const browser = await puppeteer.launch({ args: [ "--disable-gpu", "--disable-dev-shm-usage", "--disable-setuid-sandbox", "--no-sandbox" ] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'); // User-Agent 설정
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); // navigator.webdriver 감추기
    });
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout });
        await page.waitForSelector(selector, { timeout });
        return await page.content();
    } catch (err) {
        checkError(err, `이벤트 페이지 접속 실패! > 프로토콜을 변경하여 다시 접속합니다., \nURL: ${url}`);
        try {
            const protocol = url.startsWith('https://') ? 'http://' : 'https://';
            const $URL = url.replace(/^https?:\/\//, protocol);
            await page.goto($URL, { waitUntil: 'networkidle2', timeout });
            await page.waitForSelector(selector, { timeout });
            return await page.content();
        } catch (err) {
            checkError(err, `이벤트 페이지 접속 실패! (강제 종료!)\nURL: ${url}`);
            throw err;
        }
    }finally{
        if(browser) await browser.close();
    }
}
const eventNote = (note)=>{ // event note
    return note.join().replace(/[,]/g, '');
}
const eventImage = async (eventName, imageUrl)=>{ // image download
    const $CHECK_URL = imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl
    const $MATCH = imageUrl.match($REGEX.url_image_file)
    const $CHECK = $MATCH ? $MATCH[0] : null;
    const $FILE_NAME = $CHECK || path.basename(imageUrl) || '/x.png';
    const $FOLDER = path.join('/', process.env.FOLDER, process.env.APP_NAME, 'images', 'event', eventName)
    const $PATH_IMAGE = path.join($FOLDER, $FILE_NAME)
    const $URL = $PATH_IMAGE.replace(/\\+/g, '/');
    try{
        await fs.promises.access($PATH_IMAGE); // 이미지 파일 확인
        return $URL; 
    }catch(err){
        try{
            await fs.promises.access($FOLDER);
        }catch(err){
            await fs.promises.mkdir($FOLDER, { recursive: true });
        }
        try{
            // const $DATA = await axios({ url: imageUrl, method: 'GET', responseType: 'arraybuffer' })
            // const $DATA = await useAxios({ url: $CHECK_URL, method: 'GET', responseType: 'stream' })
            // await fs.promises.writeFile($PATH_IMAGE, $DATA.data)
            const $DATA = await useAxios({ url: $CHECK_URL, method: 'GET', responseType: 'stream' });
            const $STREAM = fs.createWriteStream($PATH_IMAGE);
            $DATA.data.pipe($STREAM)
            await new Promise((resolve, reject) => {
                $STREAM.on('finish', () => resolve($URL));
                $STREAM.on('error', reject);
            });
            return $URL;
        }catch(err){
            checkError(err, '/event/EVENT.js, eventImage');
            throw err;
        }
    }
}
const eventPuppet = async (eventName, page, imageUrl)=>{
    const $MATCH = imageUrl.match($REGEX.url_image_file)
    const $CHECK = $MATCH ? $MATCH[0] : null;
    const $FILE_NAME = $CHECK || path.basename(imageUrl) || '/x.png';
    const $FOLDER = path.join('/', process.env.FOLDER, process.env.APP_NAME, 'images', 'event', eventName)
    const $PATH_IMAGE = path.join($FOLDER, $FILE_NAME)
    const $URL = $PATH_IMAGE.replace(/\\+/g, '/');
    try{
        await fs.promises.access($PATH_IMAGE); // 이미지 파일 확인
        return $URL;
    }catch(err){
        try{
            await fs.promises.access($FOLDER);
        }catch(err){
            await fs.promises.mkdir($FOLDER, { recursive: true });
        }
        try {
            const viewSource = await page.goto(imageUrl);
            const buffer = await viewSource.buffer();
            fs.writeFileSync($PATH_IMAGE, buffer);
            return $URL;
        } catch (err) {
            checkError(err, '/event/EVENT.js, eventPuppet');
            throw err;
        }
    }
};

module.exports = { eventConn, eventNote, eventImage, eventPuppet }