import { useLayoutEffect, useRef } from 'react';
import settings from '../config/motion.json';
import { beforeMotionChange, useReducedMotion } from './preference';

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const set = (node: HTMLElement | null, name: string, value: string) => {
  if (node && node.style.getPropertyValue(name) !== value) node.style.setProperty(name, value);
};
type ReadingAnchor = { node: HTMLElement; top: number };

function readingAnchor(): ReadingAnchor | undefined {
  const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
  const candidates = Array.from(document.querySelectorAll<HTMLElement>('.project-heading h3, .card-credit, .card-summary, .project-open'));
  const visible = candidates.map(node => ({ node, rect: node.getBoundingClientRect() })).filter(({ node, rect }) => {
    if (rect.top < headerBottom || rect.bottom > innerHeight || !rect.width || !rect.height) return false;
    const hit = document.elementFromPoint(rect.left + Math.min(20, rect.width / 2), rect.top + rect.height / 2);
    return !!hit && node.contains(hit);
  }).sort((a, b) => a.rect.top - b.rect.top);
  return visible[0] && { node: visible[0].node, top: visible[0].rect.top };
}

function restoreAnchor(anchor?: ReadingAnchor) {
  if (!anchor?.node.isConnected) return;
  const delta = anchor.node.getBoundingClientRect().top - anchor.top;
  if (Math.abs(delta) > .5) window.scrollBy({ top: delta, behavior: 'instant' });
}

