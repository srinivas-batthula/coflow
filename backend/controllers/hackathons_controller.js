// hackathons_controller
const { scrapeHackathons } = require('../services/scrape/hackathons')
const Hackathon = require('../models/hackathonsModel')
const fs = require('fs').promises
const path = require('path')



const get_hackathons = async(req, res)=>{
    try {
        let data
        const result = await Hackathon.find({}).lean()

        if(result.length === 0)
            data = await readFallbackJson()
        else
            data = result

        return res.status(200).json({status: 'Success', length: data.length, data})
    } catch (error) {
        // console.log('Error fetching hackathons:  ', error)
        return res.status(500).json({status: 'Failed', error})
    }
}
        //Reads Data from Fallback JSON file IF DB fails...
async function readFallbackJson() {
    const filePath = path.join(__dirname, '..', 'fallback', 'hackathons_fallback.json')

    try {
        const fileData = await fs.readFile(filePath, 'utf-8')
        const hackathons = JSON.parse(fileData) || []
        return hackathons
    } catch (err) {
        console.log('⚠️ Could not read fallback JSON:', err)
        return []
    }
}


const update_hackathons = async(req, res)=>{        //Requires `pass` -secret password...
    const { pass } = req.body

    if(pass === 'bsp_hack'){
        const r = await scrapeHackathons()
        if(r.status==='success')
            return res.status(201).json({status: 'Success', details: 'Hackathons list Scraped & Updated in DB.', length: r.length})
        else
            return res.status(500).json({status: 'Failed', details: 'Failed to Scrape/Update Hackathons.', length: r.length, error: r.error})
    }
    else{
        return res.status(401).json({status: 'Failed', details: 'Secrets Sent were Invalid/Not Matched!'})
    }
}



module.exports = { get_hackathons, update_hackathons }