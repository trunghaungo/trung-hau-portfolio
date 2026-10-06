import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
const parse = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
test.use({ baseURL: 'http://127.0.0.1:5174' });


// Intro has its own first-visit tests; existing route/media checks start after it.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('hew-intro-seen', '1'));
});
async function fixture(page: Page, mode: 'demo' | 'live', hover = false) {
  const site = { ...parse('src/config/site.json'), mediaMode: mode, enableHoverPreview: hover };
  const media = parse('src/content/media.json');
  for (const id of ['film-cover', 'tcv-cover']) { media[id].previewSrc = '/test-preview.webm'; media[id].fullVideoSrc = '/test-full.webm'; }
  await page.route(/\/src\/config\/site\.json(?:\?.*)?$/, route => route.fulfill({ contentType: 'application/javascript', body: `export default ${JSON.stringify(site)}` }));
  await page.route(/\/src\/content\/media\.json(?:\?.*)?$/, route => route.fulfill({ contentType: 'application/javascript', body: `export default ${JSON.stringify(media)}` }));
  await page.route('**/test-*.webm', route => route.fulfill({ contentType: 'video/webm', body: readFileSync('tests/fixtures/playback.webm') }));
}

test('demo ignores configured preview and full video sources', async ({ page }) => {
  const videoRequests: string[] = [];
  page.on('request', r => { if (r.url().includes('test-') && r.url().endsWith('.webm')) videoRequests.push(r.url()); });
  await fixture(page, 'demo', true);
  await page.goto('/');
  await page.locator('#project-chuyen-di-bat-y').hover();
  await page.waitForTimeout(400);
  await expect(page.locator('video')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Preview video' })).toHaveCount(0);
  await page.locator('#project-chuyen-di-bat-y').click();
  await expect(page.locator('video')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Watch full video' })).toHaveCount(0);
  expect(videoRequests).toEqual([]);
});

test('live media loads on demand, plays and stops other previews', async ({ page }) => {
  await fixture(page, 'live');
  await page.goto('/');
  await expect(page.locator('video')).toHaveCount(0);
  await page.locator('.card-0').getByRole('button', { name: 'Preview video' }).click();
  await expect(page.locator('video')).toHaveCount(1);
  await expect.poll(() => page.locator('video').evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0);
  expect(await page.locator('video').evaluate((v: HTMLVideoElement) => v.muted && v.playsInline)).toBe(true);
  await page.locator('.card-1').getByRole('button', { name: 'Preview video' }).click();
  await expect(page.locator('video')).toHaveCount(1);
  await expect(page.locator('.card-0 video')).toHaveCount(0);
  await page.locator('.card-1').getByRole('button', { name: 'Stop video' }).click();
  await expect(page.locator('video')).toHaveCount(0);
  await page.goto('/work/chuyen-di-bat-y');
  await expect(page.locator('video')).toHaveCount(0);
  await page.getByRole('button', { name: 'Watch full video' }).click();
  await expect(page.locator('video')).toHaveAttribute('controls', '');
  await expect.poll(() => page.locator('video').evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0);
});

test('hover preview stops on leave and reduced motion prevents auto playback', async ({ page }) => {
  await fixture(page, 'live', true);
  await page.goto('/');
  await page.locator('#project-chuyen-di-bat-y').hover();
  await expect(page.locator('.card-0 video')).toHaveCount(1);
  await page.mouse.move(0, 0);
  await expect(page.locator('video')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.locator('#project-chuyen-di-bat-y').hover();
  await page.waitForTimeout(350);
  await expect(page.locator('video')).toHaveCount(0);
  await page.locator('.card-0').getByRole('button', { name: 'Preview video' }).click();
  await expect(page.locator('video')).toHaveCount(1);
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.locator('video')).toHaveCount(0);
});

test('live playback errors retain poster and expose a file link', async ({ page }) => {
  await fixture(page, 'live');
  await page.route('**/test-full.webm', route => route.abort());
  await page.goto('/work/chuyen-di-bat-y');
  await page.getByRole('button', { name: 'Watch full video' }).click();
  await expect(page.getByRole('link', { name: 'Open the video file' })).toBeVisible();
  await expect(page.locator('.case-intro .media-frame img')).toBeVisible();
  await expect(page.locator('video')).toHaveCount(0);
});

test('JSON changes add, hide and reorder projects without layout changes', async ({ page }) => {
  const projects = parse('src/content/projects.json');
  projects[0].visible = false;
  projects[1].order = 10;
  projects.push({ slug: 'fixture-project', title: 'Fixture project', kind: 'Photography', visible: true, order: 0, summary: 'Test-only content', overview: 'Test-only overview', coverMediaId: 'site-cover', galleryMediaIds: [], contentLevel: 'showcase', contributions: ['Test contribution'], decisions: [{ title: 'Test decision', body: 'Test explanation' }] });
  await page.route(/\/src\/content\/projects\.json(?:\?.*)?$/, route => route.fulfill({ contentType: 'application/javascript', body: `export default ${JSON.stringify(projects)}` }));
  await page.goto('/');
  await expect(page.locator('.project-card')).toHaveCount(6);
  await expect(page.locator('.project-card').first()).toContainText('Fixture project');
  await expect(page.locator('#project-chuyen-di-bat-y')).toHaveCount(0);
  await page.locator('#project-fixture-project').click();
  await expect(page.getByRole('heading', { name: 'Fixture project', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'My contribution' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Decisions & process' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Selected frames' })).toHaveCount(0);
  await page.goto('/work/chuyen-di-bat-y');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('This page isn’t');
});

test('content settings can turn all motion off without hiding sections', async ({ page }) => {
  const site = { ...parse('src/config/site.json'), enableMotion: false };
  await page.route(/\/src\/config\/site\.json(?:\?.*)?$/, route => route.fulfill({ contentType: 'application/javascript', body: `export default ${JSON.stringify(site)}` }));
  await page.goto('/');
  expect(await page.locator('.hero-frame').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.locator('#contact').scrollIntoViewIfNeeded();
  expect(await page.locator('[data-reveal]').evaluateAll(els => els.every(el => getComputedStyle(el).opacity === '1'))).toBe(true);
  await page.locator('#project-chuyen-di-bat-y').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Chuyến Đi Bất Ý');
  await expect(page.locator('.award-description')).toContainText('Awarded to the film at the HUTECH Graduation Film Award');
});
