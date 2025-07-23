// mainScraper.js...

const { getBrowserPage } = require('./browser')
const Hackathon = require('../../models/hackathonsModel')
const fs = require('fs').promises
const path = require('path')
const { devpostapi } = require('./devpostapi_fetcher')
const { unstop } = require('./unstop_scraper')


// Main Scraper-method for scraping/fetching all hackathons...
async function mainScraper() {
    console.log('mainScraper() --called...')                       //Test...

    const { browser, page } = await getBrowserPage()
    let hackathons = []
    let result = { status: 'failed!', length: 0 }

    try {
        let res;
        res = await unstop( page );           // Scraping from UnStop...
        if (res.success === true)
            hackathons.push(...res.data);

        res = await devpostapi();       // Fetching from devpost API...
        if (res.success === true)
            hackathons.push(...res.data);


        // Filtering hackathons data...
        const seen = new Set();         // Unique URLs & Titles...
        hackathons = hackathons.filter(h => {
            const key = `${h.url}|${h.title}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Query existing hackathons using url and title
        const existing = await Hackathon.find({
            $or: hackathons.map(h => ({ url: h.url, title: h.title }))
        }).select('url title');
        const existingKeys = new Set(existing.map(h => `${h.url}|${h.title}`));
        hackathons = hackathons.filter(h => !existingKeys.has(`${h.url}|${h.title}`));

        try {
            await Hackathon.insertMany(hackathons, { ordered: false });             // Bulk Insert hackathons into DB...
            result = { status: 'success', length: hackathons.length, msg: 'Stored in DB!' };
        } catch (insertError) {
            if (insertError.code === 11000 || insertError.writeErrors) {
                // Only duplicates — still a success
                result = {
                    status: 'partial',
                    length: insertError.result?.insertedCount || 0,
                    msg: 'All hackathons scraped are already stored in DB (duplicates)!'
                };
            } else {
                await writeFallbackJson(hackathons);
                result = { status: 'partial', msg: 'Stored in backup-JSON file!', length: hackathons.length };
            }
        }

    } catch (error) {
        result = { status: 'failed!', length: 0, msg: 'Failed to fetch/scrape!' };
        console.error('Error in mainScraper')
    }
    finally {
        await browser.close()
        await enforceMaxDocs();
    }
    return result;
}


// Removes `docs` from db, IF it's docs are more than 60...
const enforceMaxDocs = async () => {
    const MAX_DOCS = 60;
    const count = await Hackathon.countDocuments();

    if (count > MAX_DOCS) {
        const toDelete = count - MAX_DOCS;

        const oldDocs = await Hackathon.find()
            .sort({ createdAt: 1 }) // oldest first
            .limit(toDelete)
            .select('_id');

        const ids = oldDocs.map(doc => doc._id);
        await Hackathon.deleteMany({ _id: { $in: ids } });
    }
};


// Writes hackathon data to fallback JSON file
async function writeFallbackJson(hackathons) {
    const filePath = path.join(__dirname, '..', '..', 'fallback', 'hackathons_fallback.json');

    try {
        await fs.mkdir(path.dirname(filePath), { recursive: true }); // Ensure folder exists
        await fs.writeFile(filePath, JSON.stringify(hackathons, null, 2));
        console.log('Fallback JSON written successfully at:', filePath);
    } catch (err) {
        console.error('Failed to write fallback JSON');
    }
}


module.exports = { mainScraper };