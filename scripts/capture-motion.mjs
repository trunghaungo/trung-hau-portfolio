import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const recordingDirectory = mkdtempSync(join(tmpdir(), 'hew-motion-'));
const baseURL = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4175';
const output = 'docs/motion-preview';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
try {
  for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, recordVideo: { dir: recordingDirectory, size: { width, height } }, ...(name === 'mobile' ? { isMobile: true, hasTouch: true } : {}) });
    const page = await context.newPage();
    await page.goto(baseURL);
    await page.locator('.intro-screen').waitFor();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${output}/intro-${name}.png` });
    await page.locator('.intro-screen').waitFor({ state: 'detached' });
    await page.waitForTimeout(1100);
    if (name === 'desktop') {
      await page.getByRole('link', { name: 'Work', exact: true }).hover();
      await page.waitForTimeout(500);
    }
    await page.evaluate(() => document.getElementById('work').scrollIntoView({ behavior: 'smooth' }));
    await page.waitForTimeout(1100);
    const first = page.locator('.card-0');
    const firstY = await first.evaluate(el => el.getBoundingClientRect().top + scrollY - 110);
    await page.evaluate(y => scrollTo({ top: y, behavior: 'smooth' }), firstY);
    await page.waitForTimeout(1000);
    if (name === 'desktop') {
      const bounds = await first.locator('.card-image').boundingBox();
      await page.mouse.move(bounds.x + 120, bounds.y + 130);
      await page.waitForTimeout(350);
      await page.mouse.move(bounds.x + 300, bounds.y + 240, { steps: 30 });
      await page.waitForTimeout(350);
      await page.screenshot({ path: `${output}/hover-desktop.png` });
      await page.mouse.move(20, 120);
    }
    // Small native scroll steps show panels covering each other without hijacking input.
    for (let step = 0; step < (name === 'desktop' ? 38 : 18); step++) {
      await page.evaluate(() => scrollBy({ top: 90, behavior: 'instant' }));
      await page.waitForTimeout(130);
      if (step === 3) await page.screenshot({ path: `${output}/work-${name}.png` });
    }
    await page.locator('.compare-controls button').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await page.locator('.compare-controls button').click();
    await page.waitForTimeout(550);
    await page.locator('.compare-controls button').click();
    await page.evaluate(() => document.querySelector('.approach-section').scrollIntoView({ behavior: 'smooth' }));
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${output}/approach-${name}.png` });
    await page.evaluate(() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }));
    await page.waitForTimeout(1700);
    if (name === 'desktop') { await page.locator('.contact-email').hover(); await page.waitForTimeout(500); }
    await page.screenshot({ path: `${output}/contact-${name}.png` });
    const video = page.video();
    await context.close();
    copyFileSync(await video.path(), `${output}/${name}.webm`);
  }
  console.log(`Motion recordings and review frames saved to ${output}. They are documentation, never portfolio media.`);
} finally { await browser.close(); rmSync(recordingDirectory, { recursive: true, force: true }); }
