import { expect, test } from '@playwright/test';

test('Juno separates the landscape portrait and keeps the remaining photographs in order', async ({ page }) => {
  await page.goto('/work/juno-hair');
  await expect(page.locator('.case-intro > .media-frame img')).toHaveAttribute('src', '/media/work/juno-hair/cover-logos.jpg');

  const cards = page.locator('.photo-album-grid figure');
  await expect(cards).toHaveCount(8);
  await expect(cards.locator('figcaption')).toHaveCount(0);
  await expect(cards.first()).toHaveClass(/is-active/);
  await expect(page.locator('.photo-album-grid')).toHaveCSS('overflow-x', 'hidden');
  const sourceRatios = [3376 / 6000, 4000 / 6000, 3376 / 6000, 3376 / 6000, 3377 / 6000, 3376 / 6000, 3376 / 6000, 3376 / 6000];
  for (let index = 0; index < 8; index++) {
    const card = cards.nth(index);
    await expect(card.locator('a')).toHaveAttribute('href', `/media/work/juno-hair/${index + 2}.jpg`);
    const image = card.locator('img');
    await card.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0);
    const actual = await image.evaluate((node: HTMLImageElement) => ({ ratio: node.naturalWidth / node.naturalHeight, fit: getComputedStyle(node).objectFit }));
    expect(actual.ratio).toBeCloseTo(sourceRatios[index], 2);
    expect(actual.fit).toBe('cover');
  }

  const landscape = page.locator('.photo-album-landscape');
  await expect(landscape).toHaveCount(1);
  await expect(landscape.locator('a')).toHaveAttribute('href', '/media/work/juno-hair/1.jpg');
  await expect(landscape.locator('figcaption')).toHaveText('The Hairstylist');
  expect(await landscape.evaluate(node => node.compareDocumentPosition(document.querySelector('.photo-album-grid')!) & Node.DOCUMENT_POSITION_PRECEDING)).toBeTruthy();
  await expect(landscape.locator('img')).toHaveCSS('object-fit', 'contain');

  const link = cards.nth(1).getByRole('link', { name: /Open photograph: Close portrait/ });
  await link.focus();
  await expect(link).toBeFocused();
  await expect(cards.nth(1)).toHaveClass(/is-active/);
});

test('desktop hover opens each card smoothly into a near-square frame', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => localStorage.setItem('hew-reduce-motion', 'off'));
  await page.goto('/work/juno-hair');
  const cards = page.locator('.photo-album-grid figure');
  await cards.first().scrollIntoViewIfNeeded();
  const second = cards.nth(1);
  const before = (await second.boundingBox())!.width;
  const bounds = (await second.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await expect(second).toHaveClass(/is-active/);
  await page.waitForTimeout(120);
  const middle = (await second.boundingBox())!.width;
  await page.waitForTimeout(700);
  const final = (await second.boundingBox())!.width;
  expect(middle).toBeGreaterThan(before + 5);
  expect(final).toBeGreaterThan(middle + 5);
  const ratio = await second.locator('.media-frame').evaluate(node => node.clientWidth / node.clientHeight);
  expect(ratio).toBeGreaterThan(.85);
  expect(ratio).toBeLessThan(1.3);
  await cards.nth(3).hover();
  await expect(cards.nth(3)).toHaveClass(/is-active/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440);
});

test('mobile swipes one card at a time without showing horizontal scrollbars', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 700 });
    await page.goto('/work/juno-hair');
    const rail = page.locator('.photo-album-grid');
    const cards = rail.locator('figure');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(rail).toHaveCSS('overflow-x', 'auto');
    await expect(rail).toHaveCSS('scrollbar-width', 'none');
    expect(await rail.evaluate(node => node.scrollWidth)).toBeGreaterThan(await rail.evaluate(node => node.clientWidth));
    await rail.evaluate(node => node.scrollTo({ left: node.clientWidth, behavior: 'instant' }));
    await expect(cards.nth(1)).toHaveClass(/is-active/);
    await page.getByRole('button', { name: 'Next image' }).click();
    await expect(cards.nth(2)).toHaveClass(/is-active/);
    await expect(cards.first()).toHaveCSS('transition-duration', '0s');
    await expect(page.locator('.photo-album-landscape figcaption')).toHaveText('The Hairstylist');
  }
});
