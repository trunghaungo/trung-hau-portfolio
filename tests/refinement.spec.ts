import { dismissIntro } from './support/dismiss-intro';
import { test, expect, type Locator, type Page } from '@playwright/test';

declare global {
  interface Window {
    refinement: {
      pushes: number;
      animationFrames: number;
      transitionStarted?: boolean;
      transitionSkipped?: boolean;
      releaseTransition?: () => void;
    };
  }
}

const motionSwitch = (page: Page) => page.getByRole('switch', { name: 'Reduce motion' });
const introSeen = (page: Page) => dismissIntro(page);

// Visibility assertions include ancestors: a heading's own opacity can be 1 while
// its reveal wrapper, word spans, or the complete application remain hidden.
async function readable(locator: Locator) {
  await expect(locator).toBeVisible();
  await expect.poll(() => locator.evaluate(element => {
    const visible = (node: Element) => {
      for (let current: Element | null = node; current; current = current.parentElement) {
        const style = getComputedStyle(current);
        if (Number(style.opacity) < .99 || style.visibility === 'hidden' || style.display === 'none') return false;
      }
      return true;
    };
    return visible(element) && [...element.querySelectorAll('.word-mask > span')].every(visible);
  })).toBe(true);
}

for (const api of ['IntersectionObserver', 'ResizeObserver'] as const) {
  for (const failure of ['missing', 'throwing'] as const) {
    test(`${api} ${failure} keeps content readable and project links in normal flow`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await introSeen(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.addInitScript(({ api, failure }) => {
        Object.defineProperty(window, api, {
          configurable: true,
          value: failure === 'missing' ? undefined : class { constructor() { throw new Error(`${api} unavailable`); } },
        });
      }, { api, failure });
      await page.goto('/');
      await readable(page.locator('#hero-title'));
      await expect(page.locator('html')).toHaveAttribute('data-stack', 'false');
      expect(await page.locator('.project-card').evaluateAll(cards => cards.every(card => getComputedStyle(card).position === 'relative'))).toBe(true);
      for (const selector of ['#work-title', '#about-title', '#contact-title']) {
        const heading = page.locator(selector);
        await heading.scrollIntoViewIfNeeded();
        await readable(heading);
      }
      const lastProject = page.locator('.project-link').last();
      await lastProject.scrollIntoViewIfNeeded();
      await readable(lastProject.locator('h3'));
      await lastProject.click();
      await expect(page).toHaveURL('/work/site-tour');
      await expect(page.locator('h1')).toBeFocused();
      expect(errors).toEqual([]);
    });
  }
}

for (const failure of ['missing animation API', 'throwing animation API', 'failed intro image'] as const) {
  test(`${failure} releases the intro promptly with immediately readable hero content`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    if (failure === 'failed intro image') {
      await page.route('**/media/profile/hero-2026*.webp', route => route.abort());
    } else {
      await page.addInitScript(failure => {
        Object.defineProperty(Element.prototype, 'animate', {
          configurable: true,
          value: failure === 'missing animation API' ? undefined : () => { throw new Error('Animation API unavailable'); },
        });
      }, failure);
    }
    await page.goto('/?intro=1');
    await expect(page.locator('.intro-screen')).toHaveCount(0, { timeout: 1200 });
    await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
    // Inspect immediately after overlay removal: no second word/reveal animation
    // should keep the actual identity hidden after the fallback has released it.
    const hero = await page.locator('.hero-identity').evaluate(element => {
      const nodes = [element, ...element.querySelectorAll('#hero-title, .hero-role, .word-mask > span')];
      return nodes.map(node => ({ opacity: Number(getComputedStyle(node).opacity), transform: getComputedStyle(node).transform }));
    });
    expect(hero.every(node => node.opacity >= .99 && node.transform === 'none')).toBe(true);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trung Hau / HEW');
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
    if (failure === 'failed intro image') await expect(page.locator('.hero-frame .media-fallback')).toBeVisible();
    await page.getByRole('link', { name: 'Explore selected work', exact: true }).click();
    await expect(page.locator('#work')).toBeFocused();
    expect(errors).toEqual([]);
  });
}

