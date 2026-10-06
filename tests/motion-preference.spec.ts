import { test, expect, type Page } from '@playwright/test';

const switchFor = (page: Page) => page.getByRole('switch', { name: 'Reduce motion' });
async function seen(page: Page) { await page.addInitScript(() => sessionStorage.setItem('hew-intro-seen', '1')); }

test('OS reduced is the default; an explicit full choice restores actual hover, scroll and replay', async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 730 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(switchFor(page)).toBeChecked();
  await expect(page.locator('.intro-screen')).toHaveCount(0);
  await switchFor(page).click();
  await expect(switchFor(page)).not.toBeChecked();
  const navText = page.getByRole('link', { name: 'Work', exact: true }).locator('.nav-label > span');
  await page.getByRole('link', { name: 'Work', exact: true }).hover();
  await expect.poll(() => navText.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m42)).toBeLessThan(-10);
  const image = page.locator('.hero-frame img');
  const before = await image.evaluate(el => getComputedStyle(el).transform);
  await page.mouse.wheel(0, 430);
  await expect.poll(() => image.evaluate(el => getComputedStyle(el).transform)).not.toBe(before);
  await page.goto('/?intro=1');
  await expect(page.locator('.intro-screen')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(switchFor(page)).not.toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('data-stack', 'true');
});

test('reducing motion stops animated presentation immediately while navigation and content stay usable', async ({ page }) => {
  await seen(page); await page.setViewportSize({ width: 1440, height: 900 }); await page.goto('/');
  const second = await page.locator('.project-card').nth(1).evaluate(el => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(y => scrollTo({ top: y - 400, behavior: 'instant' }), second);
  const surface = page.locator('.project-surface').first();
  await expect.poll(() => surface.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).a)).toBeLessThan(1);
  await switchFor(page).click();
  await expect(switchFor(page)).toBeChecked();
  await expect(surface).toHaveCSS('transform', 'none');
  await expect(page.locator('.project-card').first()).toHaveCSS('position', 'relative');
  await page.mouse.wheel(0, 400);
  await expect(surface).toHaveCSS('transform', 'none');
  await expect(page.locator('.hero-frame img')).toHaveCSS('transform', 'none');
  expect(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length)).toBe(0);
  await page.locator('.project-link').nth(1).click();
  await expect(page).toHaveURL(/work\/tcv-rebrand/);
  await expect(switchFor(page)).toBeChecked();
  await page.reload(); await expect(switchFor(page)).toBeChecked();
  await expect(page.locator('.motion-debug')).toHaveCount(0);
});

test('saved choice synchronizes tabs and takes precedence over subsequent OS changes', async ({ page, context }) => {
  await seen(page); await page.goto('/');
  const other = await context.newPage(); await other.goto('/#work');
  await switchFor(page).click();
  await expect(switchFor(other)).toBeChecked();
  await switchFor(other).click();
  await expect(switchFor(page)).not.toBeChecked();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'true');
  await page.reload(); await expect(switchFor(page)).not.toBeChecked();
  await other.close();
});

test('mobile choice works with touch, keyboard focus loop and unavailable storage', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); }; });
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/'); await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(switchFor(page)).toBeChecked();
  await switchFor(page).focus(); await page.keyboard.press('Space');
  await expect(switchFor(page)).not.toBeChecked();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab'); await expect(switchFor(page)).toBeFocused();
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  expect(errors).toEqual([]);
});

test('laptop stack fits common short viewports and switches to normal flow when text no longer fits', async ({ page }) => {
  await seen(page);
  for (const viewport of [{ width: 1366, height: 768 }, { width: 1536, height: 730 }, { width: 1366, height: 650 }]) {
    await page.setViewportSize(viewport); await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-stack', 'true');
    const nextY = await page.locator('.project-card').nth(1).evaluate(el => el.getBoundingClientRect().top + scrollY);
    await page.evaluate(y => scrollTo({ top: y - 390, behavior: 'instant' }), nextY);
    await expect.poll(() => page.locator('.project-surface').first().evaluate(el => new DOMMatrix(getComputedStyle(el).transform).a)).toBeLessThan(1);
    expect(await page.locator('.project-surface').evaluateAll(es => es.every(el => (el as HTMLElement).offsetHeight <= innerHeight - document.querySelector('.site-header')!.getBoundingClientRect().bottom - 24 - 16 - 16))).toBe(true);
  }
  await page.locator('.card-summary').first().evaluate(el => { el.textContent = el.textContent!.repeat(25); });
  await expect(page.locator('html')).toHaveAttribute('data-stack', 'false');
  await expect(page.locator('.project-card').first()).toHaveCSS('position', 'relative');
  await page.setViewportSize({ width: 1093, height: 560 }); await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-stack', 'false');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.project-link').first().click(); await expect(page).toHaveURL(/work\/chuyen-di-bat-y/);
});

test('debug information is opt-in and identifies the delivered version and effective choice', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/?motionDebug=1');
  const debug = page.getByRole('complementary', { name: 'Motion diagnostics' });
  await expect(debug).toContainText('2026.10.06-layout-refinement');
  await expect(debug).toContainText('"systemReduced": true');
  await switchFor(page).click(); await expect(debug).toContainText('"choice": "full"');
  await page.getByRole('link', { name: 'Close diagnostics' }).click();
  await expect(debug).toHaveCount(0);
});


test('turning full motion back on reveals unseen sections without hiding the current reading position', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await switchFor(page).click();
  await expect(page.locator('#hero-title')).toHaveCSS('opacity', '1');
  const later = page.locator('.about-image');
  await expect(later).toHaveCSS('opacity', '0');
  const y = await later.evaluate(el => el.getBoundingClientRect().top + scrollY - innerHeight + 250);
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
  await expect(later).toHaveCSS('opacity', '1');
  await switchFor(page).click();
  await expect(page.locator('.approach-grid article').first()).toHaveCSS('opacity', '1');
});
