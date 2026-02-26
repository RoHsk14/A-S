/**
 * Sauvegarde la vraie réponse GraphQL complète dans /tmp/fb-graphql.json
 * Usage: node scraper-dump.js "mot-clé"
 */
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const fs = require('fs');

async function dump(keyword) {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    page.on('response', async (response) => {
        const url = response.url();
        if (!url.includes('/api/graphql')) return;
        try {
            const text = await response.text();
            if (!text.includes('ad_archive_id')) return;
            fs.writeFileSync('/tmp/fb-graphql.json', text);
            console.log('✅ GraphQL sauvegardé dans /tmp/fb-graphql.json');
        } catch (_) { }
    });

    const url = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&q=${encodeURIComponent(keyword)}&country=FR&media_type=all`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(8000);
    await browser.close();
}

dump(process.argv[2] || 'soin visage');
