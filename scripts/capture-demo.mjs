import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

// Run against a locally built preview, e.g. npm run preview -- --port 4175.
const baseURL = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4175';
const directory = 'docs/screenshots';
mkdirSync(directory, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
  args: ['--no-sandbox'],
});
async function reveal(page) {
  for (const node of await page.locator('[data-reveal]').all()) {
    await node.scrollIntoViewIfNeeded();
    await page.waitForTimeout(40);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(550);
}
try {
  for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(baseURL);
    await page.evaluate(() => document.fonts.ready);
    await reveal(page);
    await page.screenshot({ path: `${directory}/home-${name}.png` });
    await page.screenshot({ path: `${directory}/home-${name}-full.png`, fullPage: true });
    await page.locator('#work').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${directory}/work-${name}.png` });
    if (name === 'mobile') {
      await page.locator('.retouch').scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${directory}/retouch-mobile.png` });
    }
    await page.goto(`${baseURL}/work/chuyen-di-bat-y`);
    await page.evaluate(() => document.fonts.ready);
    await reveal(page);
    await page.screenshot({ path: `${directory}/case-${name}.png` });
    await page.screenshot({ path: `${directory}/case-${name}-full.png`, fullPage: true });
    await context.close();
  }
  // Fresh mobile context: lab evidence only; no network or CPU throttling.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => {
    window.portfolioMetrics = { lcpMs: null, cls: 0 };
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) window.portfolioMetrics.lcpMs = entry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.portfolioMetrics.cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  const page = await context.newPage();
  const videoRequests = [];
  page.on('request', request => { if (/\.(mp4|webm|m3u8)(?:\?|$)/i.test(request.url())) videoRequests.push(request.url()); });
  await page.goto(baseURL);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  const initial = await page.evaluate(() => ({ ...window.portfolioMetrics, transferBytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + entry.transferSize, 0) + performance.getEntriesByType('navigation')[0].transferSize }));
  await reveal(page);
  const entirePage = await page.evaluate(() => ({ cls: window.portfolioMetrics.cls, transferBytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + entry.transferSize, 0) + performance.getEntriesByType('navigation')[0].transferSize }));
  const assetBytes = extension => readdirSync('dist/assets').filter(file => file.endsWith(extension)).reduce((sum, file) => sum + gzipSync(readFileSync(`dist/assets/${file}`)).byteLength, 0);
  writeFileSync('docs/performance.json', JSON.stringify({ measuredAt: new Date().toISOString(), browser: browser.version(), viewport: '390×844', throttling: 'none; localhost production preview; initial LCP observed 700 ms after fonts ready', jsGzipBytes: assetBytes('.js'), cssGzipBytes: assetBytes('.css'), initial, entirePage, videoRequests, limitations: 'SVG placeholders; not field Core Web Vitals or production media performance.' }, null, 2) + '\n');
  console.log('Saved desktop/mobile home, work, film case, retouch previews and lab measurements.');
  await context.close();
} finally {
  await browser.close();
}
