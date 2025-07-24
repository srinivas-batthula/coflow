// hackathons_controller

const { mainScraper } = require('../services/scrapers/mainScraper')
const Hackathon = require('../models/hackathonsModel')
const fs = require('fs').promises
const path = require('path')

const get_hackathons = async (req, res) => {
    try {
        let data
        const result = await Hackathon.find({}).sort({ createdAt: -1 }).lean()

        if (result.length === 0)
            data = await readFallbackJson()
        else
            data = result

        return res.status(200).json({ success: true, length: data.length, data })
    } catch (error) {
        // console.log('Error fetching hackathons:  ', error)
        return res.status(500).json({ success: false, error })
    }
}

//Reads Data from Fallback JSON file IF DB fails...
async function readFallbackJson() {
    const filePath = path.join(__dirname, '..', 'public', 'hackathons_fallback.json')

    try {
        const fileData = await fs.readFile(filePath, 'utf-8')
        const hackathons = JSON.parse(fileData) || []
        return hackathons
    } catch (err) {
        console.log('⚠️ Could not read fallback JSON:', err)
        return []
    }
}

const update_hackathons = async (req, res) => {        //Requires `pass` -secret password...
    const { pass } = req.body;

    if (pass !== 'bsp_hack') {
        return res.status(401).json({ success: false, details: 'Secrets Sent were Invalid/Not Matched!' });
    }
    try {
        res.status(201).json({ success: true, details: 'Hackathons will be Fetched in 2-mins! (see logs in `render` for more details)' });

        const data = await mainScraper();
        result = { status: data.status, length: data?.length, error: data?.error, msg: data?.msg };
        console.log(result);
        return;
    } catch (error) {
        console.error("Error while Scraping hackathons");
        // return res.status(500).json({ success: false, details: 'Error while fetching hackathons!' });
    }
};

module.exports = { get_hackathons, update_hackathons };