// devpostapi_fetcher.js...

async function devpostapi() {
    let result = { success: false, data: [] };

    try {
        // Fetching Hackathons...
        let data = [];
        let hackathons = [];

        let res = await fetch('https://devpost.com/api/hackathons?status[]=upcoming&status[]=open&per_page=30');
        res = await res.json();
        data.push(...res.hackathons);
        hackathons.push(...data.map((item) => ({ title: item.title, url: item.url, date: item.submission_period_dates, location: item.displayed_location.location, prize: item.prize_amount.match(/<span[^>]*>([\d,]+)<\/span>/)[1].replace(/,/g, ''), host: item.organization_name, city: 'Global' })));

        res = await fetch('https://devpost.com/api/hackathons?search=hyderabad&status[]=upcoming&status[]=open&per_page=5');
        res = await res.json();
        data = [];
        data.push(...res.hackathons);
        hackathons.push(...data.map((item) => ({ title: item.title, url: item.url, date: item.submission_period_dates, location: item.displayed_location.location, prize: item.prize_amount.match(/<span[^>]*>([\d,]+)<\/span>/)[1].replace(/,/g, ''), host: item.organization_name, city: 'Hyderabad' })));

        res = await fetch('https://devpost.com/api/hackathons?search=mumbai&status[]=upcoming&status[]=open&per_page=5');
        res = await res.json();
        data = [];
        data.push(...res.hackathons);
        hackathons.push(...data.map((item) => ({ title: item.title, url: item.url, date: item.submission_period_dates, location: item.displayed_location.location, prize: item.prize_amount.match(/<span[^>]*>([\d,]+)<\/span>/)[1].replace(/,/g, ''), host: item.organization_name, city: 'Mumbai' })));

        res = await fetch('https://devpost.com/api/hackathons?search=bengaluru&status[]=upcoming&status[]=open&per_page=5');
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

        console.log('devpostAPI hackathons fetched = '+hackathons.length)
        result = { success: true, data: hackathons };
    } catch (error) {
        console.error('Error in devpostapi fetching!')
        result = { success: false, data: [] };
    }

    return result;
}


module.exports = { devpostapi }