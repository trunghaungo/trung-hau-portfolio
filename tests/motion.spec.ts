import { dismissIntro } from './support/dismiss-intro';
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

async function skipSeenIntro(page: import('@playwright/test').Page) {
  await dismissIntro(page);
}

test('first visit introduces the name, releases the page and replays on every reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.intro-name')).toHaveText('TRUNGHAU');
  await expect(page.locator('.site-shell')).toHaveAttribute('inert', '');
  await expect(page.getByRole('button', { name: 'Skip intro' })).toBeVisible();
  await expect(page.locator('.intro-screen')).toHaveCount(0, { timeout: 4500 });
  await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  await page.reload();
  await expect(page.locator('.intro-screen')).toBeVisible();
  await expect(page.locator('.intro-screen')).toHaveCount(0, { timeout: 5000 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trung Hau / HEW');
});

test('intro can be skipped by keyboard and touch and supports explicit replay', async ({ page, browser }) => {
  await page.goto('/?intro=1');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Skip intro' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.intro-screen')).toHaveCount(0);
  await expect(page.locator('#hero-title')).toBeFocused();
  await page.goto('/?intro=1');
  await expect(page.locator('.intro-screen')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.intro-screen')).toHaveCount(0);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobile = await context.newPage();
  await mobile.goto('http://127.0.0.1:4173/');
  await mobile.getByRole('button', { name: 'Skip intro' }).tap();
  await expect(mobile.locator('.intro-screen')).toHaveCount(0);
  await mobile.getByRole('button', { name: 'Menu' }).tap();
  await expect(mobile.getByRole('link', { name: 'Work', exact: true })).toBeVisible();
  await context.close();
});

test('reduced motion and deep links bypass intro, including a preference change mid-intro', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?intro=1');
  await expect(page.locator('.intro-screen')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?intro=1');
  await expect(page.locator('.intro-screen')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.intro-screen')).toHaveCount(0);
  await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?intro=1#work');
  await expect(page.locator('.intro-screen')).toHaveCount(0);
  await expect(page.locator('#work')).toBeFocused();
  await page.goto('/work/juno-hair?intro=1');
  await expect(page.locator('.intro-screen')).toHaveCount(0);
});

test('native project stack responds to scroll, allows all keyboard links and flattens on mobile', async ({ page }) => {
  await skipSeenIntro(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const cards = page.locator('.project-card');
  const nextTop = await cards.nth(1).evaluate(el => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(y => scrollTo({ top: y - 460, behavior: 'instant' }), nextTop);
  const measuredTop = await page.locator('.site-header').evaluate(el => Math.round(el.getBoundingClientRect().bottom + 24));
  await expect.poll(() => cards.first().evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(measuredTop);
  expect(Math.abs((await page.evaluate(() => scrollY)) - (nextTop - 460))).toBeLessThan(2);
  await expect.poll(() => cards.first().locator('.project-surface').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).a)).toBeLessThan(1);
  await page.keyboard.press('Tab');
  for (const link of await page.locator('.project-link').all()) {
    await link.focus();
    await expect(link).toBeFocused();
    expect(await link.evaluate(el => getComputedStyle(el.closest('.project-card')!).position)).toBe('relative');
    await link.scrollIntoViewIfNeeded();
    const visibleAtCenter = await link.evaluate(el => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, Math.max(130, Math.min(innerHeight - 20, r.y + r.height / 2)))); });
    expect(visibleAtCenter).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await cards.first().evaluate(el => getComputedStyle(el).position)).toBe('relative');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('project cards overlap and uncover again at a compact desktop viewport', async ({ page }) => {
  await skipSeenIntro(page);
  await page.setViewportSize({ width: 1026, height: 672 });
  await page.goto('/');
  const cards = page.locator('.project-card');
  await expect(page.locator('html')).toHaveAttribute('data-stack', 'true');
  const positions = await cards.evaluateAll(elements => elements.slice(0, 2).map(element => element.getBoundingClientRect().top + scrollY));
  const stickyTop = await page.locator('.site-header').evaluate(element => element.getBoundingClientRect().bottom + 24);
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), positions[1] - stickyTop - 100);
  await expect.poll(() => cards.first().evaluate(element => Math.round(element.getBoundingClientRect().top))).toBe(Math.round(stickyTop));
  expect(await cards.evaluateAll(elements => {
    const second = elements[1].getBoundingClientRect();
    return elements[1].contains(document.elementFromPoint(second.left + second.width / 2, second.top + 20));
  })).toBe(true);
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), positions[0] - stickyTop - 30);
  expect(await cards.nth(1).evaluate(element => element.getBoundingClientRect().top)).toBeGreaterThan(stickyTop + 100);
});

