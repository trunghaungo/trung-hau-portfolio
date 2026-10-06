import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

async function skipSeenIntro(page: import('@playwright/test').Page) {
  await page.addInitScript(() => sessionStorage.setItem('hew-intro-seen', '1'));
}

test('first visit introduces the name, releases the page and does not replay on reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.intro-name')).toHaveText('TRUNGHAU');
  await expect(page.locator('.site-shell')).toHaveAttribute('inert', '');
  await expect(page.getByRole('button', { name: 'Skip intro' })).toBeVisible();
  await expect(page.locator('.intro-screen')).toHaveCount(0, { timeout: 4500 });
  await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trung Hau / HEW');
  await expect(page.locator('.intro-screen')).toHaveCount(0);
});

test('intro can be skipped by keyboard and touch and supports explicit replay', async ({ page, browser }) => {
  await page.goto('/?intro=1');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Skip intro' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.intro-screen')).toHaveCount(0);
  await expect(page.locator('#hero-title')).toBeFocused();
  await page.goto('/?intro=1');
  await expect(page.locator('.intro-screen')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.intro-screen')).toHaveCount(0);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobile = await context.newPage();
  await mobile.goto('http://127.0.0.1:4173/');
  await mobile.getByRole('button', { name: 'Skip intro' }).tap();
  await expect(mobile.locator('.intro-screen')).toHaveCount(0);
  await mobile.getByRole('button', { name: 'Menu' }).tap();
  await expect(mobile.getByRole('link', { name: 'Work', exact: true })).toBeVisible();
  await context.close();
});

test('reduced motion and deep links bypass intro, including a preference change mid-intro', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?intro=1');
  await expect(page.locator('.intro-screen')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?intro=1');
  await expect(page.locator('.intro-screen')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.intro-screen')).toHaveCount(0);
  await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?intro=1#work');
  await expect(page.locator('.intro-screen')).toHaveCount(0);
  await expect(page.locator('#work')).toBeFocused();
  await page.goto('/work/juno-hair?intro=1');
  await expect(page.locator('.intro-screen')).toHaveCount(0);
});

test('native project stack responds to scroll, allows all keyboard links and flattens on mobile', async ({ page }) => {
  await skipSeenIntro(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const cards = page.locator('.project-card');
  const nextTop = await cards.nth(1).evaluate(el => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(y => scrollTo({ top: y - 460, behavior: 'instant' }), nextTop);
  const measuredTop = await page.locator('.site-header').evaluate(el => Math.round(el.getBoundingClientRect().bottom + 24));
  await expect.poll(() => cards.first().evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(measuredTop);
  expect(Math.abs((await page.evaluate(() => scrollY)) - (nextTop - 460))).toBeLessThan(2);
  await expect.poll(() => cards.first().locator('.project-surface').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).a)).toBeLessThan(1);
  await page.keyboard.press('Tab');
  for (const link of await page.locator('.project-link').all()) {
    await link.focus();
    await expect(link).toBeFocused();
    expect(await link.evaluate(el => getComputedStyle(el.closest('.project-card')!).position)).toBe('relative');
    await link.scrollIntoViewIfNeeded();
    const visibleAtCenter = await link.evaluate(el => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, Math.max(130, Math.min(innerHeight - 20, r.y + r.height / 2)))); });
    expect(visibleAtCenter).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await cards.first().evaluate(el => getComputedStyle(el).position)).toBe('relative');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('project pointer badge follows intent and reduced motion removes hover movement', async ({ page }) => {
  await skipSeenIntro(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const image = page.locator('.card-0 .card-image');
  await image.scrollIntoViewIfNeeded();
  const bounds = (await image.boundingBox())!;
  await page.mouse.move(bounds.x + 90, bounds.y + 90);
  const badge = image.locator('.open-project');
  await expect(badge).toHaveCSS('opacity', '1');
  const first = await badge.boundingBox();
  await page.mouse.move(bounds.x + 240, bounds.y + 150);
  await expect.poll(async () => (await badge.boundingBox())!.x).toBeGreaterThan(first!.x + 80);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'false');
  expect(await image.evaluate(el => getComputedStyle(el).transform)).toBe('none');
  expect(await image.locator('img').evaluate(el => getComputedStyle(el).transform)).toBe('none');
  await expect(page.locator('video, source, iframe')).toHaveCount(0);
});

test('first-visit intro passes automated accessibility rules and tolerates unavailable storage', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage unavailable'); };
    Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
  });
  await page.goto('/');
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  const violations = await page.evaluate(async () => {
    // @ts-expect-error injected axe global
    return (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map((v: { id: string }) => v.id);
  });
  expect(violations).toEqual([]);
  await expect(page.locator('.intro-screen')).toHaveCount(0, { timeout: 4500 });
  await page.getByRole('link', { name: 'Explore selected work' }).click();
  await expect(page.locator('#work')).toBeFocused();
});
