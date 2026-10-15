import { test, expect } from '@playwright/test';
import { dismissIntro } from './support/dismiss-intro';

test('film banner previews on hover; the single trailer player loads in view and pauses offscreen',async({page})=>{
  await dismissIntro(page);const requests:string[]=[];page.on('request',r=>{if(r.url().endsWith('.mp4'))requests.push(r.url());});
  await page.goto('/');await page.mouse.move(0,0);
  await expect(page.locator('video')).toHaveCount(0);expect(requests).toEqual([]);
  const image=page.locator('.card-0 .card-image');
  await image.hover();await expect(page.locator('.card-0 video')).toHaveCount(1);
  await expect.poll(()=>page.locator('.card-0 video').evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.1);
  expect(requests.every(url=>url.endsWith('/preview.mp4'))).toBe(true);
  await page.mouse.move(0,0);await expect(page.locator('video')).toHaveCount(0);
  await page.goto('/work/chuyen-di-bat-y');
  const overview=page.locator('.case-text-block').first(),trailer=page.locator('.film-trailer');
  expect(await overview.evaluate((el,next)=>!!(el.compareDocumentPosition(document.querySelector(next)!)&Node.DOCUMENT_POSITION_FOLLOWING),'.film-trailer')).toBe(true);
  await expect(trailer.getByRole('button',{name:'Play trailer'})).toHaveCount(0);
  await expect(trailer.locator('video')).toHaveAttribute('controls','');
  await expect(trailer.locator('video')).not.toHaveAttribute('src',/trailer\.mp4/);
  await trailer.scrollIntoViewIfNeeded();
  await expect.poll(()=>trailer.locator('video').evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.1);
  expect(requests.some(url=>url.endsWith('/trailer.mp4'))).toBe(true);
  await page.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'instant'}));
  await expect.poll(()=>trailer.locator('video').evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
  const time=await trailer.locator('video').evaluate((v:HTMLVideoElement)=>v.currentTime);
  await trailer.scrollIntoViewIfNeeded();
  await expect.poll(()=>trailer.locator('video').evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(time+.1);
});

test('trailer respects reduced motion and a manual pause on narrow screens',async({page})=>{
  await page.setViewportSize({width:320,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/work/chuyen-di-bat-y');
  const trailer=page.locator('.film-trailer video');
  await trailer.scrollIntoViewIfNeeded();
  await expect(trailer).toHaveAttribute('src',/trailer\.mp4/);
  expect(await trailer.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await expect.poll(()=>trailer.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.1);
  await trailer.evaluate((v:HTMLVideoElement)=>v.pause());
  await page.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'instant'}));
  await trailer.scrollIntoViewIfNeeded();
  await expect(trailer).toHaveJSProperty('paused',true);
});

for(const [width,height] of [[1440,900],[1366,650],[963,730]])test(`film album moves image-by-image with native wheel at ${width}×${height}`,async({page})=>{
  await page.setViewportSize({width,height});await page.goto('/work/chuyen-di-bat-y');
  const album=page.locator('.film-album');await expect(album).toHaveAttribute('data-pinned','true');
  await expect(album.locator('figure')).toHaveCount(12);
  const start=await album.evaluate(el=>el.getBoundingClientRect().top+scrollY-(document.querySelector('.site-header')!.getBoundingClientRect().height+20));
  await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),start);await page.waitForTimeout(100);
  const step=await album.evaluate(el=>(el.getBoundingClientRect().height-parseFloat(getComputedStyle(el).getPropertyValue('--album-height')))/11);
  const y0=await page.evaluate(()=>scrollY);
  await page.mouse.move(width/2,height/2);await page.mouse.wheel(0,Math.ceil(step));
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(y0+step-2);
  await expect.poll(()=>album.locator('.film-album-controls > span').textContent()).toBe('02 / 12');
  const centerOffset=await album.evaluate(el=>{const v=el.querySelector('.film-album-viewport')!.getBoundingClientRect(),f=el.querySelector('figure.is-active')!.getBoundingClientRect();return Math.abs(f.left+f.width/2-v.left-v.width/2);});
  expect(centerOffset).toBeLessThan(4);
  await expect.poll(()=>album.locator('figure.is-active .media-frame').evaluate(el=>getComputedStyle(el).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
  expect(await album.locator('.film-album-viewport').evaluate(el=>getComputedStyle(el).scrollbarWidth)).toBe('none');
  await page.mouse.wheel(0,-Math.ceil(step));
  await expect.poll(()=>album.locator('.film-album-controls > span').textContent()).toBe('01 / 12');
  await album.getByRole('button',{name:'Next image'}).click();
  await expect.poll(()=>album.locator('.film-album-controls > span').textContent()).toBe('02 / 12');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(album).toHaveAttribute('data-pinned','false');
  expect(await album.locator('.film-album-viewport').evaluate(el=>el.scrollLeft)).toBeGreaterThan(100);
  const headerBottom=await page.locator('.site-header').evaluate(el=>el.getBoundingClientRect().bottom);
  const panel=await album.locator('.film-album-stage').boundingBox();expect(panel!.y).toBeGreaterThanOrEqual(headerBottom-1);expect(panel!.y).toBeLessThan(headerBottom+30);
});

for(const [width,height] of [[390,844],[320,844],[1093,560]])test(`album native fallback preserves all images at ${width}×${height}`,async({page})=>{
  await page.setViewportSize({width,height});await page.goto('/work/chuyen-di-bat-y');
  const album=page.locator('.film-album');await expect(album).toHaveAttribute('data-pinned','false');
  await album.getByRole('button',{name:'Next image'}).scrollIntoViewIfNeeded();
  await album.getByRole('button',{name:'Next image'}).click();
  await expect.poll(()=>album.locator('.film-album-controls > span').textContent()).toBe('02 / 12');
  await expect(album.locator('figure')).toHaveCount(12);
  expect(await album.locator('img').evaluateAll(nodes=>nodes.every(img=>getComputedStyle(img).objectFit==='contain'))).toBe(true);
  expect(await album.locator('.film-album-viewport').evaluate(el=>getComputedStyle(el).scrollbarWidth)).toBe('none');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await album.evaluate(el=>el.style.height)).toBe('');
});

test('album keyboard access reaches the last image and API failure keeps native browsing',async({page})=>{
  await page.goto('/work/chuyen-di-bat-y');const album=page.locator('.film-album');
  const last=album.locator('figure a').last();await last.focus();await expect(last).toBeFocused();
  await expect.poll(()=>album.locator('.film-album-controls > span').textContent()).toBe('12 / 12');
  expect(await last.evaluate(el=>{const r=el.getBoundingClientRect();return r.left<innerWidth&&r.right>0;})).toBe(true);
  await page.addInitScript(()=>Object.defineProperty(window,'ResizeObserver',{configurable:true,value:class {constructor(){throw Error('Unavailable');}}}));
  await page.reload();await expect(page.locator('.film-album')).toHaveAttribute('data-pinned','false');
  await page.setViewportSize({width:1440,height:900});await expect(page.locator('.film-album')).toHaveAttribute('data-pinned','false');
});