test('contact follows the pointer with a soft text mask and returns to white on leave', async ({ page }) => {
  await skipSeenIntro(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const contact = page.locator('#contact');
  const naturalTop = await contact.evaluate(element => element.getBoundingClientRect().top + scrollY);
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), naturalTop - 720);
  await expect.poll(() => contact.evaluate(element => Number(element.style.getPropertyValue('--contact-entry')))).toBeGreaterThan(.1);
  const enteringShift = await contact.locator('.container').evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m42);
  expect(enteringShift).toBeLessThan(-10);
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), naturalTop - 120);
  await expect.poll(() => contact.evaluate(element => Number(element.style.getPropertyValue('--contact-entry')))).toBeGreaterThan(.9);
  expect(await contact.locator('.container').evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m42)).toBeGreaterThan(enteringShift + 10);
  const title = page.locator('#contact-title');
  await expect(title).toHaveAttribute('aria-label', "Have something in mind? Let's make it happen.");
  const base = title.locator('.contact-title-layer').first();
  const accent = title.locator('.contact-title-layer--accent');
  const aligned = () => title.evaluate(element => {
    const [base, accent] = element.querySelectorAll('.contact-title-layer');
    const first = base.getBoundingClientRect(), second = accent.getBoundingClientRect();
    return Math.max(Math.abs(first.x - second.x), Math.abs(first.y - second.y), Math.abs(first.width - second.width), Math.abs(first.height - second.height));
  });
  expect(await aligned()).toBeLessThan(.5);
  await expect.poll(() => accent.evaluate(element => getComputedStyle(element).maskImage)).toContain('radial-gradient');
  await expect.poll(() => base.evaluate(element => getComputedStyle(element).maskImage)).toContain('radial-gradient');
  const first = (await base.locator('.contact-word').first().boundingBox())!;
  await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2);
  await expect(contact).toHaveAttribute('data-contact-hover', 'true');
  await expect.poll(() => title.evaluate(element => Number(getComputedStyle(element).getPropertyValue('--contact-reveal')))).toBe(1);
  const masks = await title.evaluate(element => {
    const [base, accent] = element.querySelectorAll('.contact-title-layer');
    return { base: getComputedStyle(base).maskImage, accent: getComputedStyle(accent).maskImage };
  });
  expect(masks.base).toContain('rgba(0, 0, 0, 0) 0%');
  expect(masks.accent).toContain('rgb(0, 0, 0) 0%');
  const firstY = await title.evaluate(element => parseFloat(element.style.getPropertyValue('--mouse-y')));
  const last = (await base.locator('.contact-title-line').last().locator('.contact-word').last().boundingBox())!;
  await page.mouse.move(last.x + last.width / 2, last.y + last.height / 2);
  await expect.poll(() => title.evaluate(element => parseFloat(element.style.getPropertyValue('--mouse-y')))).toBeGreaterThan(firstY + 40);
  expect(await aligned()).toBeLessThan(.5);
  await expect(contact.locator('.contact-image, .contact-arrow')).toHaveCount(0);
  await page.mouse.move(0, 0);
  await expect(contact).not.toHaveAttribute('data-contact-hover');
  await expect.poll(() => title.evaluate(element => Number(getComputedStyle(element).getPropertyValue('--contact-reveal')))).toBe(0);
  await page.getByRole('switch', { name: 'Reduce motion' }).click();
  await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2);
  await expect(contact).not.toHaveAttribute('data-contact-hover');
  await expect.poll(() => title.evaluate(element => Number(getComputedStyle(element).getPropertyValue('--contact-reveal')))).toBe(0);
  await expect(contact.locator('.container')).toHaveCSS('transform', 'none');
  await expect(contact.locator('.contact-email')).toHaveAttribute('href', /^mailto:/);
});