for (const callbackFirst of [false, true]) {
  test(`a throwing view transition ${callbackFirst ? 'after' : 'before'} its callback navigates and pushes history once`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await introSeen(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(callbackFirst => {
      window.refinement = { pushes: 0, animationFrames: 0 };
      const push = history.pushState.bind(history);
      history.pushState = (...args) => { window.refinement.pushes++; push(...args); };
      Object.defineProperty(document, 'startViewTransition', {
        configurable: true,
        value: (callback: () => void) => {
          if (callbackFirst) callback();
          throw new Error('View transitions unavailable');
        },
      });
    }, callbackFirst);
    await page.goto('/');
    const historyLength = await page.evaluate(() => history.length);
    await page.locator('#project-chuyen-di-bat-y').click();
    await expect(page).toHaveURL('/work/chuyen-di-bat-y');
    await expect(page.getByRole('heading', { level: 1, name: 'Chuyến Đi Bất Ý', exact: true })).toBeFocused();
    expect(await page.evaluate(() => ({ pushes: window.refinement.pushes, length: history.length }))).toEqual({ pushes: 1, length: historyLength + 1 });
    expect(await page.locator('[style*="project-cover"]').count()).toBeLessThanOrEqual(1);
    await page.goBack();
    await expect(page).toHaveURL('/');
    expect(errors).toEqual([]);
  });
}

test('reducing motion while a view transition callback is pending completes that route once', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await introSeen(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    window.refinement = { pushes: 0, animationFrames: 0 };
    const push = history.pushState.bind(history);
    history.pushState = (...args) => { window.refinement.pushes++; push(...args); };
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: (callback: () => void) => {
        window.refinement.transitionStarted = true;
        let complete!: () => void;
        const finished = new Promise<void>(resolve => { complete = resolve; });
        window.refinement.releaseTransition = () => { callback(); complete(); };
        return { ready: Promise.resolve(), updateCallbackDone: finished, finished, skipTransition: () => { window.refinement.transitionSkipped = true; } };
      },
    });
  });
  await page.goto('/');
  const historyLength = await page.evaluate(() => history.length);
  await page.locator('#project-tcv-rebrand').click();
  expect(await page.evaluate(() => window.refinement.transitionStarted)).toBe(true);
  await motionSwitch(page).click();
  await expect(motionSwitch(page)).toBeChecked();
  expect(await page.evaluate(() => window.refinement.transitionSkipped)).toBe(true);
  await page.evaluate(() => window.refinement.releaseTransition!());
  await expect(page).toHaveURL('/work/tcv-rebrand');
  await expect(page.getByRole('heading', { level: 1, name: 'TVC TCV REBRAND', exact: true })).toBeFocused();
  expect(await page.evaluate(() => ({ pushes: window.refinement.pushes, length: history.length }))).toEqual({ pushes: 1, length: historyLength + 1 });
  expect(errors).toEqual([]);
});

