// hackathons_controller
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

const update_hackathons = async (req, res) => {        //Requires `pass` -secret password...
    const { pass } = req.body;

    if (pass !== 'bsp_hack') {
        return res.status(401).json({ success: false, details: 'Secrets Sent were Invalid/Not Matched!' });
    }

    // Respond immediately
    res.status(202).json({ success: true, details: 'Scraping started in background.' });

    // Then start scraping task
    scrapeHackathons()
        .then(r => {
            if (!r) {
                console.error('Scraping returned no result');
                return;
            }

            if (r.status === 'success') {
                console.log('Scraping completed. Items:', r.length);
            } else {
                console.error('Scraping failed:', r.error);
            }
        })
        .catch(err => {
            console.error('Unhandled scraping error:', err);
        });
    return;
};

module.exports = { get_hackathons, update_hackathons };