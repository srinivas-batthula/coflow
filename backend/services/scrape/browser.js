const chromium = require('@sparticuz/chromium');
const { chromium: playwrightChromium } = require('playwright-core');

async function getBrowserPage() {
    const browser = await playwrightChromium.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
    });

    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        javaScriptEnabled: true,
        bypassCSP: true,
    });

    const page = await context.newPage();
    await context.clearCookies();

    return { browser, page };
}

module.exports = { getBrowserPage };