test('a truly sticky project preserves its visible title through full, reduced and full motion', async ({ page }) => {
  await introSeen(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-stack', 'true');
  const card = page.locator('.project-card').nth(1);
  const title = card.locator('h3');
  const target = await card.evaluate(element => {
    const header = document.querySelector('.site-header')!.getBoundingClientRect();
    return { naturalTop: element.getBoundingClientRect().top + scrollY, stickyTop: header.bottom + 24 };
  });
  await page.evaluate(({ naturalTop, stickyTop }) => scrollTo({ top: naturalTop - stickyTop + 100, behavior: 'instant' }), target);
  await readable(title);
  const pinnedTop = await card.evaluate(element => element.getBoundingClientRect().top);
  expect(Math.abs(pinnedTop - target.stickyTop)).toBeLessThan(2);
  await page.evaluate(() => scrollBy({ top: 40, behavior: 'instant' }));
  expect(Math.abs((await card.boundingBox())!.y - pinnedTop)).toBeLessThan(2);
  await page.waitForTimeout(1100);
  const anchorY = (await title.boundingBox())!.y;
  expect(await title.evaluate(element => { const rect = element.getBoundingClientRect(); return element.contains(document.elementFromPoint(rect.left + Math.min(20, rect.width / 2), rect.top + rect.height / 2)); })).toBe(true);
  const naturalHeights = await page.locator('.project-surface').evaluateAll(nodes => nodes.map(node => (node as HTMLElement).offsetHeight));
  for (const reduced of [true, false]) {
    // Locator.click may scroll the document before activating a sticky header
    // control. A pointer click at its visible center preserves the reading anchor.
    await expect(motionSwitch(page)).toBeInViewport();
    const switchBounds = (await motionSwitch(page).boundingBox())!;
    await page.mouse.click(switchBounds.x + switchBounds.width / 2, switchBounds.y + switchBounds.height / 2);
    await expect(motionSwitch(page)).toBeChecked({ checked: reduced });
    await expect(page.locator('html')).toHaveAttribute('data-stack', String(!reduced));
    await expect.poll(async () => Math.abs((await title.boundingBox())!.y - anchorY)).toBeLessThan(3);
    expect(await page.locator('.project-surface').evaluateAll(nodes => nodes.map(node => (node as HTMLElement).offsetHeight))).toEqual(naturalHeights);
    await readable(title);
  }
});

test('a long project title wraps without clipping and disables the stack until its natural height fits again', async ({ page }) => {
  await introSeen(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-stack', 'true');
  const card = page.locator('.project-card').first();
  const title = card.locator('h3');
  const original = await title.innerHTML();
  const originalHeight = await card.locator('.project-surface').evaluate(element => (element as HTMLElement).offsetHeight);
  await title.evaluate(element => { element.textContent = `${element.textContent} — A longer project title with additional words to describe the production`.repeat(12); });
  await expect(page.locator('html')).toHaveAttribute('data-stack', 'false');
  await expect(card).toHaveCSS('position', 'relative');
  const wrapped = await title.evaluate(element => {
    const title = element as HTMLElement;
    const bounds = title.getBoundingClientRect();
    const surfaceNode = title.closest('.project-surface')!;
    const surface = surfaceNode.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(title);
    const text = range.getBoundingClientRect();
    let clippedText = false;
    for (let node: Element | null = title; node; node = node.parentElement) {
      const style = getComputedStyle(node), rect = node.getBoundingClientRect();
      if (style.overflowY !== 'visible' && (text.top < rect.top - 1 || text.bottom > rect.bottom + 1)) clippedText = true;
      if (style.overflowX !== 'visible' && (text.left < rect.left - 1 || text.right > rect.right + 1)) clippedText = true;
      if (node === surfaceNode) break;
    }
    return { height: bounds.height, lineHeight: Number.parseFloat(getComputedStyle(title).lineHeight), clientWidth: title.clientWidth, scrollWidth: title.scrollWidth, textTop: text.top, textBottom: text.bottom, surfaceTop: surface.top, surfaceBottom: surface.bottom, clippedText };
  });
  expect(wrapped.height).toBeGreaterThan(wrapped.lineHeight * 2);
  expect(wrapped.clippedText).toBe(false);
  expect(wrapped.scrollWidth).toBeLessThanOrEqual(wrapped.clientWidth + 1);
  expect(wrapped.textTop).toBeGreaterThanOrEqual(wrapped.surfaceTop);
  expect(wrapped.textBottom).toBeLessThanOrEqual(wrapped.surfaceBottom);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await title.evaluate((element, markup) => { element.innerHTML = markup; }, original);
  await expect(page.locator('html')).toHaveAttribute('data-stack', 'true');
  expect(await card.locator('.project-surface').evaluate(element => (element as HTMLElement).offsetHeight)).toBe(originalHeight);
});

test('coarse tablet input never enables hero parallax or heading drift while scrolling', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  try {
    await dismissIntro(context);
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/');
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-stack', 'false');
    for (const y of [0, 320, 680]) {
      await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
      await page.waitForTimeout(80);
      await expect(page.locator('.hero-frame img')).toHaveCSS('transform', 'none');
      await expect(page.locator('[data-drift]').first()).toHaveCSS('transform', 'none');
    }
  } finally { await context.close(); }
});

test('motion work becomes idle without a recurring animation-frame loop in either preference', async ({ page }) => {
  await introSeen(page);
  await page.addInitScript(() => {
    window.refinement = { pushes: 0, animationFrames: 0 };
    const request = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => { window.refinement.animationFrames++; return request(callback); };
  });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#work').scrollIntoViewIfNeeded();
  for (const reduced of [false, true]) {
    if (reduced) await motionSwitch(page).click();
    await page.waitForTimeout(1300);
    await page.evaluate(() => { window.refinement.animationFrames = 0; });
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => window.refinement.animationFrames)).toBe(0);
  }
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`media reveal changes rendered clipping or opacity at ${viewport.width}px and reduced motion fully exposes every image`, async ({ page }) => {
    await introSeen(page);
    await page.setViewportSize(viewport);
    await page.goto('/');
    const media = page.locator('.card-image').nth(1);
    await expect(media).toHaveClass(/reveal-ready/);
    const samples = await media.evaluate(async element => {
      const read = () => {
        const style = getComputedStyle(element);
        const frame = element.querySelector('.media-frame')!;
        return { opacity: Number(style.opacity), clip: getComputedStyle(frame).clipPath };
      };
      const states = [read()];
      element.scrollIntoView({ block: 'center', behavior: 'instant' });
      const start = performance.now();
      while (performance.now() - start < 1200) {
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
        states.push(read());
      }
      return states;
    });
    const clipped = (clip: string) => clip !== 'none' && (clip.split('round')[0].match(/-?\d*\.?\d+/g) || []).some(value => Number(value) !== 0);
    expect(samples[0].opacity < 1 || clipped(samples[0].clip)).toBe(true);
    expect(new Set(samples.map(sample => `${sample.opacity}/${sample.clip}`)).size).toBeGreaterThan(2);
    expect(samples.at(-1)!.opacity).toBe(1);
    expect(clipped(samples.at(-1)!.clip)).toBe(false);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'false');
    expect(await page.locator('[data-reveal="media"]').evaluateAll(elements => elements.every(element => {
      const style = getComputedStyle(element);
      const frame = element.querySelector('.media-frame');
      return style.opacity === '1' && style.clipPath === 'none' && style.transform === 'none' && (!frame || getComputedStyle(frame).clipPath === 'none');
    }))).toBe(true);
  });
}

