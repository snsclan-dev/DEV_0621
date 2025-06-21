const $PATH = require.main.path;
const $REDIS = require(`${$PATH}/config/redis`);
const { pool } = require(`${$PATH}/config/mysql`)
const { checkError } = require(`${$PATH}/config/system`);

const $APP_NAME = process.env.APP_NAME.toUpperCase()

const appInfo = async ()=>{
    try{
        const $SQL_MENU = `SELECT * FROM app WHERE state != 7;`; // 7: menu hidden
        const $MENU = await pool($SQL_MENU)
        if($MENU.code) return
        await $REDIS.SET(`${$APP_NAME}_INFO`, JSON.stringify($MENU))
        process.env.NODE_ENV === 'development' && console.log('Menu Updated!');
    }catch(err){
        checkError(err, 'modules/APP.js, appInfo')
    }
};

appInfo();

module.exports = appInfo;