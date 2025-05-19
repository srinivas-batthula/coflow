    // hackathonsUpdater.js
const cron = require('node-cron')
const { scrapeHackathons } = require('../scrape/hackathons')


cron.schedule('0 */10 * * *', async () => {                 // Running `cron-job` on 'Scraping hackathons' for every 10-hrs...
    console.log("CRONJOB:\tRunning scheduled hackathons Sync...\t"+Date.now())
    try{
        const r = await scrapeHackathons()
        if(r.status!=='success')
            console.log("CRONJOB:\tFailed to Scrape/Store in DB!")
    }
    catch(error){
        console.log('CRONJOB:\tFailed to Scrape/Store ->\t'+error)
    }
})