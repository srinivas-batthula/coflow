// hackathons.js...
const { getBrowserPage } = require('./browser')
const Hackathon = require('../../models/hackathonsModel')
const fs = require('fs').promises
const path = require('path')


// Main Scraper-method for scraping all hackathons...
async function scrapeHackathons() {
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

        const seen = new Set()
        hackathons = hackathons.filter(h => {
            if (seen.has(h.url)) return false
            seen.add(h.url)
            return true
        })

        const existing = await Hackathon.find({ url: { $in: hackathons.map(h => h.url) } }).select('url')
        const existingUrls = new Set(existing.map(h => h.url))
        hackathons = hackathons.filter(h => !existingUrls.has(h.url))


        try {
            // Insert many, ignore duplicates
            await Hackathon.insertMany(hackathons, { ordered: false })
            result = { status: 'success', length: hackathons.length }
        }
        catch (insertError) {
            if (!(error.code === 11000 || error.writeErrors)) {
                // Fallback: write to local JSON file
                await writeFallbackJson(hackathons)
                result = { status: 'success', length: hackathons.length }
            }
        }
    } catch (error) {
        result = { status: 'failed', length: 0, error }
    } finally {
        await browser.close()
    }

    return result
}



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
        console.error('Failed to write fallback JSON:', err);
    }
}




module.exports = { scrapeHackathons }
