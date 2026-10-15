import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const albums = [
  { title: 'AGC – Global Camp 2022', folder: 'agc', names: ['dsc00981', 'dsc01379', 'dsc01567', 'img_2992', 'img_3100'] },
  { title: 'Real Estate Project Site Tour', folder: 'site-tour', names: ['dscf0321', 'dscf0359', 'dscf0364', 'dscf0484', 'dscf0499'] },
  { title: 'Camping Trip', folder: 'camping', names: ['dsc01842', 'dsc01895', 'dsc01922', 'dsc01926', 'dsc01994'] }
];

test('Events & Experiences presents three ordered albums and their source photographs', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/work/site-tour');
  await expect(page).toHaveTitle('Events & Experiences — Trung Hau / HEW');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Events & Experiences');
  await expect(page.locator('.case-intro .section-label')).toContainText('Event Photography');
  await expect(page.locator('.case-text-block')).toContainText('A collection of event photography work capturing people, interactions, and memorable moments across corporate events, site tours, and outdoor activities.');
  await expect(page.locator('.case-intro > .media-frame img')).toHaveAttribute('src', '/media/work/events-experiences/cover.jpg');
  await expect(page.locator('.photo-album')).toHaveCount(3);
  for (const [index, album] of albums.entries()) {
    const section = page.locator('.photo-album').nth(index);
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(album.title);
    await expect(section.locator('.photo-album-grid figure')).toHaveCount(5);
    await expect(section.locator('.photo-album-landscape')).toHaveCount(0);
    for (const [photoIndex, name] of album.names.entries()) {
      const card = section.locator('.photo-album-grid figure').nth(photoIndex);
      await expect(card.locator('a')).toHaveAttribute('href', `/media/work/events-experiences/${album.folder}/${name}.jpg`);
      await card.scrollIntoViewIfNeeded();
      await expect.poll(() => card.locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    }
  }
  expect(errors).toEqual([]);
});

test('desktop hover and keyboard focus expand the selected photo in each album', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => localStorage.setItem('hew-reduce-motion', 'off'));
  await page.goto('/work/site-tour');
  const firstAlbum = page.locator('.photo-album').first();
  const cards = firstAlbum.locator('.photo-album-grid figure');
  const second = cards.nth(1);
  await cards.first().scrollIntoViewIfNeeded();
  const before = (await second.boundingBox())!.width;
  await second.hover();
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

  const middleAlbum = page.locator('.photo-album').nth(1);
  const thirdLink = middleAlbum.locator('.photo-album-grid figure').nth(2).getByRole('link');
  await thirdLink.focus();
  await expect(thirdLink).toBeFocused();
  await expect(middleAlbum.locator('.photo-album-grid figure').nth(2)).toHaveClass(/is-active/);
  await expect(second).toHaveClass(/is-active/);
});

test('mobile albums swipe at a common card size without page overflow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/work/site-tour');
    for (const section of await page.locator('.photo-album').all()) {
      const rail = section.locator('.photo-album-grid');
      const cards = rail.locator('figure');
      await rail.scrollIntoViewIfNeeded();
      await expect(rail).toHaveCSS('overflow-x', 'auto');
      await expect(rail).toHaveCSS('scrollbar-width', 'none');
      const firstBox = (await cards.first().boundingBox())!;
      const lastBox = (await cards.last().boundingBox())!;
      expect(lastBox.width).toBeCloseTo(firstBox.width, 0);
      expect(lastBox.height).toBeCloseTo(firstBox.height, 0);
      await rail.evaluate(node => node.scrollTo({ left: node.clientWidth, behavior: 'instant' }));
      await expect(cards.nth(1)).toHaveClass(/is-active/);
      await section.getByRole('button', { name: 'Next image' }).click();
      await expect(cards.nth(2)).toHaveClass(/is-active/);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test('a missing album image keeps an accessible fallback and the full-image link', async ({ page }) => {
  await page.route('**/events-experiences/agc/dsc00981*.jpg', route => route.abort());
  await page.goto('/work/site-tour');
  const first = page.locator('.photo-album').first().locator('figure').first();
  await first.scrollIntoViewIfNeeded();
  await expect(first.locator('.media-fallback')).toBeVisible();
  await expect(first.getByRole('link')).toHaveAttribute('href', '/media/work/events-experiences/agc/dsc00981.jpg');
});

test('the three albums pass automated accessibility checks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/site-tour');
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  const result = await page.evaluate(async () => {
    // @ts-expect-error axe is injected by the test
    return window.axe.run(document.querySelector('.case-content'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
  });
  expect(result.violations.map((v: { id: string; nodes: { target: string[] }[] }) => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
});
