// hackathons.js...
const Hackathon = require('../../models/hackathonsModel')
const fs = require('fs').promises
const path = require('path')

async function fetchHackathons() {
    let result = { status: 'failed', length: 0 };
    try {
        // Fetching Hackathons...
        let data = [];
        let hackathons = [];

        let res = await fetch('https://devpost.com/api/hackathons?status[]=upcoming&status[]=open&per_page=40');
        res = await res.json();
        data.push(...res.hackathons);
        hackathons.push(...data.map((item) => ({ title: item.title, url: item.url, date: item.submission_period_dates, location: item.displayed_location.location, prize: item.prize_amount.match(/<span[^>]*>([\d,]+)<\/span>/)[1].replace(/,/g, ''), host: item.organization_name, city: 'Global' })));

        res = await fetch('https://devpost.com/api/hackathons?search=hyderabad&status[]=upcoming&status[]=open&per_page=10');
        res = await res.json();
        data = [];
        data.push(...res.hackathons);
        hackathons.push(...data.map((item) => ({ title: item.title, url: item.url, date: item.submission_period_dates, location: item.displayed_location.location, prize: item.prize_amount.match(/<span[^>]*>([\d,]+)<\/span>/)[1].replace(/,/g, ''), host: item.organization_name, city: 'Hyderabad' })));

        res = await fetch('https://devpost.com/api/hackathons?search=mumbai&status[]=upcoming&status[]=open&per_page=10');
        res = await res.json();
        data = [];
        data.push(...res.hackathons);
        hackathons.push(...data.map((item) => ({ title: item.title, url: item.url, date: item.submission_period_dates, location: item.displayed_location.location, prize: item.prize_amount.match(/<span[^>]*>([\d,]+)<\/span>/)[1].replace(/,/g, ''), host: item.organization_name, city: 'Mumbai' })));

        res = await fetch('https://devpost.com/api/hackathons?search=bengaluru&status[]=upcoming&status[]=open&per_page=10');
        res = await res.json();
        data = [];
        data.push(...res.hackathons);
        hackathons.push(...data.map((item) => ({ title: item.title, url: item.url, date: item.submission_period_dates, location: item.displayed_location.location, prize: item.prize_amount.match(/<span[^>]*>([\d,]+)<\/span>/)[1].replace(/,/g, ''), host: item.organization_name, city: 'Bengaluru' })));

        // Filter out hackathons that have empty or invalid URLs
        hackathons = hackathons.filter(hackathon => (hackathon.url && hackathon.url.trim() !== '') && (hackathon.title && hackathon.title.trim() !== ''))

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
            await Hackathon.insertMany(hackathons, { ordered: false });
            result = { status: 'success', length: hackathons.length };
        } catch (insertError) {
            if (insertError.code === 11000 || insertError.writeErrors) {
                // Only duplicates — still a success
                result = {
                    status: 'partial',
                    length: insertError.result?.insertedCount || 0,
                    insertError
                };
            } else {
                await writeFallbackJson(hackathons);
                result = { status: 'partial', msg: 'Stored in backup file.', length: hackathons.length, insertError };
            }
        }
    } catch (error) {
        result = { status: 'failed', length: 0, error };
    } finally {
        await enforceMaxDocs();
    }

    return result;
}

// Removes `docs` from db, IF it's docs are more than 70...
const enforceMaxDocs = async () => {
    const MAX_DOCS = 70;
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

// Writes hackathon res to fallback JSON file
async function writeFallbackJson(hackathons) {
    const filePath = path.join(__dirname, '..', '..', 'public', 'hackathons_fallback.json');

    try {
        await fs.mkdir(path.dirname(filePath), { recursive: true }); // Ensure folder exists
        await fs.writeFile(filePath, JSON.stringify(hackathons, null, 2));
        console.log('Fallback JSON written successfully at:', filePath);
    } catch (err) {
        console.error('Failed to write fallback JSON:', err);
    }
}

module.exports = { fetchHackathons }