import { test, expect } from '@playwright/test';

for (const [width, height] of [[1440,900],[1536,730],[390,844],[320,844]]) {
  test(`three photos lead into the exact hero at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    const aperture = page.locator('.intro-aperture');
    await expect(aperture).toBeVisible();
    await expect.poll(() => aperture.locator('img').evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    const sample = async (fraction: number) => page.evaluate(fraction => {
      for (const animation of document.querySelector('.intro-aperture')!.getAnimations({subtree:true})) {
        animation.pause(); animation.currentTime = Math.max(0, Number(animation.effect!.getTiming().duration) - 3400 * (1 - fraction));
      }
      const frame = document.querySelector<HTMLElement>('.intro-aperture')!;
      return { width: frame.getBoundingClientRect().width, layoutWidth: frame.style.width,
        opacity: [...frame.querySelectorAll('img')].map(img => Number(getComputedStyle(img).opacity)) };
    }, fraction);
    const first = await sample(.28), second = await sample(.43), third = await sample(.55), open = await sample(.94);
    expect(first.opacity).toEqual([1,0,0]);
    expect(second.opacity).toEqual([0,1,0]);
    expect(third.opacity).toEqual([0,0,1]);
    expect(open.width).toBeGreaterThan(third.width * 2);
    expect(open.layoutWidth).toBe(first.layoutWidth);
    const matches = await page.evaluate(() => {
      const intro = document.querySelector('.intro-aperture img:last-child') as HTMLImageElement;
      const hero = document.querySelector('.hero-frame img') as HTMLImageElement;
      return intro.currentSrc === hero.currentSrc && getComputedStyle(intro).transform === getComputedStyle(hero).transform;
    });
    expect(matches).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('.intro-screen')).toHaveCount(0);
    expect(Math.abs((await page.locator('.hero-frame').boundingBox())!.width - open.width)).toBeLessThan(1);
    expect(await page.locator('.hero-frame img').getAttribute('src')).toBe('/media/profile/hero-2026.webp');
    expect(await page.locator('.contact-image img').getAttribute('src')).toBe('/media/profile/camera-bts.webp');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    expect(await page.locator('video, source, iframe').count()).toBe(0);
  });
}
for (const name of ['intro-01', 'intro-02']) {
  test(`a failed ${name} photo releases the overlay and scroll lock`, async ({ page }) => {
    await page.route(`**/media/profile/${name}.webp`, route => route.abort());
    await page.goto('/');
    await expect(page.locator('.intro-screen')).toHaveCount(0, { timeout:1200 });
    await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  });
}
test('reload after scrolling replays into the hero instead of an offscreen target', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Escape');
  await page.evaluate(() => scrollTo(0,1500));
  await page.reload();
  await expect(page.locator('.intro-screen')).toBeVisible();
  await expect(page.locator('.intro-screen')).toHaveCount(0, { timeout:5000 });
  expect(await page.evaluate(() => scrollY)).toBe(0);
});
