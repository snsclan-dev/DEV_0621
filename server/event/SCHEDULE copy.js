const schedule = require('node-schedule');

const $PATH = require.main.path;
const { checkError } = require(`${$PATH}/config/system`);
const { telegram } = require(`${$PATH}/modules`);

const { cu, emart24, gs25, sevenEleven } = require(`${$PATH}/event/convenience`);
const { hansot, lotteEatz } = require(`${$PATH}/event/food`);

const eventUpdate = async (menu) =>{
    try{
        if(menu === 'convenience'){
            await cu(); 
            await emart24(); 
            await gs25();
            await sevenEleven(); 
        }
        if(menu === 'food'){
            await hansot(); 
            await lotteEatz();
        }
    }catch(err){
        checkError(err, 'event/SCHEDULE.js eventUpdate()')
    }
}
const $SCHEDULE = ()=>{
    if(process.env.NODE_ENV === 'production'){
        schedule.scheduleJob('0 0 0 * * *', async function(){
            try{
                await eventUpdate('convenience');
                await eventUpdate('food');
                telegram(`[ 0 0 0 * * * ] 스케줄 업데이트 완료!`);
            }catch(err){
                checkError(err, 'event/SCHEDULE.js schedule.scheduleJob()')
            }
        });
    }
}

module.exports = { eventUpdate , $SCHEDULE };