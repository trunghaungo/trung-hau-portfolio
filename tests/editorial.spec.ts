import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('intro image opens into the hero and resize releases the intro safely', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?intro=1');
  const aperture = page.locator('.intro-aperture');
  await expect(aperture).toBeVisible();
  await expect(aperture.locator('img')).toHaveAttribute('src', '/media/profile/camera-bts.webp');
  expect((await aperture.boundingBox())!.width).toBeLessThan(500);
  await expect.poll(async () => (await aperture.boundingBox())?.width || 0, { intervals: [60], timeout: 2600 }).toBeGreaterThan(1050);
  await expect(page.locator('.intro-screen')).toHaveCount(0);
  await expect(page.locator('.hero-stage')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/?intro=1');
  await expect(page.locator('.intro-screen')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.intro-screen')).toHaveCount(0);
  await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('experience disclosures retain role and date, support keyboard and touch', async ({ page, browser }) => {
  await page.goto('/#about');
  const era = page.getByRole('button', { name: /ERA Vietnam/ });
  await expect(era).toContainText('Jan–Jun 2026');
  await expect(era).toContainText('Media Executive');
  await era.focus();
  await era.press('Enter');
  await expect(era).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('region', { name: /ERA Vietnam/ })).toContainText('Profiles, events and real estate.');
  await era.press('Escape');
  await expect(era).toHaveAttribute('aria-expanded', 'false');
  await expect(era).toBeFocused();
  await era.press('Space');
  await expect(era).toHaveAttribute('aria-expanded', 'true');
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const mobile = await context.newPage();
  await mobile.goto('http://127.0.0.1:4173/#about');
  const company = mobile.getByRole('button', { name: /Cat Dang Handicrafts/ });
  await company.tap();
  await expect(mobile.getByRole('region', { name: /Cat Dang Handicrafts/ })).toContainText('Product imagery.');
  await company.tap();
  await expect(company).toHaveAttribute('aria-expanded', 'false');
  await context.close();
});

test('mobile navigation overlays the page without shifting it and unlocks after resize', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('hew-intro-seen', '1'));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const stage = page.locator('.hero-stage');
  const before = await stage.boundingBox();
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Work', exact: true })).toBeFocused();
  expect((await stage.boundingBox())!.y).toBe(before!.y);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
  await expect(page.locator('.site-header')).not.toHaveClass(/menu-open/);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#main-nav')).not.toBeVisible();
});

test('presentation config changes panel tones and disables optional layouts without editing components', async ({ page }) => {
  const settings = { ...JSON.parse(readFileSync('src/config/presentation.json', 'utf8')), projectTones: ['ink'], contactImage: false, experienceAccordion: false };
  await page.route(/\/src\/config\/presentation\.json(?:\?.*)?$/, route => route.fulfill({ contentType: 'application/javascript', body: `export default ${JSON.stringify(settings)}` }));
  await page.addInitScript(() => sessionStorage.setItem('hew-intro-seen', '1'));
  await page.goto('http://127.0.0.1:5174/');
  await expect(page.locator('.project-card[data-tone="ink"]')).toHaveCount(6);
  await expect(page.locator('.contact-image')).toHaveCount(0);
  await expect(page.locator('.experience-toggle')).toHaveCount(0);
  await expect(page.locator('.experience-panel[aria-hidden="false"]')).toHaveCount(4);
  await expect(page.locator('video, source, iframe')).toHaveCount(0);
});
