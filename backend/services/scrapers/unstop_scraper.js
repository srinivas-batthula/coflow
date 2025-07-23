// unstop_scraper.js...

async function unstop( page ) {
    let hackathons = []
    let url = 'https://unstop.com/hackathons?oppstatus=open'
    let result = { success: false, data: [] };

    try {
        // Scraping Hackathons...
        let data
        data = await helper_Scrape(url + '&location-points=12.97194:77.59369', 'Bengaluru', 5, page)
        hackathons.push(...data)

        data = await helper_Scrape(url + '&location-points=17.38405:78.45636', 'Hyderabad', 5, page)
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

        console.log('UnStop hackathons scraped = '+hackathons.length)
        result = { success: true, data: hackathons };
    } catch (error) {
        console.error('Error in UnStop scraping!')
        result = { success: false, data: [] };
    }

    return result
}


// Scrapes Hackathons for each URL (diff. types)...
const helper_Scrape = async (url, city, limit, page) => {
    await page.goto(url, { waitUntil: 'networkidle' })

    // Simulate User-Scroll (to fetch the dynamic content of list of hackathons on the page)...
    await autoScroll(page, 2)

    await page.waitForSelector('.user_list')

    // Use page.$$eval to get data from the hackathon-tiles...
    const data = await page.$$eval('.user_list', (tiles, { limit, city }) =>
        tiles.slice(0, limit).map((tile) => {
            // Helper to extract all data...
            const data = tile.innerText.includes('days left')
                ? tile.innerText.split('days left')[0].trim() + ' days left'
                : ''
            const data_parts = data.split('\n')
                .map(line => line.trim())
                .filter(Boolean); // removes empty strings

            const title = data_parts[0];
            const host = data_parts[1];
            const location = host;
            const prize = /\d/.test(data_parts[3]) ? data_parts[3] : '';
            const date = data_parts[data_parts.length - 1];
            const id = (() => {                             // `ID` is used in constructing URLs...
                const idAttr = tile.querySelector('div.cursor-pointer')?.getAttribute('id') || '';
                const match = idAttr.match(/i_(\d+)_\d+/);
                return match ? match[1] : '';
            })();
            // let id = ''
            // const classAttr = tile.querySelector('div.cursor-pointer')?.getAttribute('class') || ''
            // const classMatch = classAttr.match(/opp_(\d+)/)
            // if (classMatch) id = classMatch[1]

            function slugify(text) {
                return text
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')      // Remove special chars except `-`
                    .replace(/\s+/g, '-')          // Replace spaces with `-`
                    .replace(/--+/g, '-');         // Replace multiple dashes with one
            }
            const url = `https://unstop.com/hackathons/${ slugify(title) }-${ slugify(host) }-${ id }`;

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


module.exports = { unstop }
