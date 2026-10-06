import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

// Reuse this exact helper for BEFORE and AFTER. It does not edit the checkout.
// PORTFOLIO_PREVIEW_URL=http://127.0.0.1:4180 node scripts/review-performance.mjs
const repository = process.env.PORTFOLIO_REPO || fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(join(repository, 'package.json'));
const { chromium } = require('@playwright/test');
const baseURL = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4180';
const output = resolve(process.env.REVIEW_OUTPUT || join(repository, 'docs/refinement/after'));
mkdirSync(join(output, 'screenshots'), { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
  args: ['--no-sandbox'],
});
const viewports = [{ name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true }, { name: 'desktop', width: 1440, height: 900, isMobile: false, hasTouch: false }];
function options(viewport) {
  return { viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: 'no-preference', isMobile: viewport.isMobile, hasTouch: viewport.hasTouch };
}
async function ready(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => !document.querySelector('.intro-screen'));
}
async function reveal(page) {
  for (const node of await page.locator('[data-reveal]').all()) {
    await node.scrollIntoViewIfNeeded();
    await page.waitForTimeout(40);
  }
  // Explicitly visit every image so below-the-fold lazy images participate equally.
  for (const node of await page.locator('img').all()) {
    await node.scrollIntoViewIfNeeded();
    await node.evaluate(image => image.decode());
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(1100);
}
async function snapshot(page) {
  return page.evaluate(() => {
    const resources = performance.getEntriesByType('resource').map(entry => ({ name: new URL(entry.name).pathname, initiatorType: entry.initiatorType, transferBytes: entry.transferSize, encodedBodyBytes: entry.encodedBodySize, decodedBodyBytes: entry.decodedBodySize }));
    const navigation = performance.getEntriesByType('navigation')[0];
    return { ...window.reviewMetrics, observedAtMs: performance.now(), transferBytes: resources.reduce((sum, entry) => sum + entry.transferBytes, 0) + navigation.transferSize, navigationTransferBytes: navigation.transferSize, resourceCount: resources.length, resources, horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - innerWidth) };
  });
}
const assetGzip = extension => readdirSync(join(repository, 'dist/assets')).filter(file => file.endsWith(extension)).map(file => ({ file, bytes: readFileSync(join(repository, 'dist/assets', file)).byteLength, gzipBytes: gzipSync(readFileSync(join(repository, 'dist/assets', file))).byteLength }));
const jsAssets = assetGzip('.js'), cssAssets = assetGzip('.css');
const result = {
  measuredAt: new Date().toISOString(), commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repository, encoding: 'utf8' }).trim(),
  baseURL, browser: browser.version(), node: process.version,
  method: 'Production localhost; no network or CPU throttling. Three sequential fresh contexts per viewport; explicit no-preference motion; deviceScaleFactor=1. Initial measurement after intro disappearance, fonts ready and 1100ms settling. Entire page after visiting all reveal nodes and every image, decoding images, return to top and 1100ms settling. No concurrent test load during measurement.',
  limitations: 'Lab observations, not field Core Web Vitals. First visit has a timed intro; LCP may represent the intro and does not measure when the main interface becomes visible. introReleasedAtMs is observed intro DOM removal; interfaceObservedAtMs is an explicit settled observation, not TTI. transferBytes are Chromium Resource Timing transferSize including response headers for a local Vite preview; encoded and decoded sizes are recorded separately. CLS is the maximum layout-shift session window; cumulativeLayoutShift is the raw sum. Mobile emulation is Chromium, not a physical phone.',
  jsGzipBytes: jsAssets.reduce((sum, asset) => sum + asset.gzipBytes, 0), cssGzipBytes: cssAssets.reduce((sum, asset) => sum + asset.gzipBytes, 0), jsAssets, cssAssets,
  samples: [], screenshots: [],
};
try {
  for (const viewport of viewports) {
    for (let run = 1; run <= 3; run++) {
      const context = await browser.newContext(options(viewport));
      await context.addInitScript(() => {
        window.reviewMetrics = { lcpMs: null, lcpElement: null, cls: 0, cumulativeLayoutShift: 0, introSeen: false, introReleasedAtMs: null };
        let sessionValue = 0, sessionStart = 0, lastShift = 0;
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            window.reviewMetrics.lcpMs = entry.startTime;
            window.reviewMetrics.lcpElement = entry.element ? `${entry.element.tagName.toLowerCase()}${entry.element.id ? '#' + entry.element.id : ''}.${String(entry.element.className).replaceAll(' ', '.')}` : null;
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.hadRecentInput) continue;
            window.reviewMetrics.cumulativeLayoutShift += entry.value;
            if (entry.startTime - lastShift < 1000 && entry.startTime - sessionStart < 5000) sessionValue += entry.value;
            else { sessionStart = entry.startTime; sessionValue = entry.value; }
            lastShift = entry.startTime;
            window.reviewMetrics.cls = Math.max(window.reviewMetrics.cls, sessionValue);
          }
        }).observe({ type: 'layout-shift', buffered: true });
        new MutationObserver(() => {
          if (document.querySelector('.intro-screen')) window.reviewMetrics.introSeen = true;
          else if (window.reviewMetrics.introSeen && window.reviewMetrics.introReleasedAtMs === null) window.reviewMetrics.introReleasedAtMs = performance.now();
        }).observe(document, { childList: true, subtree: true });
      });
      const page = await context.newPage();
      const videoRequests = [], errors = [], failedRequests = [];
      page.on('request', request => { if (/\.(mp4|webm|m3u8)(?:\?|$)/i.test(request.url())) videoRequests.push(request.url()); });
      page.on('pageerror', error => errors.push(error.message));
      page.on('requestfailed', request => failedRequests.push({ url: request.url(), failure: request.failure() }));
      await page.goto(baseURL);
      await ready(page);
      await page.waitForTimeout(1100);
      const initial = await snapshot(page);
      await reveal(page);
      const entirePage = await snapshot(page);
      result.samples.push({ viewport: viewport.name, width: viewport.width, height: viewport.height, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch, run, initial, entirePage, interfaceObservedAtMs: initial.observedAtMs, videoRequests, errors, failedRequests });
      console.log(`${viewport.name} run ${run}: initial=${initial.transferBytes} whole=${entirePage.transferBytes} CLS=${entirePage.cls} LCP=${initial.lcpMs} intro=${initial.introReleasedAtMs}`);
      await context.close();
      writeFileSync(join(output, 'performance.json'), JSON.stringify(result, null, 2) + '\n');
    }
  }
  for (const viewport of viewports) {
    const context = await browser.newContext(options(viewport));
    const page = await context.newPage();
    await page.goto(baseURL);
    await ready(page);
    await reveal(page);
    const capture = async (name, fullPage = false) => {
      const file = `screenshots/${name}-${viewport.name}.png`;
      await page.screenshot({ path: join(output, file), fullPage });
      result.screenshots.push(file);
    };
    await capture('hero');
    await capture('homepage-full', true);
    for (const section of ['work', 'about', 'contact']) {
      await page.locator(`#${section}`).evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
      await page.waitForTimeout(1100);
      await capture(section);
    }
    await page.locator('.retouch').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1100);
    await capture('retouch');
    const cards = await page.locator('.project-card').all();
    for (let index = 0; index < cards.length; index++) {
      // Sticky boxes report their pinned rectangle; return to top before locating each natural card position.
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(100);
      await cards[index].evaluate(el => { const top = el.getBoundingClientRect().top + scrollY; const header = document.querySelector('.site-header').getBoundingClientRect().bottom; scrollTo({ top: top - header - 24, behavior: 'instant' }); });
      await page.waitForTimeout(1100);
      await capture(`project-${index + 1}`);
    }
    if (viewport.name === 'mobile') {
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      await page.waitForTimeout(1100);
      await capture('menu');
      await page.keyboard.press('Escape');
    }
    await page.goto(`${baseURL}/work/chuyen-di-bat-y`);
    await ready(page);
    await reveal(page);
    await capture('case');
    await capture('case-full', true);
    await context.close();
  }
  const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
  result.summary = viewports.map(viewport => {
    const samples = result.samples.filter(sample => sample.viewport === viewport.name);
    return { viewport: `${viewport.width}x${viewport.height}`, name: viewport.name, samples: samples.length,
      initialTransferBytesMedian: median(samples.map(sample => sample.initial.transferBytes)), entirePageTransferBytesMedian: median(samples.map(sample => sample.entirePage.transferBytes)),
      initialLcpMsMedian: median(samples.map(sample => sample.initial.lcpMs)), entirePageClsMedian: median(samples.map(sample => sample.entirePage.cls)),
      introReleasedAtMsMedian: median(samples.map(sample => sample.initial.introReleasedAtMs)), interfaceObservedAtMsMedian: median(samples.map(sample => sample.interfaceObservedAtMs)),
      videoRequests: samples.reduce((sum, sample) => sum + sample.videoRequests.length, 0), errors: samples.flatMap(sample => sample.errors), failedRequests: samples.flatMap(sample => sample.failedRequests),
    };
  });
  writeFileSync(join(output, 'performance.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ jsGzipBytes: result.jsGzipBytes, cssGzipBytes: result.cssGzipBytes, summary: result.summary, screenshots: result.screenshots.length }, null, 2));
} finally {
  await browser.close();
}
