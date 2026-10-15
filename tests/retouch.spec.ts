import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { dismissIntro } from './support/dismiss-intro';

test('desktop reveals before and after on hover without pressing and remains keyboard accessible', async ({ page }) => {
  await dismissIntro(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const section = page.locator('.portraits-section');
  const slider = section.getByRole('slider', { name: 'Reveal the original image' });
  await expect(section.locator('.section-label')).toContainText('Photo Editing & Retouching');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('From Capture to Final Image');
  await expect(section).toContainText('A look at how color, lighting, and retouching shape the final portrait. Compare the original and edited image to see the changes.');
  await expect(section.locator('.portrait-pair, .compare-controls')).toHaveCount(0);
  await slider.scrollIntoViewIfNeeded();
  const bounds = (await slider.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width * .2, bounds.y + bounds.height / 2);
  await expect(slider).toHaveAttribute('aria-valuenow', '20');
  await expect(slider.locator('.compare-before')).toHaveCSS('clip-path', 'inset(0px 80% 0px 0px)');
  await page.mouse.move(bounds.x + bounds.width * .8, bounds.y + bounds.height / 2);
  await expect(slider).toHaveAttribute('aria-valuenow', '80');
  await expect(slider.locator('.compare-before')).toHaveCSS('clip-path', 'inset(0px 20% 0px 0px)');
  await page.mouse.move(bounds.x - 10, bounds.y + bounds.height / 2);
  await expect(slider).toHaveAttribute('aria-valuenow', '80');
  await expect(slider.locator('.compare-before')).toHaveCSS('clip-path', 'inset(0px 20% 0px 0px)');
  await slider.focus();
  await slider.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '85');
  await slider.press('End');
  await expect(slider).toHaveAttribute('aria-valuenow', '100');
  await slider.press('Home');
  await expect(slider).toHaveAttribute('aria-valuenow', '0');
});

test('navigation moves through three aligned image pairs including the portrait', async ({ page }) => {
  await dismissIntro(page);
  await page.goto('/');
  const section = page.locator('.portraits-section');
  const slider = section.getByRole('slider');
  const status = section.locator('.compare-navigation > span');
  const previous = section.getByRole('button', { name: 'Previous comparison' });
  const next = section.getByRole('button', { name: 'Next comparison' });
  await slider.scrollIntoViewIfNeeded();
  await expect(previous).toBeDisabled();
  for (let index = 1; index <= 3; index++) {
    await expect(status).toHaveText(`Comparison ${String(index).padStart(2, '0')} / 03`);
    const before = slider.locator('.compare-before img');
    const after = slider.locator('.compare-after img');
    await expect(before).toHaveAttribute('src', `/media/portraits-retouch/comparisons/pair-${String(index).padStart(2, '0')}-before.jpg`);
    const afterFile = index === 3 ? 'pair-03-after-20261015.jpg' : `pair-${String(index).padStart(2, '0')}-after.jpg`;
    await expect(after).toHaveAttribute('src', `/media/portraits-retouch/comparisons/${afterFile}`);
    await expect.poll(() => before.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    await expect.poll(() => after.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    const sizes = await slider.locator('img').evaluateAll(images => images.map(image => [image.naturalWidth, image.naturalHeight]));
    expect(sizes[0]).toEqual(sizes[1]);
    if (index === 3) expect((await slider.boundingBox())!.height).toBeGreaterThan((await slider.boundingBox())!.width);
    if (index < 3) await next.click();
  }
  await expect(next).toBeDisabled();
  await previous.click();
  await expect(status).toHaveText('Comparison 02 / 03');
  await expect(slider).toHaveAttribute('aria-valuenow', '50');
});

test('mobile press and release reveals the original without blocking page scroll', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await dismissIntro(context);
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  const slider = page.locator('.portraits-section').getByRole('slider');
  await slider.scrollIntoViewIfNeeded();
  const bounds = (await slider.boundingBox())!;
  const touch = await context.newCDPSession(page);
  const point = [{ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2, id: 1 }];
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point });
  await expect(slider).toHaveAttribute('aria-valuenow', '100');
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(slider).toHaveAttribute('aria-valuenow', '50');
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point });
  await expect(slider).toHaveAttribute('aria-valuenow', '100');
  await touch.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(slider).toHaveAttribute('aria-valuenow', '50');
  const before = await page.evaluate(() => scrollY);
  await page.evaluate(() => scrollBy(0, 200));
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(before);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test('the comparison remains accessible with reduced motion', async ({ page }) => {
  await dismissIntro(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  const result = await page.evaluate(async () => {
    // @ts-expect-error axe is injected by the test
    return window.axe.run(document.querySelector('.portraits-section'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
  });
  expect(result.violations.map((violation: { id: string; nodes: { target: string[] }[] }) => ({ id: violation.id, targets: violation.nodes.map(node => node.target) }))).toEqual([]);
});
