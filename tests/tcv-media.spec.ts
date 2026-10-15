import { expect, test } from '@playwright/test';

test('TCV case uses the new media in order and plays only the visible scene', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/work/tcv-rebrand');
  const cover = page.locator('#media-tcv-cover');
  await expect(cover.locator('img')).toHaveAttribute('src', '/media/work/tcv-rebrand/cover.webp');
  await expect.poll(() => cover.locator('video').count()).toBe(1);
  await expect.poll(() => cover.locator('video').evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(.1);

  const album = page.locator('.film-album');
  await expect(album).toHaveAttribute('data-pinned', 'true');
  await expect(album.locator('figure')).toHaveCount(6);
  await expect(album.locator('figure img').first()).toHaveAttribute('src', /media-01\.webp/);
  const start = await album.evaluate(el => el.getBoundingClientRect().top + scrollY - (document.querySelector('.site-header')!.getBoundingClientRect().height + 20));
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), start);
  await expect.poll(() => album.locator('figure.is-active video').count()).toBe(1);
  await expect.poll(() => album.locator('figure.is-active video').evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(.1);
  await expect(cover.locator('video')).toHaveCount(0);
  await album.getByRole('button', { name: 'Next image' }).click();
  await expect.poll(() => album.locator('.film-album-controls > span').textContent()).toBe('02 / 06');
  await expect(album.locator('figure video')).toHaveCount(1);
  await expect(album.locator('figure').nth(1).locator('video')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Storyboard to screen' })).toBeVisible();
  await expect(page.getByText('I used this storyboard to plan and shoot the scenes in the album above.')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'On set' })).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Credits' })).toHaveCount(1);
  await expect(page.locator('.production-credits')).toContainText('Ngô Trung Hậu');
  await expect(page.locator('.production-credits')).toContainText('Ord Production');
  await expect(page.locator('.production-credits img')).toHaveCount(0);
});

for (const width of [390, 320]) test(`TCV production remains readable at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await page.goto('/work/tcv-rebrand');
  const album = page.locator('.film-album');
  await expect(album).toHaveAttribute('data-pinned', 'false');
  await album.getByRole('button', { name: 'Next image' }).click();
  await expect.poll(() => album.locator('.film-album-controls > span').textContent()).toBe('02 / 06');
  await page.locator('.production-credits').scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.production-credits')).toBeVisible();
  await expect(page.locator('.production-credit')).toHaveCount(18);
});

test('reduced motion retains still frames without loading motion clips', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/tcv-rebrand');
  await expect(page.locator('#media-tcv-cover video')).toHaveCount(0);
  await page.locator('.film-album').scrollIntoViewIfNeeded();
  await expect(page.locator('.film-album video')).toHaveCount(0);
  await expect(page.locator('.film-album img')).toHaveCount(6);
  await page.locator('.production-credits').scrollIntoViewIfNeeded();
  await expect(page.locator('.production-credits')).toBeVisible();
});

test('a failed TVC motion clip leaves its poster available', async ({ page }) => {
  await page.route('**/media/work/tcv-rebrand/cover.mp4', route => route.abort());
  await page.goto('/work/tcv-rebrand');
  const cover = page.locator('#media-tcv-cover');
  await expect(cover.locator('img')).toBeVisible();
  await expect.poll(() => cover.locator('video').count()).toBe(0);
  await expect(cover.locator('.media-fallback')).toHaveCount(0);
});

test('TVC clips still play on scroll when IntersectionObserver fails', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'IntersectionObserver', { configurable: true, value: class { constructor() { throw new Error('Observer unavailable'); } } });
  });
  await page.goto('/work/tcv-rebrand');
  const cover = page.locator('#media-tcv-cover');
  await expect.poll(() => cover.locator('video').count()).toBe(1);
  await expect.poll(() => cover.locator('video').evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(.1);
  await page.locator('.film-album').scrollIntoViewIfNeeded();
  const active = page.locator('.film-album figure.is-active');
  await expect.poll(() => active.locator('video').count()).toBe(1);
  await expect.poll(() => active.locator('video').evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(.1);
  await expect(cover.locator('video')).toHaveCount(0);
});
