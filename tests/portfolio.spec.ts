import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const projects = JSON.parse(readFileSync('src/content/projects.json', 'utf8')) as { slug: string; title: string }[];

test('demo renders all work, correct credit and no video requests', async ({ page }) => {
  const requests: string[] = [], errors: string[] = [];
  page.on('request', r => requests.push(r.url()));
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trung Hau / HEW');
  await expect(page.locator('.project-card')).toHaveCount(6);
  await expect(page.locator('.card-credit')).toHaveText('Director of Photography');
  await expect(page.locator('.recognition-tag')).toContainText('Best Cinematography · HUGFIA 2023');
  await expect(page.locator('#project-chuyen-di-bat-y h3')).toHaveText('Chuyến Đi Bất Ý');
  await expect(page.locator('#project-chuyen-di-bat-y .card-alternate-title')).toHaveText('Chuyen Di Bat Y');
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.locator('video, iframe, source')).toHaveCount(0);
  expect(requests.filter(url => /\.(mp4|webm|m3u8)(?:\?|$)|youtube|vimeo/i.test(url))).toEqual([]);
  expect(requests.some(url => /sample-\d/.test(url))).toBe(false);
  expect(errors).toEqual([]);
  await expect(page.locator('.contact-email')).toHaveAttribute('href', 'mailto:info.ngotrunghau@gmail.com');
});