test('mobile source and visual order keep identity, image and CTA together and put film credits before its image and summary', async ({ page }) => {
  await introSeen(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const hero = await page.locator('.hero-stage').evaluate(element => {
    const identity = element.querySelector('.hero-identity')!;
    const image = element.querySelector('.hero-frame')!;
    const cta = element.querySelector('.hero-actions a')!;
    const rect = (node: Element) => { const bounds = node.getBoundingClientRect(); return { top: bounds.top, bottom: bounds.bottom, left: bounds.left, right: bounds.right }; };
    return { identity: rect(identity), image: rect(image), cta: rect(cta), identityBeforeImage: !!(identity.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_FOLLOWING), imageBeforeCta: !!(image.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING), width: innerWidth, height: innerHeight };
  });
  expect(hero.identityBeforeImage && hero.imageBeforeCta).toBe(true);
  expect(hero.identity.bottom).toBeLessThanOrEqual(hero.image.top);
  expect(hero.image.bottom).toBeLessThanOrEqual(hero.cta.top);
  expect(hero.cta.bottom).toBeLessThanOrEqual(hero.height);
  expect([hero.identity, hero.image, hero.cta].every(rect => rect.left >= 0 && rect.right <= hero.width)).toBe(true);
  await expect(page.getByRole('link', { name: 'Explore selected work', exact: true })).toBeInViewport();
  const film = page.locator('#project-chuyen-di-bat-y');
  await film.scrollIntoViewIfNeeded();
  await expect(film.locator('.card-credit')).toContainText('Director of Photography');
  await expect(film.locator('.recognition-tag')).toContainText('Best Cinematography · HUGFIA 2023');
  const order = await film.evaluate(element => {
    const credit = element.querySelector('.card-credit')!;
    const image = element.querySelector('.card-image')!;
    const summary = element.querySelector('.card-summary')!;
    return { creditBeforeImage: !!(credit.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_FOLLOWING), imageBeforeSummary: !!(image.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING), creditBottom: credit.getBoundingClientRect().bottom, imageTop: image.getBoundingClientRect().top, imageBottom: image.getBoundingClientRect().bottom, summaryTop: summary.getBoundingClientRect().top };
  });
  expect(order.creditBeforeImage && order.imageBeforeSummary).toBe(true);
  expect(order.creditBottom).toBeLessThanOrEqual(order.imageTop);
  expect(order.imageBottom).toBeLessThanOrEqual(order.summaryTop);
});