test('contact typography stays static on touch', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/#contact');
  const contact = page.locator('#contact');
  await contact.locator('#contact-title').tap();
  await expect(contact).not.toHaveAttribute('data-contact-hover');
  await expect.poll(() => contact.locator('#contact-title').evaluate(element => Number(getComputedStyle(element).getPropertyValue('--contact-reveal')))).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test('contact details show icon links with responsive social buttons', async ({ page, browser }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#contact');
  const contact = page.locator('#contact');
  const phone = contact.getByRole('link', { name: '+84 385 941 520' });
  await expect(phone).toHaveAttribute('href', 'tel:+84385941520');
  await expect(phone.locator('svg[aria-hidden="true"]')).toHaveCount(1);
  await expect(contact.locator('.contact-location')).toContainText('Ho Chi Minh City, Vietnam');
  await expect(contact.locator('.contact-location svg[aria-hidden="true"]')).toHaveCount(1);
  await expect(contact.locator('.contact-socials-label')).toHaveText('Follow');
  const behance = contact.getByRole('link', { name: 'Behance' });
  const instagram = contact.getByRole('link', { name: 'Instagram' });
  await expect(behance).toHaveAttribute('href', 'https://www.behance.net/trunghaungo');
  await expect(instagram).toHaveAttribute('href', 'https://www.instagram.com/dainty.hew/');
  await expect(contact.locator('.contact-social-link svg[aria-hidden="true"]')).toHaveCount(2);
  await expect(contact.locator('.contact-info > *')).toHaveCount(2);
  await expect(contact.locator('.contact-info-label')).toHaveText('Email');
  await expect(contact.locator('.contact-details')).toHaveCount(0);
  const alignment = await contact.evaluate(element => {
    const label = element.querySelector('.contact-info-label')!.getBoundingClientRect();
    const email = element.querySelector('.contact-email')!.getBoundingClientRect();
    const phone = element.querySelector('.contact-phone')!.getBoundingClientRect();
    const location = element.querySelector('.contact-location')!.getBoundingClientRect();
    const follow = element.querySelector('.contact-socials-label')!.getBoundingClientRect();
    const socials = element.querySelector('.contact-socials')!.getBoundingClientRect();
    const container = element.querySelector('.container')!.getBoundingClientRect();
    return { labelFollowY: Math.abs(label.y - follow.y), labelEmailGap: email.y - label.bottom, emailPhoneGap: phone.y - email.bottom, phoneLocationGap: location.y - phone.bottom, leftAxis: Math.max(Math.abs(email.x - phone.x), Math.abs(email.x - location.x)), rightAxis: Math.abs(container.right - socials.right) };
  });
  expect(alignment.labelFollowY).toBeLessThan(2);
  expect(alignment.labelEmailGap).toBeGreaterThanOrEqual(8);
  expect(alignment.labelEmailGap).toBeLessThanOrEqual(12);
  expect(alignment.emailPhoneGap).toBeGreaterThanOrEqual(32);
  expect(alignment.emailPhoneGap).toBeLessThanOrEqual(40);
  expect(alignment.phoneLocationGap).toBeGreaterThanOrEqual(18);
  expect(alignment.phoneLocationGap).toBeLessThanOrEqual(28);
  expect(alignment.leftAxis).toBeLessThan(2);
  expect(alignment.rightAxis).toBeLessThan(2);
  await expect(page.locator('.site-footer')).toHaveCSS('border-top-style', 'solid');
  await expect(behance).toHaveCSS('border-radius', '50%');
  await behance.hover();
  await expect(behance).toHaveCSS('background-color', 'rgb(243, 240, 232)');
  await behance.focus();
  await expect(behance).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(instagram).toBeFocused();
  await expect(instagram).toHaveCSS('background-color', 'rgb(243, 240, 232)');
  await page.getByRole('switch', { name: 'Reduce motion' }).click();
  await expect(behance).toHaveCSS('transform', 'none');

  const mobile = await browser.newContext({ viewport: { width: 320, height: 844 }, hasTouch: true, isMobile: true });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto('http://127.0.0.1:4173/#contact');
  const location = mobilePage.locator('.contact-location');
  expect(['flex', 'inline-flex']).toContain(await location.evaluate(element => getComputedStyle(element).display));
  await expect(location).toHaveCSS('align-items', 'center');
  const order = await mobilePage.evaluate(() => ['.contact-email', '.contact-phone', '.contact-location', '.contact-socials'].map(selector => document.querySelector(selector)!.getBoundingClientRect().top));
  expect(order.every((top, index) => index === 0 || top > order[index - 1])).toBe(true);
  expect(await mobilePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(mobilePage.locator('.contact-social-link')).toHaveCount(2);
  await mobile.close();
  await page.getByRole('link', { name: 'Back to top' }).click();
  const headerHeight = await page.locator('.site-header').evaluate(element => element.getBoundingClientRect().height);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(headerHeight + 32);
  await expect(page.locator('#hero-title')).toBeVisible();
});

test('social links from content wrap without changing the contact layout', async ({ page }) => {
  const content = JSON.parse(readFileSync('src/content/profile.json', 'utf8'));
  content.contact.socials.push(
    { id: 'vimeo', name: 'Vimeo', icon: 'external', url: 'https://example.com/vimeo' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'external', url: 'https://example.com/linkedin' },
    { id: 'youtube', name: 'YouTube', icon: 'external', url: 'https://example.com/youtube' },
  );
  await page.route(/\/src\/content\/profile\.json(?:\?.*)?$/, route => route.fulfill({ contentType: 'application/javascript', body: `export default ${JSON.stringify(content)}` }));
  await page.setViewportSize({ width: 820, height: 780 });
  await page.goto('http://127.0.0.1:5174/#contact');
  await expect(page.locator('.contact-social-link')).toHaveCount(5);
  await expect(page.getByRole('link', { name: 'Vimeo' })).toHaveAttribute('href', 'https://example.com/vimeo');
  const desktop = await page.evaluate(() => {
    const email = document.querySelector('.contact-email')!.getBoundingClientRect();
    const socials = document.querySelector('.contact-socials')!.getBoundingClientRect();
    const container = document.querySelector('#contact > .container')!.getBoundingClientRect();
    const last = [...document.querySelectorAll('.contact-social-link')].at(-1)!.getBoundingClientRect();
    return { gap: socials.left - email.right, right: container.right - socials.right, lastRight: container.right - last.right };
  });
  expect(desktop.gap).toBeGreaterThan(16);
  expect(Math.abs(desktop.right)).toBeLessThan(2);
  expect(Math.abs(desktop.lastRight)).toBeLessThan(2);
  await page.setViewportSize({ width: 320, height: 844 });
  await expect(page.locator('.contact-social-link')).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('project pointer badge follows intent and reduced motion removes hover movement', async ({ page }) => {
  await skipSeenIntro(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const image = page.locator('.card-0 .card-image');
  await image.scrollIntoViewIfNeeded();
  const bounds = (await image.boundingBox())!;
  await page.mouse.move(bounds.x + 90, bounds.y + 90);
  const badge = image.locator('.open-project');
  await expect(badge).toHaveCSS('opacity', '1');
  const first = await badge.boundingBox();
  await page.mouse.move(bounds.x + 240, bounds.y + 150);
  await expect.poll(async () => (await badge.boundingBox())!.x).toBeGreaterThan(first!.x + 80);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'false');
  expect(await image.evaluate(el => getComputedStyle(el).transform)).toBe('none');
  expect(await image.locator('img').evaluate(el => getComputedStyle(el).transform)).toBe('none');
  await expect(page.locator('video, source, iframe')).toHaveCount(0);
});

test('first-visit intro passes automated accessibility rules and tolerates unavailable storage', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage unavailable'); };
    Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
  });
  await page.goto('/');
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  const violations = await page.evaluate(async () => {
    // @ts-expect-error injected axe global
    return (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map((v: { id: string }) => v.id);
  });
  expect(violations).toEqual([]);
  await expect(page.locator('.intro-screen')).toHaveCount(0, { timeout: 4500 });
  await page.getByRole('link', { name: 'Explore selected work' }).click();
  await expect(page.locator('#work')).toBeFocused();
});
