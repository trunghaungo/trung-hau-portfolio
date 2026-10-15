import { test, expect } from '@playwright/test';

for (const [width, height] of [[1440,900],[1536,730],[390,844],[320,844]]) {
  test(`three photos lead into the exact hero at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    const aperture = page.locator('.intro-aperture');
    await expect(aperture).toBeVisible();
    await expect.poll(() => aperture.locator('img').evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    const openMs = 3400 * .96;
    const endMs = openMs + 500;
    const sample = async (timeMs: number) => page.evaluate(({ timeMs, endMs }) => {
      for (const animation of document.querySelector('.intro-aperture')!.getAnimations({subtree:true})) {
        animation.pause(); animation.currentTime = Math.max(0, Number(animation.effect!.getTiming().duration) - endMs + timeMs);
      }
      const backdrop = document.querySelector<HTMLElement>('.intro-backdrop')!;
      const backdropAnimation = backdrop.getAnimations()[0];
      backdropAnimation.pause(); backdropAnimation.currentTime = timeMs;
      const frame = document.querySelector<HTMLElement>('.intro-aperture')!;
      return { width: frame.getBoundingClientRect().width, layoutWidth: frame.style.width,
        frameOpacity: Number(getComputedStyle(frame).opacity),
        backdropOpacity: Number(getComputedStyle(backdrop).opacity),
        opacity: [...frame.querySelectorAll('img')].map(img => Number(getComputedStyle(img).opacity)) };
    }, { timeMs, endMs });
    const first = await sample(3400 * .28), second = await sample(3400 * .43), third = await sample(3400 * .55);
    const opening = await sample(3400 * .68), expanding = await sample(3400 * .82), nearlyOpen = await sample(3400 * .94);
    const open = await sample(openMs), backdropGone = await sample(openMs + 220), faded = await sample(endMs - 5);
    expect(first.opacity).toEqual([1,0,0]);
    expect(second.opacity).toEqual([0,1,0]);
    expect(third.opacity).toEqual([0,0,1]);
    expect(opening.width).toBeLessThan(expanding.width);
    expect(expanding.width).toBeLessThan(nearlyOpen.width);
    expect(nearlyOpen.width).toBeLessThan(open.width);
    expect(open.frameOpacity).toBe(1);
    expect(nearlyOpen.backdropOpacity).toBe(1);
    expect(backdropGone.backdropOpacity).toBe(0);
    expect(backdropGone.frameOpacity).toBe(1);
    expect(faded.frameOpacity).toBeLessThan(open.frameOpacity);
    expect(faded.frameOpacity).toBeLessThan(.05);
    expect(faded.backdropOpacity).toBeLessThan(.05);
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
    await expect(page.locator('.hero-identity')).toHaveCSS('opacity', '1');
    await expect(page.locator('.hero-stage-foot')).toHaveCSS('opacity', '1');
    expect(Math.abs((await page.locator('.hero-frame').boundingBox())!.width - faded.width)).toBeLessThan(1);
    expect(await page.locator('.hero-frame img').getAttribute('src')).toBe('/media/profile/hero-2026.webp');
    await expect(page.locator('.contact-image, .contact-arrow')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    expect(await page.locator('video, source, iframe').count()).toBe(0);
  });
}
test('intro letters rise long enough to read before the photo opens', async ({ page }) => {
  await page.goto('/?intro=1');
  const positions = await page.locator('.intro-letter-mask > span').first().evaluate(letter => {
    const animation = letter.getAnimations()[0];
    animation.pause();
    const yAt = (time: number) => { animation.currentTime = time; return new DOMMatrix(getComputedStyle(letter).transform).m42; };
    return [yAt(100), yAt(300), yAt(460)];
  });
  expect(positions[0]).toBeGreaterThan(positions[1]);
  expect(Math.abs(positions[1])).toBeGreaterThan(.1);
  expect(Math.abs(positions[2])).toBeLessThan(.1);
  await page.keyboard.press('Escape');
  await expect(page.locator('.hero-stage')).toBeVisible();
});
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