for (const width of [320, 390, 430, 768, 1024, 1440]) {
  test(`layout fits at ${width}px and projects remain accessible`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const p of projects) await expect(page.locator(`#project-${p.slug}`)).toHaveAttribute('href', `/work/${p.slug}`);
    await page.goto('/work/juno-hair');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Wellbridge Global');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('mobile landscape and 200% equivalent layout remain usable', async ({ page }) => {
  for (const viewport of [{ width: 844, height: 390 }, { width: 720, height: 450 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

for (const p of projects) {
  test(`home to ${p.slug}, refresh, back and forward`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const card = page.locator(`#project-${p.slug}`);
    await card.scrollIntoViewIfNeeded();
    // Capture after the browser has aligned/focused the click target, before React navigates.
    await card.evaluate(el => el.addEventListener('click', () => { (window as Window & { preNavigationY?: number }).preNavigationY = scrollY; }, { once: true }));
    await card.click();
    const y = await page.evaluate(() => (window as Window & { preNavigationY?: number }).preNavigationY!);
    await expect(page).toHaveURL(`/work/${p.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.title);
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
    await expect(page).toHaveTitle(`${p.title} — Trung Hau / HEW`);
    await page.waitForTimeout(500);
    await page.goBack();
    await expect(card).toBeFocused();
    expect(Math.abs((await page.evaluate(() => scrollY)) - y)).toBeLessThan(5);
    await page.goForward();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.title);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.title);
    await page.getByRole('link', { name: 'Back to work', exact: true }).click();
    await expect(page).toHaveURL(/\/$|\/#work$/);
  });
}

test('direct links and unknown slugs have a working route home', async ({ page }) => {
  await page.goto('/work/music-videos');
  await page.getByRole('link', { name: 'Back to work', exact: true }).click();
  await expect(page).toHaveURL('/#work');
  await expect(page.locator('#work')).toBeFocused();
  await page.goto('/work/unknown');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('This page isn’t');
  await page.getByRole('link', { name: 'Back to work' }).click();
  await expect(page.locator('.project-card')).toHaveCount(6);
});

test('rapid project clicks keep the final route and return directly to work', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.evaluate(() => {
    const film = document.getElementById('project-chuyen-di-bat-y')!;
    const commercial = document.getElementById('project-tcv-rebrand')!;
    film.click(); commercial.click();
  });
  await expect(page).toHaveURL('/work/tcv-rebrand');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('TVC TCV REBRAND');
  await page.getByRole('link', { name: 'Back to work', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('.project-card')).toHaveCount(6);
});

test('retouch supports tap, keyboard, hold/release and cancellation', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('.compare-controls button');
  const label = page.locator('.compare-label');
  await button.scrollIntoViewIfNeeded();
  await expect(label).toHaveText('Edited');
  await button.click(); await expect(label).toHaveText('Original');
  await button.press('Enter'); await expect(label).toHaveText('Edited');
  await button.press('Space'); await expect(label).toHaveText('Original');
  await button.press('Enter'); await expect(label).toHaveText('Edited');
  await page.evaluate(() => document.querySelector('.compare-controls button')?.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await button.hover();
  await page.waitForTimeout(500);
  const bounds = (await button.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down(); await page.waitForTimeout(510); await expect(label).toHaveText('Original');
  await page.mouse.up(); await expect(label).toHaveText('Edited');
  await page.mouse.down(); await page.waitForTimeout(510);
  await button.dispatchEvent('pointercancel'); await expect(label).toHaveText('Edited'); await page.mouse.up();
  await page.mouse.move(bounds.x + 10, bounds.y + 10); await page.mouse.down(); await page.waitForTimeout(510);
  await page.mouse.move(0, 0); await expect(label).toHaveText('Edited'); await page.mouse.up();
  await button.focus(); await page.keyboard.down('Space'); await page.waitForTimeout(510); await expect(label).toHaveText('Original');
  await page.keyboard.up('Space'); await expect(label).toHaveText('Edited');
  await page.keyboard.down('Space'); await page.waitForTimeout(510); await expect(label).toHaveText('Original');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(label).toHaveText('Edited'); await page.keyboard.up('Space');
  await button.hover(); await page.mouse.down(); await page.waitForTimeout(510); await expect(label).toHaveText('Original');
  await page.evaluate(() => scrollBy({ top: 30, behavior: 'instant' }));
  await expect(label).toHaveText('Edited'); await page.mouse.up();
});

test('touch comparison toggles and the page can scroll', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  const button = page.locator('.compare-controls button');
  await button.scrollIntoViewIfNeeded();
  await button.tap(); await expect(page.locator('.compare-label')).toHaveText('Original');
  await button.tap(); await expect(page.locator('.compare-label')).toHaveText('Edited');
  await page.evaluate(() => window.scrollBy(0, 200));
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(200);
  await context.close();
});

test('mobile menu handles focus, Escape and section navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.getByRole('link', { name: 'Work', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menu' })).toBeFocused();
  await expect(page.locator('#main-nav')).not.toBeVisible();
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('link', { name: 'About', exact: true }).click();
  await expect(page.locator('#about')).toBeFocused();
  await expect(page.locator('#main-nav')).not.toBeVisible();
});

test('reduced motion keeps sections and route actions available', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#project-chuyen-di-bat-y').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Chuyến Đi Bất Ý');
  expect(await page.locator('main').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.getByRole('link', { name: 'Back to work', exact: true }).click();
  await page.locator('#contact').scrollIntoViewIfNeeded();
  expect(await page.locator('#contact [data-reveal]').evaluate(el => getComputedStyle(el).opacity)).toBe('1');
});

test('broken media falls back without losing navigation', async ({ page }) => {
  await page.route('**/media/work/tcv-rebrand/cover*.webp', route => route.abort());
  await page.goto('/');
  const card = page.locator('#project-tcv-rebrand');
  await card.scrollIntoViewIfNeeded();
  await expect(card.locator('.media-fallback')).toBeVisible();
  await card.click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('TVC TCV REBRAND');
});

test('homepage and representative case pass automated accessibility rules', async ({ page }) => {
  const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
  for (const url of ['/', '/work/chuyen-di-bat-y']) {
    await page.goto(url);
    await page.evaluate(async () => {
      for (const el of document.querySelectorAll('[data-reveal]')) {
        el.scrollIntoView({ behavior: 'instant' });
        await new Promise(resolve => setTimeout(resolve, 40));
      }
      scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.waitForTimeout(550);
    await page.addScriptTag({ content: axe });
    const result = await page.evaluate(async () => {
      // @ts-expect-error injected axe global
      return window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
    });
    expect(result.violations.map((v: { id: string; nodes: { target: string[] }[] }) => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
  }
});

test('scroll frame opens while text and native scrolling remain stable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 650 });
  await page.goto('/');
  const frame = page.locator('.hero-frame');
  const text = page.locator('.hero-description');
  await expect(frame).toBeVisible();
  const before = await text.boundingBox();
  const scaleBefore = await frame.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).a);
  await page.evaluate(() => scrollTo({ top: 200, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(200);
  await page.waitForTimeout(150);
  const after = await text.boundingBox();
  expect(after?.x).toBe(before?.x);
  expect(after?.width).toBe(before?.width);
  if (await page.evaluate(() => CSS.supports('animation-timeline: view()'))) {
    expect(await frame.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).a)).toBeGreaterThan(scaleBefore);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await frame.evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  expect(await frame.evaluate(el => getComputedStyle(el).clipPath)).toBe('none');
  await expect(page.getByRole('link', { name: 'Explore selected work' })).toBeVisible();
});

test('PDF images load, the retouch pair is real and the film poster has no additional crop', async ({ page }) => {
  await page.goto('/');
  for (const image of await page.locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((img: HTMLImageElement) => img.decode());
  }
  await expect(page.locator('.media-fallback')).toHaveCount(0);
  await expect(page.locator('.hero .media-placeholder, .retouch .placeholder-note')).toHaveCount(0);
  const pair = page.locator('.compare-frame img');
  await expect(pair).toHaveCount(2);
  const ratios = await pair.evaluateAll(imgs => imgs.map(img => Number(img.getAttribute('width')) / Number(img.getAttribute('height'))));
  expect(ratios[0]).toBe(ratios[1]);
  await expect(page.locator('#media-retouch-original img')).toHaveAttribute('src', '/media/portraits-retouch/original.webp');
  await expect(page.locator('#media-retouch-edited img')).toHaveAttribute('src', '/media/portraits-retouch/edited.webp');
  await page.goto('/work/chuyen-di-bat-y');
  const poster = page.locator('#media-film-cover img');
  await poster.evaluate((img: HTMLImageElement) => img.decode());
  expect(await poster.evaluate(img => getComputedStyle(img).objectFit)).toBe('contain');
  await expect(page.locator('.case-intro .media-placeholder')).toHaveCount(0);
  await expect(page.locator('video, source, iframe')).toHaveCount(0);
});
