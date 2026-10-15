import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

test('five short films form a grid and play one at a time with sound after selection', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (/\/media\/work\/short-form\/reel-\d+\.mp4/.test(request.url())) requests.push(request.url()); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/work/short-form');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cuts & Stories');
  await expect(page.locator('.case-intro .section-label')).toContainText('Social & Branded Film');
  await expect(page.locator('.case-intro .media-frame img')).toHaveAttribute('src', '/media/work/short-form/cover-story.jpg');
  await expect(page.locator('.reel-card')).toHaveCount(5);
  await expect(page.locator('.long-video-card')).toHaveCount(3);
  await expect(page.getByRole('navigation', { name: 'On this page' }).getByRole('link')).toHaveCount(2);
  const layout = await page.locator('.short-long-showcase').evaluate(node => {
    const short = node.querySelector('.short-reels')!.getBoundingClientRect();
    const long = node.querySelector('.long-form-section')!.getBoundingClientRect();
    const cards = [...node.querySelectorAll('.reel-card')].map(card => card.getBoundingClientRect());
    return { shortWidth: short.width, longWidth: long.width, shortBottom: short.bottom, longTop: long.top, tops: cards.map(card => card.top), widths: cards.map(card => card.width) };
  });
  expect(Math.abs(layout.shortWidth - layout.longWidth)).toBeLessThan(1);
  expect(layout.longTop).toBeGreaterThan(layout.shortBottom);
  expect(Math.max(...layout.tops) - Math.min(...layout.tops)).toBeLessThan(1);
  expect(Math.max(...layout.widths) - Math.min(...layout.widths)).toBeLessThan(1);
  await expect(page.locator('.reel-dialog video')).toHaveCount(0);
  expect(requests).toEqual([]);

  const durations = [55.66, 39.34, 55.66, 62.67, 92.39];
  for (let index = 0; index < 5; index++) {
    const opener = page.getByRole('button', { name: `Play clip ${index + 1}` });
    await opener.click();
    const dialog = page.getByRole('dialog');
    const active = dialog.locator('video');
    await expect(dialog).toBeVisible();
    await expect.poll(() => active.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0);
    const state = await active.evaluate((video: HTMLVideoElement) => ({ duration: video.duration, muted: video.muted, volume: video.volume, paused: video.paused }));
    expect(state.duration).toBeGreaterThan(durations[index] - .2);
    expect(state.duration).toBeLessThan(durations[index] + .2);
    expect(state.muted).toBe(false);
    expect(state.volume).toBe(1);
    expect(state.paused).toBe(false);
    await expect(page.locator('video')).toHaveCount(1);
    await page.getByRole('button', { name: 'Close video' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
  }
  expect(new Set(requests.map(url => url.match(/reel-\d+\.mp4/)?.[0])).size).toBe(5);
});

test('mobile has two portrait columns and a usable full-size player', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/work/short-form');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const cards = page.locator('.reel-card');
    const boxes = await Promise.all([0, 1, 2, 4].map(index => cards.nth(index).boundingBox()));
    expect(boxes[0]!.y).toBeCloseTo(boxes[1]!.y, 0);
    expect(boxes[1]!.x).toBeGreaterThan(boxes[0]!.x);
    expect(boxes[2]!.y).toBeGreaterThan(boxes[0]!.y);
    expect(boxes[3]!.width).toBeCloseTo(boxes[0]!.width, 0);
    await page.getByRole('button', { name: 'Play clip 2' }).click();
    const dialog = page.getByRole('dialog');
    const video = dialog.locator('video');
    await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.currentTime)).toBeGreaterThan(0);
    expect(await video.evaluate((node: HTMLVideoElement) => node.muted)).toBe(false);
    const videoBox = await video.boundingBox();
    expect(videoBox!.width).toBeGreaterThan(width * .6);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Play clip 2' })).toBeFocused();
  }
});

test('long-form posters keep their order and open supplied YouTube links', async ({ page }) => {
  await page.goto('/work/short-form');
  const cards = page.locator('.long-video-card');
  const ids = ['r1qkZQHrKBU', 'QuF158p1TTg', 'RbAS5Uc8sNo'];
  await expect(cards).toHaveCount(3);
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(cards.getByText('Watch on YouTube')).toHaveCount(0);
  const boxes = await Promise.all([0, 1, 2].map(index => cards.nth(index).boundingBox()));
  expect(boxes[0]!.width / boxes[1]!.width).toBeGreaterThan(1.8);
  expect(boxes[1]!.x).toBeGreaterThan(boxes[0]!.x);
  expect(boxes[2]!.y).toBeGreaterThan(boxes[1]!.y);
  for (let index = 0; index < ids.length; index++) {
    const card = cards.nth(index);
    await expect(card.locator('h3')).toBeVisible();
    await expect(card.locator('a')).toHaveAttribute('href', `https://www.youtube.com/watch?v=${ids[index]}`);
  }
  await page.route('https://www.youtube.com/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Link test</title>' }));
  const [popup] = await Promise.all([page.waitForEvent('popup'), cards.first().locator('a').click()]);
  await expect(popup).toHaveURL('https://www.youtube.com/watch?v=r1qkZQHrKBU');
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('demo mode keeps posters and never mounts video', async ({ page }) => {
  const site = JSON.parse(readFileSync('src/config/site.json', 'utf8'));
  site.mediaMode = 'demo';
  await page.route(/\/src\/config\/site\.json(?:\?.*)?$/, route => route.fulfill({ contentType: 'application/javascript', body: `export default ${JSON.stringify(site)}` }));
  const requests: string[] = [];
  page.on('request', request => { if (/\.mp4(?:\?|$)|youtube-nocookie/.test(request.url())) requests.push(request.url()); });
  await page.goto('http://127.0.0.1:5174/work/short-form');
  await page.locator('.short-reels').scrollIntoViewIfNeeded();
  await page.locator('.long-form-section').scrollIntoViewIfNeeded();
  await expect(page.locator('video, source, iframe')).toHaveCount(0);
  await expect(page.locator('.reel-card img')).toHaveCount(5);
  await expect(page.locator('.reel-card-play')).toHaveCount(0);
  await expect(page.locator('.long-video-card a')).toHaveCount(3);
  expect(requests).toEqual([]);
});

test('a failed reel retains its poster and a direct file link', async ({ page }) => {
  await page.route('**/media/work/short-form/reel-01.mp4', route => route.abort());
  await page.goto('/work/short-form');
  await page.getByRole('button', { name: 'Play clip 1' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('status')).toContainText('Video could not play.');
  await expect(dialog.getByRole('link', { name: 'Open the video file' })).toHaveAttribute('href', '/media/work/short-form/reel-01.mp4');
  await expect(dialog.locator('img')).toBeVisible();
});

test('short and long sections pass automated accessibility checks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/short-form');
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  const result = await page.evaluate(async () => {
    // @ts-expect-error axe is injected by the test
    return window.axe.run(document.querySelector('.case-content'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
  });
  expect(result.violations.map((v: { id: string; nodes: { target: string[] }[] }) => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
});
