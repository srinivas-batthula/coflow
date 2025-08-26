// browser.js
const { chromium } = require('playwright');

async function getBrowserPage() {
  const browser = await chromium.launch({
    headless: true, // `headless: true` -->> Browser is not seen by us (hidden) && `false` -->> Visually seen...
  });

  const userAgents = [
    // Store these 'userAgents in  `.env` file...
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.86 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.86 Safari/537.36 Edg/123.0.2420.81',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.86 Safari/537.36 OPR/96.0.4693.50',
  ];

  const context = await browser.newContext({
    userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
    viewport: { width: 1280, height: 800 },
    javaScriptEnabled: true,
    bypassCSP: true,
  });

  const page = await context.newPage();

  await context.clearCookies();

  return { browser, page };
}

module.exports = { getBrowserPage };
