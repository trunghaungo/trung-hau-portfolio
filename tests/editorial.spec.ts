import { dismissIntro } from './support/dismiss-intro';
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('intro image opens into the hero and resize releases the intro safely', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?intro=1');
  const aperture = page.locator('.intro-aperture');
  await expect(aperture).toBeVisible();
  await expect(aperture.locator('img')).toHaveCount(3);
  await expect(aperture.locator('img').last()).toHaveAttribute('src', '/media/profile/hero-2026.webp');
  expect((await aperture.boundingBox())!.width).toBeLessThan(500);
  await expect.poll(async () => (await aperture.boundingBox())?.width || 0, { intervals: [60], timeout: 3500 }).toBeGreaterThan(1050);
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

test('experience keeps each active description in view while scrolling both ways', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#about');
  const cards = page.locator('.experience-card');
  await expect(cards).toHaveCount(5);
  await expect(page.locator('.experience-toggle, .experience-sign')).toHaveCount(0);
  const visit = async (index: number) => {
    await page.evaluate(index => {
      const section = document.querySelector<HTMLElement>('.experience-block')!;
      const travel = Math.max(1, section.offsetHeight - innerHeight);
      scrollTo({ top: scrollY + section.getBoundingClientRect().top + travel * (index + .5) / 5, behavior: 'instant' });
    }, index);
    await expect(cards.nth(index)).toHaveAttribute('data-open', 'true');
    await expect(page.locator('.experience-card[aria-hidden="false"]')).toHaveCount(1);
    await expect(cards.nth(index)).toHaveCSS('opacity', '1');
    const description = (await cards.nth(index).locator('.experience-card-description').boundingBox())!;
    const headerBottom = await page.locator('.site-header').evaluate(element => element.getBoundingClientRect().bottom);
    expect(description.y).toBeGreaterThan(headerBottom + 16);
    expect(description.y + description.height).toBeLessThan(page.viewportSize()!.height - 16);
  };
  for (let index = 0; index < 5; index++) await visit(index);
  await expect(cards.last()).toContainText('Director of Photography · Graduation Film');
  await expect(cards.last()).toContainText('Jul – Dec 2023');
  await expect(cards.last()).toContainText('Awarded Best Cinematography at HUGFIA 2023.');
  for (let index = 3; index >= 0; index--) await visit(index);
  await page.setViewportSize({ width: 320, height: 844 });
  for (let index = 0; index < 5; index++) await visit(index);
  await page.setViewportSize({ width: 320, height: 480 });
  for (let index = 0; index < 5; index++) await visit(index);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(cards.last()).toHaveCSS('transition-duration', '0s');
});

test('approach copy follows the supplied three-step wording', async ({ page }) => {
  await page.goto('/#about');
  const section = page.locator('.approach-section');
  await expect(section.getByRole('heading', { name: 'From idea to final frame.' })).toBeVisible();
  await expect(section.locator('.approach-intro')).toHaveText('A three-step process, from understanding the brief to producing and delivering the final work.');
  await expect(section.locator('.approach-grid article p')).toHaveText([
    'Understand the brief, align on the creative direction, and prepare references, locations, and shot lists.',
    'Capture photos and videos with attention to composition, lighting, and the moments that matter.',
    'Edit, refine color and sound, and deliver the final photos or videos in the required formats.',
  ]);
  const arrowPaths = await section.locator('.approach-grid .step-number svg path').evaluateAll(paths => paths.map(path => path.getAttribute('d')));
  expect(new Set(arrowPaths).size).toBe(1);
  await expect(section.locator('.tools-row')).toContainText('Premiere Pro');
});

test('motion switch has a visible hover and focus response', async ({ page }) => {
  await page.goto('/#about');
  const button = page.getByRole('switch', { name: 'Reduce motion' });
  const background = await button.evaluate(element => getComputedStyle(element).backgroundColor);
  await button.hover();
  await expect(button).toHaveCSS('border-color', 'rgb(240, 75, 50)');
  await expect(button).not.toHaveCSS('background-color', background);
  await page.mouse.move(0, 400);
  await button.focus();
  await expect(button).toHaveCSS('border-color', 'rgb(240, 75, 50)');
});

test('mobile navigation overlays the page without shifting it and unlocks after resize', async ({ page }) => {
  await dismissIntro(page);
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

test('presentation config changes panel tones without editing components', async ({ page }) => {
  const settings = { ...JSON.parse(readFileSync('src/config/presentation.json', 'utf8')), projectTones: ['ink'] };
  await page.route(/\/src\/config\/presentation\.json(?:\?.*)?$/, route => route.fulfill({ contentType: 'application/javascript', body: `export default ${JSON.stringify(settings)}` }));
  await dismissIntro(page);
  await page.goto('http://127.0.0.1:5174/');
  await expect(page.locator('.project-card[data-tone="ink"]')).toHaveCount(6);
  await expect(page.locator('.contact-image, .contact-arrow')).toHaveCount(0);
  await expect(page.locator('.experience-toggle')).toHaveCount(0);
  await expect(page.locator('.experience-card[aria-hidden="false"]')).toHaveCount(1);
  await expect(page.locator('video, source, iframe')).toHaveCount(0);
});
