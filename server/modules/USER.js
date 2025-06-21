const $PATH = require.main.path;
const { pool } = require(`${$PATH}/config/mysql`)

const $USER_ADMIN = 200, $USER_MANAGER = 100;

const $USER_STATE = { '0_normal': 0, '1_wait': 1, '7_block': 7, '8_delete': 8, '9_delete_admin': 9, '10_delete_user': 10 };

const checkAdmin = (level)=>{
    if(!level) return false;
    if($USER_ADMIN === level) return true;
    return false;
}
const checkManager = (level)=>{
    if(!level) return false;
    if($USER_MANAGER <= level) return true;
    return false;
}
const userUpdate = async (userId)=>{
    const $SQL_UPDATE = `UPDATE user SET updated=NOW() WHERE id=?;`;
    return await pool($SQL_UPDATE, [userId], 'userUpdate()');
}

module.exports = { $USER_STATE, $USER_ADMIN, $USER_MANAGER, checkAdmin, checkManager, userUpdate }