import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

// Run only after building the final implementation. This records observations;
// the focused browser tests are responsible for acceptance assertions.
const repository = process.env.PORTFOLIO_REPO || fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(join(repository, 'package.json'));
const { chromium } = require('@playwright/test');
const baseURL = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4180';
const output = resolve(process.env.REVIEW_MOTION_OUTPUT || join(repository, 'docs/motion-check.json'));
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
const viewports = [[1440, 900], [1536, 730], [1366, 650], [1093, 560], [390, 844], [320, 844]];
const report = {
  measuredAt: new Date().toISOString(), browser: browser.version(), commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repository, encoding: 'utf8' }).trim(), baseURL,
  method: 'Current production preview on Linux cloud; no CPU/network throttle; fresh context at each viewport, DPR1, OS no-preference, session intro skipped. Below768px uses Chromium mobile/touch emulation. Measured computed transforms and geometry after actual native scrolling and preference changes. Preference uses the existing switch click handler; on mobile HTMLElement.click avoids opening an overlay over the reading anchor. These are lab observations, not physical-device/FPS/INP measurements.',
  viewports: [],
};
function save() { mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, JSON.stringify(report, null, 2) + '\n'); }
async function geometry(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const header = document.querySelector('.site-header').getBoundingClientRect();
    const style = getComputedStyle(root);
    const topGap = parseFloat(style.getPropertyValue('--stack-top-gap'));
    const bottomGap = parseFloat(style.getPropertyValue('--stack-bottom-gap'));
    const fitSafetyMarginPx = 16;
    return {
      width: innerWidth, height: innerHeight, scrollY, scrollHeight: root.scrollHeight,
      overflowPx: Math.max(0, root.scrollWidth - innerWidth), motion: root.dataset.motion, stack: root.dataset.stack, pointer: root.dataset.pointer,
      header: { top: header.top, bottom: header.bottom, height: header.height }, topGap, bottomGap, fitSafetyMarginPx,
      measuredStackTopPx: parseFloat(style.getPropertyValue('--stack-top')) || null,
      calculatedAvailableHeight: innerHeight - header.height - topGap - bottomGap - fitSafetyMarginPx,
      cards: [...document.querySelectorAll('.project-card')].map(card => {
        const surface = card.querySelector('.project-surface');
        const link = card.querySelector('.project-link');
        const title = card.querySelector('h3');
        const cardRect = card.getBoundingClientRect(), surfaceRect = surface.getBoundingClientRect(), titleRect = title.getBoundingClientRect();
        const transform = getComputedStyle(surface).transform;
        const matrix = new DOMMatrix(transform);
        return { id: link.id, title: title.textContent, position: getComputedStyle(card).position, cssTop: getComputedStyle(card).top,
          cardTop: cardRect.top, cardBottom: cardRect.bottom, surfaceTop: surfaceRect.top, surfaceBottom: surfaceRect.bottom,
          naturalSurfaceHeight: surface.offsetHeight, surfaceRenderedHeight: surfaceRect.height, naturalLinkHeight: link.offsetHeight,
          fitsAvailableHeight: surface.offsetHeight + header.height + topGap + bottomGap + fitSafetyMarginPx <= innerHeight,
          transform, scaleX: matrix.a, scaleY: matrix.d, translateX: matrix.e, translateY: matrix.f,
          stackDepth: surface.style.getPropertyValue('--stack-depth'), titleTop: titleRect.top, titleBottom: titleRect.bottom,
          titleOverflowX: title.scrollWidth - title.clientWidth, titleOverflowY: title.scrollHeight - title.clientHeight,
        };
      }),
    };
  });
}
async function titleSnapshot(page, index) {
  return page.locator('.project-card').nth(index).evaluate(card => {
    const title = card.querySelector('h3');
    const rect = title.getBoundingClientRect();
    const surface = card.querySelector('.project-surface');
    const point = document.elementFromPoint(rect.left + Math.min(20, rect.width / 2), rect.top + rect.height / 2);
    return { scrollY, stack: document.documentElement.dataset.stack, title: title.textContent, titleTop: rect.top, titleBottom: rect.bottom,
      readableAtSamplePoint: title.contains(point), cardPosition: getComputedStyle(card).position, cardTop: card.getBoundingClientRect().top,
      surfaceHeight: surface.offsetHeight, surfaceTransform: getComputedStyle(surface).transform,
      runningAnimations: document.getAnimations().filter(animation => animation.playState === 'running').length,
      overflowPx: Math.max(0, document.documentElement.scrollWidth - innerWidth),
    };
  });
}
try {
  for (const [width, height] of viewports) {
    const mobile = width < 768;
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, reducedMotion: 'no-preference' });
    await context.addInitScript(() => {
      sessionStorage.setItem('hew-intro-seen', '1');
      window.motionInspectionFrames = 0;
      const request = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = callback => { window.motionInspectionFrames++; return request(callback); };
    });
    const page = await context.newPage();
    const errors = [], failedRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => failedRequests.push({ url: request.url(), failure: request.failure() }));
    await page.goto(baseURL);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => !document.querySelector('.intro-screen'));
    await page.waitForTimeout(1100);
    const initial = await geometry(page);
    let navHover = { applicable: false, reason: 'Touch/mobile viewport: no hover interaction.' };
    if (!mobile) {
      const nav = page.getByRole('link', { name: 'Work', exact: true });
      const text = nav.locator('.nav-label > span');
      const read = () => text.evaluate(element => { const transform = getComputedStyle(element).transform; const matrix = new DOMMatrix(transform); return { transform, translateY: matrix.f }; });
      const before = await read();
      await nav.hover(); await page.waitForTimeout(450);
      const after = await read();
      navHover = { applicable: true, before, after, translateDelta: after.translateY - before.translateY };
      await page.mouse.move(0, 0); await page.waitForTimeout(450);
    }
    const heroTransforms = [];
    for (const y of [0, 240]) {
      await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
      await page.waitForTimeout(120);
      heroTransforms.push(await page.locator('.hero-frame img').evaluate(image => ({ scrollY, transform: getComputedStyle(image).transform, animationName: getComputedStyle(image).animationName })));
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(100);
    const secondNaturalTop = await page.locator('.project-card').nth(1).evaluate(card => card.getBoundingClientRect().top + scrollY);
    const stackScroll = [];
    for (const fraction of [.8, .55, .3]) {
      const targetY = secondNaturalTop - height * fraction;
      await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), targetY);
      await page.waitForTimeout(180);
      stackScroll.push({ requestedY: targetY, ...(await geometry(page)) });
    }
    const readingTargetY = secondNaturalTop - initial.header.height - initial.topGap + (initial.stack === 'true' ? 120 : 0);
    await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), readingTargetY);
    await page.waitForTimeout(1100);
    const full = await titleSnapshot(page, 1);
    await page.getByRole('switch', { name: 'Reduce motion', includeHidden: true }).evaluate(button => button.click());
    const reducedImmediate = await titleSnapshot(page, 1);
    await page.waitForTimeout(250);
    const reduced = await titleSnapshot(page, 1);
    const reducedGeometry = await geometry(page);
    await page.getByRole('switch', { name: 'Reduce motion', includeHidden: true }).evaluate(button => button.click());
    await page.waitForTimeout(1100);
    const restored = await titleSnapshot(page, 1);
    await page.evaluate(() => { window.motionInspectionFrames = 0; });
    await page.waitForTimeout(400);
    const idleAnimationFrameRequests = await page.evaluate(() => window.motionInspectionFrames);
    report.viewports.push({ width, height, mobile, initial, navHover, heroTransforms, stackScroll,
      readingAnchor: { full, reducedImmediate, reduced, restored, reducedTitleDeltaPx: reduced.titleTop - full.titleTop, restoredTitleDeltaPx: restored.titleTop - full.titleTop },
      reducedGeometry, idleAnimationFrameRequests, errors, failedRequests,
    });
    save();
    console.log(`${width}x${height}: stack=${initial.stack}; max surface=${Math.max(...initial.cards.map(card => card.naturalSurfaceHeight))}; reading deltas=${(reduced.titleTop - full.titleTop).toFixed(3)}/${(restored.titleTop - full.titleTop).toFixed(3)}px; overflow=${initial.overflowPx}; idle RAF=${idleAnimationFrameRequests}; errors=${errors.length}`);
    await context.close();
  }
  report.completedAt = new Date().toISOString();
  save();
  console.log(`Saved current measured motion evidence to ${output}`);
} finally { await browser.close(); }
