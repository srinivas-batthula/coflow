    // hackathonsUpdater.js
const cron = require('node-cron')
const { mainScraper } = require('../scrapers/mainScraper')

cron.schedule('0 */10 * * *', async () => {                 // Running `cron-job` on 'Fetching hackathons' for every 10-hrs...
    console.log("CRONJOB:\tRunning scheduled hackathons Sync...\t"+Date.now())
    try{
        const r = await mainScraper();
        if(r.status!=='success')
            console.log("CRONJOB:\tFailed to Fetch/Store in DB!")
    }
    catch(error){
        console.log('CRONJOB:\tFailed to Fetch/Store ->\t'+error)
    }
})
