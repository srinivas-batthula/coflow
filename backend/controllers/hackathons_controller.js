// hackathons_controller
const { fetchHackathons } = require('../services/fetch/hackathons')
const { scrapeHackathons } = require('../services/scrape/hackathons')
const Hackathon = require('../models/hackathonsModel')
const fs = require('fs').promises
const path = require('path')

const get_hackathons = async (req, res) => {
    try {
        let data
        const result = await Hackathon.find({}).lean()

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
        // const data = await fetchHackathons();
        const data = await scrapeHackathons();
        return res.status(201).json({ success: true, details: 'Hackathons Fetched Successfully!', result: data });
    } catch (error) {
        console.error("Error while fetching hackathons: " + error);
        return res.status(500).json({ success: false, details: 'Error while fetching hackathons!' });
    }
};

module.exports = { get_hackathons, update_hackathons };