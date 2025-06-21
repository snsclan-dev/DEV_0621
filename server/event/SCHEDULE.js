const schedule = require('node-schedule');

const $PATH = require.main.path;
const { checkError } = require(`${$PATH}/config/system`);

const { cu, emart24, gs25, sevenEleven } = require(`${$PATH}/event/convenience`);
const { hansot, lotteEatz } = require(`${$PATH}/event/food`);
const { starbucks, mega } = require(`${$PATH}/event/coffee`);

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
        if(menu === 'coffee'){
            await starbucks(); 
            await mega();
        }
    }catch(err){
        checkError(err, 'event/SCHEDULE.js eventUpdate()')
    }
}
const $SCHEDULE = ()=>{
    if(process.env.NODE_ENV === 'production'){
        try{
            schedule.scheduleJob('0 5 0 * * *', async function(){
                await eventUpdate('convenience');
            })
            schedule.scheduleJob('0 10 0 * * *', async function(){
                await eventUpdate('food');
            })
            schedule.scheduleJob('0 15 0 * * *', async function(){
                await eventUpdate('coffee');
            })
        }catch(err){
            checkError(err, 'event/SCHEDULE.js $SCHEDULE()')
        }
    }
}

module.exports = { eventUpdate , $SCHEDULE };