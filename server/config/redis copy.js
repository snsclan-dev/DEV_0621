const { createClient } = require("redis")

const $PATH = require.main.path;
const { checkError } = require(`${$PATH}/config/system`);

const $REDIS = createClient({ url: `redis://localhost:${process.env.REDIS_PORT}`, password: process.env.APP_PASS });

const conn = async () => {
    if (!$REDIS.isOpen) { // 중복 연결 방지
        try {
            await $REDIS.connect();
            console.log("Redis connected!");
        } catch (err) {
            checkError(err, 'REDIS ON ERROR!');
        }
    }
};
conn();

$REDIS.on('error', (err) => { checkError(err, 'REDIS ON ERROR!') });

module.exports = $REDIS