import { expect, test } from '@playwright/test';

test('music videos show the requested 1–3–1 sequence and play muted loops on demand', async ({ page }) => {
  await page.goto('/work/music-videos');
  const sections = page.locator('.music-video');
  await expect(sections).toHaveCount(3);
  await expect(sections.locator('h2')).toHaveText(['Đoạn Đường Phía Trước', 'Cho Tôi Tình Yêu', 'Có Chút Nắng']);
  await expect(sections.locator('.music-video-clips figure')).toHaveCount(5);
  for (const [index, count] of [1, 3, 1].entries()) {
    await expect(sections.nth(index).locator('figure')).toHaveCount(count);
    await expect(sections.nth(index)).toContainText('Camera Operator');
  }
  await expect(page.getByRole('heading', { name: 'Selected frames' })).toHaveCount(0);
  await expect(sections.getByRole('link', { name: 'See More' })).toHaveCount(3);
  await expect(sections.getByRole('link', { name: 'See More' }).first()).toHaveAttribute('href', 'https://youtu.be/aT7G36tslBc?si=YYgpoPKnTjGmvXh1');
  await expect(sections.getByRole('link', { name: 'See More' }).nth(1)).toHaveAttribute('href', 'https://www.facebook.com/share/v/1A6Ywa2ZF8/?mibextid=wwXIfr');
  await expect(sections.getByRole('link', { name: 'See More' }).last()).toHaveAttribute('href', 'https://youtu.be/zibWYNE-t88?si=reGHbRWkyUTNKAwI');
  await expect(sections.getByText('Muted loop')).toHaveCount(0);

  const first = sections.first().locator('.media-frame');
  await first.scrollIntoViewIfNeeded();
  await expect(sections.first().locator('figure')).toHaveAttribute('data-in-view', '');
  await expect.poll(() => sections.first().locator('figure').evaluate(node => getComputedStyle(node).transform)).not.toBe('none');
  await expect(first.locator('video')).toBeVisible();
  await expect.poll(() => first.locator('video').evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0);
  expect(await first.locator('video').evaluate((video: HTMLVideoElement) => ({ muted: video.muted, loop: video.loop }))).toEqual({ muted: true, loop: true });
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await expect(first.locator('video')).toHaveCount(0);
});

test('music video layout fits narrow screens and reduced motion keeps the posters', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 700 });
    await page.goto('/work/music-videos');
    await expect(page.locator('.music-video')).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.locator('.music-video video')).toHaveCount(0);
    await expect(page.locator('.music-video img')).toHaveCount(5);
    const firstFigure = page.locator('.music-video figure').first();
    await firstFigure.scrollIntoViewIfNeeded();
    await expect(firstFigure).toHaveAttribute('data-in-view', '');
    await expect(firstFigure).toHaveCSS('transform', 'none');
  }
});
