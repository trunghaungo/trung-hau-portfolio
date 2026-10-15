import { test, expect } from '@playwright/test';
import { dismissIntro } from './support/dismiss-intro';

for (const [width,height] of [[1440,900],[1536,730],[390,844],[320,844]]) {
  test(`hero text scrubs forward and backward without moving layout at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({width,height}); await dismissIntro(page); await page.goto('/');
    const text = page.locator('.hero-description');
    const words = text.locator('.reading-text > span');
    await expect(text.locator('[data-reading-active]')).toHaveCount(1);
    const content = await text.textContent();
    const initial = await text.boundingBox();
    const origin = await text.evaluate(el => el.getBoundingClientRect().top + scrollY);
    const move = async (top: number) => {
      await page.evaluate(y => scrollTo({top:y,behavior:'instant'}), Math.max(0,origin-top));
      await page.waitForTimeout(80);
      return words.evaluateAll(nodes => {
        const ctx=document.createElement('canvas').getContext('2d')!;
        return nodes.map(el => {
          ctx.clearRect(0,0,1,1); ctx.fillStyle=getComputedStyle(el).color; ctx.fillRect(0,0,1,1);
          return {opacity:Number(getComputedStyle(el).opacity),color:[...ctx.getImageData(0,0,1,1).data].slice(0,3).join(',')};
        });
      });
    };
    const hidden = await move(height-15);
    expect(hidden.every(word => word.opacity === 0)).toBe(true);
    const partial = await move(height*.64);
    expect(partial[0].opacity).toBe(1); expect(partial.at(-1)!.opacity).toBe(0);
    expect(partial.some(word => word.opacity > 0 && word.opacity < 1 && word.color !== '23,23,23')).toBe(true);
    const full = await move(height*.22);
    expect(full.every(word => word.opacity === 1 && word.color === '23,23,23')).toBe(true);
    const reversed = await move(height*.64);
    reversed.forEach((word,index) => expect(word.opacity).toBeCloseTo(partial[index].opacity,2));
    const after = await text.boundingBox();
    expect(after!.x).toBe(initial!.x); expect(after!.width).toBe(initial!.width); expect(after!.height).toBe(initial!.height);
    expect(await text.textContent()).toBe(content);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.emulateMedia({reducedMotion:'reduce'});
    await expect.poll(() => words.evaluateAll(nodes => nodes.every(el => getComputedStyle(el).opacity === '1' && getComputedStyle(el).color === 'rgb(23, 23, 23)'))).toBe(true);
    await expect(text.locator('[data-reading-active]')).toHaveCount(0);
  });
}
test('missing motion observers leave the whole hero text readable', async ({ page }) => {
  await dismissIntro(page);
  await page.addInitScript(() => Object.defineProperty(window,'IntersectionObserver',{configurable:true,value:undefined}));
  await page.goto('/');
  const text=page.locator('.hero-description');
  await text.scrollIntoViewIfNeeded();
  expect(await text.locator('.reading-text > span').evaluateAll(nodes => nodes.every(el => getComputedStyle(el).opacity === '1'))).toBe(true);
  await expect(text.locator('[data-reading-active]')).toHaveCount(0);
});