export function usePageMotion(routeKey: string, introActive: boolean) {
  const reduced = useReducedMotion();
  const previousReduced = useRef(reduced);
  const pendingAnchor = useRef<ReadingAnchor | undefined>(undefined);
  const resumePosition = useRef<{ anchor: ReadingAnchor; fullY: number; reducedY?: number } | undefined>(undefined);
  const pendingFullY = useRef<number | undefined>(undefined);
  useLayoutEffect(() => {
    const resuming = previousReduced.current && !reduced;
    previousReduced.current = reduced;
    const root = document.documentElement;
    const desktop = matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    const pointer = matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)');
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.project-card'));
    const surfaces = cards.map(card => card.querySelector<HTMLElement>('.project-surface')!);
    const drifts = Array.from(document.querySelectorAll<HTMLElement>('[data-drift]'));
    const readings = Array.from(document.querySelectorAll<HTMLElement>('[data-reading]'));
    const contact = document.querySelector<HTMLElement>('.contact-editorial');
    const header = document.querySelector<HTMLElement>('.site-header');
    let frame = 0, pointerFrame = 0, stack = false, measure = true, measured = false, disposed = false;
    let stickyTop = 0;
    let observer: IntersectionObserver | undefined, sizeObserver: ResizeObserver | undefined;
    const unsubscribe = beforeMotionChange(() => {
      const anchor = readingAnchor();
      pendingAnchor.current = anchor;
      if (!reduced) {
        resumePosition.current = anchor && root.dataset.stack === 'true' ? { anchor, fullY: scrollY } : undefined;
      } else {
        const saved = resumePosition.current;
        // Reversing the preference without further reading should restore the
        // exact scroll-driven transform, not approximate its transformed title.
        if (saved && anchor?.node === saved.anchor.node && Math.abs(anchor.top - saved.anchor.top) < 2 && Math.abs(scrollY - (saved.reducedY ?? -1)) < 2) pendingFullY.current = saved.fullY;
        resumePosition.current = undefined;
      }
    });
    const restorePending = () => { restoreAnchor(pendingAnchor.current); pendingAnchor.current = undefined; };
    const clearMotion = () => {
      root.dataset.stack = 'false'; root.dataset.pointer = 'false';
      surfaces.forEach(surface => surface.style.removeProperty('--stack-depth'));
      drifts.forEach(node => node.style.removeProperty('--drift'));
      readings.forEach(node => { node.style.removeProperty('--reading'); node.removeAttribute('data-reading-active'); });
      root.style.removeProperty('--page-progress');
      contact?.style.removeProperty('--contact-entry');
    };
    const expose = (node: HTMLElement) => { node.classList.remove('reveal-ready'); node.classList.add('revealed'); };
    root.style.setProperty('--reveal-duration', `${settings.revealDurationMs}ms`);
    if (reduced) {
      clearMotion(); restorePending();
      if (resumePosition.current) resumePosition.current.reducedY = scrollY;
      return unsubscribe; // No motion scroll/pointer listeners or animation frames.
    }

    function paint() {
      frame = 0;
      if (disposed || introActive || document.hidden) return;
      const viewport = window.visualViewport;
      const height = Math.min(innerHeight, viewport?.height ?? innerHeight);
      if (measure) {
        // Initial routing owns its scroll restoration. Only an explicit motion
        // preference change or a later remeasure may adjust that position.
        const anchor = pendingAnchor.current ?? (measured ? readingAnchor() : undefined);
        const style = getComputedStyle(root);
        const topGap = parseFloat(style.getPropertyValue('--stack-top-gap')) || 24;
        const bottomGap = parseFloat(style.getPropertyValue('--stack-bottom-gap')) || 16;
        const viewportTop = viewport?.offsetTop ?? 0;
        const headerBottom = Math.max(viewportTop, header?.getBoundingClientRect().bottom ?? viewportTop);
        stickyTop = headerBottom + topGap;
        const available = height - (headerBottom - viewportTop) - topGap - bottomGap - 16;
        stack = settings.stackProjects && desktop.matches && (viewport?.scale ?? 1) === 1 && cards.length > 1 && surfaces.every(surface => surface.offsetHeight <= available);
        const changed = root.dataset.stack !== String(stack) || root.style.getPropertyValue('--stack-top') !== `${stickyTop}px`;
        set(root, '--stack-top', `${stickyTop}px`);
        root.dataset.stack = String(stack);
        root.dataset.pointer = String(settings.pointerFollow && pointer.matches);
        if (stack && pendingFullY.current !== undefined) window.scrollTo({ top: pendingFullY.current, behavior: 'instant' });
        else if (changed || pendingAnchor.current) restoreAnchor(anchor);
        pendingFullY.current = undefined;
        pendingAnchor.current = undefined;
        measure = false; measured = true;
      }
      const length = document.documentElement.scrollHeight - innerHeight;
      const rectangles = cards.map(card => card.getBoundingClientRect());
      const driftTops = drifts.map(node => node.getBoundingClientRect().top);
      const readingRects = readings.map(node => node.getBoundingClientRect());
      const contactTop = contact?.getBoundingClientRect().top;
      // All progress reads precede writes. Events schedule at most one frame.
      set(root, '--page-progress', String(length > 0 ? scrollY / length : 0));
      if (contactTop !== undefined) set(contact, '--contact-entry', String(clamp((height - contactTop) / (height * .78)).toFixed(4)));
      drifts.forEach((node, index) => {
        if (settings.sectionDrift && desktop.matches) set(node, '--drift', `${((clamp((height - driftTops[index]) / height) - .5) * -48).toFixed(2)}px`);
        else node.style.removeProperty('--drift');
      });
      if (observer) readings.forEach((node, index) => {
        const rect = readingRects[index];
        // Complete the final word while the paragraph is still comfortably in view.
        const distance = height * .46 + Math.min(rect.height * .35, height * .18);
        set(node, '--reading', String(clamp((height * .88 - rect.top) / distance)));
        if (!node.hasAttribute('data-reading-active')) node.setAttribute('data-reading-active', '');
      });
      surfaces.forEach((surface, index) => {
        const next = rectangles[index + 1];
        const depth = stack && next ? clamp((height * .75 - next.top) / Math.max(1, height * .75 - stickyTop)) : 0;
        set(surface, '--stack-depth', depth.toFixed(4));
      });
    }
    function schedule() { if (!frame && !disposed && !introActive && !document.hidden) frame = requestAnimationFrame(paint); }
    function resize() { measure = true; schedule(); }

    // Geometry needs ResizeObserver to keep the stack safe when content grows.
    // Reveals are independent: if IntersectionObserver fails, show the content
    // immediately while retaining the native sticky cards.
    try {
      if (typeof ResizeObserver !== 'function') throw new Error('ResizeObserver unavailable');
      sizeObserver = new ResizeObserver(resize);
      surfaces.forEach(surface => sizeObserver!.observe(surface));
      if (header) sizeObserver.observe(header);
    } catch {
      sizeObserver?.disconnect();
      clearMotion(); nodes.forEach(expose); restorePending();
      return unsubscribe;
    }
    try {
      if (typeof IntersectionObserver !== 'function') throw new Error('IntersectionObserver unavailable');
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer?.unobserve(entry.target);
        }
      }, { threshold: .01, rootMargin: '0px 0px -15% 0px' });
      const inView = resuming ? nodes.filter(node => node.getBoundingClientRect().top < innerHeight) : [];
      inView.forEach(expose);
      nodes.forEach(node => {
        if (node.dataset.introSettled === 'true' || inView.includes(node)) { expose(node); return; }
        if (!introActive && !node.classList.contains('revealed')) observer!.observe(node);
      });
      nodes.forEach(node => {
        if (node.dataset.introSettled !== 'true' && !inView.includes(node)) node.classList.add('reveal-ready');
      });
    } catch {
      observer?.disconnect(); observer = undefined;
      nodes.forEach(expose);
    }
    function move(event: PointerEvent) {
      if (!settings.pointerFollow || !pointer.matches || event.pointerType !== 'mouse' || !(event.target instanceof Element)) return;
      const image = event.target.closest<HTMLElement>('.card-image');
      if (!image) return;
      cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        const rect = image.getBoundingClientRect();
        set(image, '--pointer-x', `${Math.max(48, Math.min(rect.width - 48, event.clientX - rect.left))}px`);
        set(image, '--pointer-y', `${Math.max(48, Math.min(rect.height - 48, event.clientY - rect.top))}px`);
        pointerFrame = 0;
      });
    }
    paint();
    desktop.addEventListener('change', resize); pointer.addEventListener('change', resize);
    addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', schedule);
    if (settings.pointerFollow) document.addEventListener('pointermove', move, { passive: true });
    void document.fonts?.ready.then(() => { if (!disposed) resize(); });
    return () => {
      disposed = true; unsubscribe(); observer?.disconnect(); sizeObserver?.disconnect();
      readings.forEach(node => { node.style.removeProperty('--reading'); node.removeAttribute('data-reading-active'); });
      cancelAnimationFrame(frame); cancelAnimationFrame(pointerFrame);
      desktop.removeEventListener('change', resize); pointer.removeEventListener('change', resize);
      removeEventListener('scroll', schedule); removeEventListener('resize', resize);
      window.visualViewport?.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', schedule); document.removeEventListener('pointermove', move);
    };
  }, [routeKey, introActive, reduced]);
}
