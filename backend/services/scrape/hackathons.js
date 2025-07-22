// hackathons.js...
const { getBrowserPage } = require('./browser')
const Hackathon = require('../../models/hackathonsModel')
const fs = require('fs').promises
const path = require('path')


// Main Scraper-method for scraping all hackathons...
async function scrapeHackathons() {
    console.log('scrapeHackathons() --called...')                       //Test...
    const { browser, page } = await getBrowserPage()
    let hackathons = []
    let url = 'https://devpost.com/hackathons'
    let result

    try {
        // Scraping Hackathons...
        let data
        data = await helper_Scrape(url, 'Global', 40, page)
        hackathons.push(...data)

        data = await helper_Scrape(url + '?search=hyderabad&status[]=upcoming&status[]=open', 'Hyderabad', 10, page)
        hackathons.push(...data)

        data = await helper_Scrape(url + '?search=bengaluru&status[]=upcoming&status[]=open', 'Bengaluru', 10, page)
        hackathons.push(...data)

        data = await helper_Scrape(url + '?search=mumbai&status[]=upcoming&status[]=open', 'Mumbai', 10, page)
        hackathons.push(...data)

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
            // Insert many, ignore duplicates
            await Hackathon.insertMany(hackathons, { ordered: false })
            result = { status: 'success', length: hackathons.length }
        }
        catch (insertError) {
            if (insertError.code === 11000 || insertError.writeErrors) {
                // Only duplicates — still a success
                result = {
                    status: 'partial',
                    msg: 'All new data is already stored in DB!',
                    length: insertError.result?.insertedCount || 0,
                    insertError
                };
            } else {
                await writeFallbackJson(hackathons);
                result = { status: 'partial', msg: 'Stored in backup file.', length: hackathons.length, insertError };
            }
            console.error('insertError in scrapeHackathons')
        }
    } catch (error) {
        result = { status: 'failed', length: 0, error }
        console.error('error in scrapeHackathons')
    } finally {
        await browser.close()
        await enforceMaxDocs();
    }

    return result
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


// Scrapes Hackathons for each URL (diff. types)...
const helper_Scrape = async (url, city, limit, page) => {
    await page.goto(url, { waitUntil: 'networkidle' })

    // Simulate User-Scroll (to fetch the dynamic content of list of hackathons on devpost.to)...
    if (city === 'Global')
        await autoScroll(page, 17)
    else
        await autoScroll(page, 4)

    await page.waitForSelector('.hackathon-tile')

    // Use page.$$eval to get data from the hackathon-tiles...
    const data = await page.$$eval('.hackathon-tile', (tiles, { limit, city }) =>
        tiles.slice(0, limit).map((tile) => {
            // Helper functions...
            const getText = (selector) => tile.querySelector(selector)?.textContent.trim() || ''
            const getAttr = (selector, attr) => tile.querySelector(selector)?.getAttribute(attr) || ''

            const title = getText('h3')
            const url = getAttr('a.tile-anchor', 'href')
            const date = getText('.submission-period')
            const location = getText('.info-with-icon .info span')
            const prize = getText('.prize-amount')
            const host = getText('.host span')
            // const themes = Array.from(tile.querySelectorAll('.theme-label')).map(el => el.textContent.trim())

            return {
                title,
                url,
                date,
                location,
                city,
                prize,
                host
            }
        }),
        { limit, city }       // These are Extra-Arguments passed to Browser's Console (to be executed in browser)...
    )
    return data
}

// Scrolls the page with Human-Behavior (to Load the Lazy-Content)...
async function autoScroll(page, maxScrolls) {
    await page.evaluate(async (maxScrolls) => {
        await new Promise((resolve) => {
            let totalHeight = 0
            const distance = 2000
            let scrolls = 0

            const timer = setInterval(() => {
                window.scrollBy(0, distance)
                totalHeight += distance
                scrolls++

                // Every 3rd scroll, scroll up a bit (-300px)...
                if (scrolls % 3 === 0) {
                    window.scrollBy(0, -600)
                    totalHeight -= 600
                    if (scrolls === 3)
                        distance += 600
                }

                if (scrolls >= maxScrolls) {
                    clearInterval(timer)
                    resolve()
                }
            }, 1000)
        })
    }, maxScrolls)
}


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




module.exports = { scrapeHackathons }
