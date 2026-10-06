import { useEffect, useRef } from 'react';
import settings from '../config/motion.json';
import { useReducedMotion } from './preference';

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const set = (node: HTMLElement | null, name: string, value: string) => {
  if (node && node.style.getPropertyValue(name) !== value) node.style.setProperty(name, value);
};
export function usePageMotion(routeKey: string, introActive: boolean) {
  const reduced = useReducedMotion();
  const previousReduced = useRef(reduced);
  useEffect(() => {
    const resuming = previousReduced.current && !reduced;
    previousReduced.current = reduced;
    const root = document.documentElement;
    const desktop = matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    const pointer = matchMedia('(hover: hover) and (pointer: fine)');
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.project-card'));
    const surfaces = cards.map(card => card.querySelector<HTMLElement>('.project-surface')!);
    const drifts = Array.from(document.querySelectorAll<HTMLElement>('[data-drift]'));
    const readings = Array.from(document.querySelectorAll<HTMLElement>('[data-reading]'));
    const approach = document.querySelector<HTMLElement>('.approach-grid');
    let frame = 0, pointerFrame = 0, stack = false, measure = true;
    root.dataset.stack = 'false';
    root.dataset.pointer = String(!reduced && settings.pointerFollow && pointer.matches);
    root.style.setProperty('--reveal-duration', `${settings.revealDurationMs}ms`);
    if (reduced) {
      surfaces.forEach(surface => surface.style.removeProperty('--stack-depth'));
      drifts.forEach(node => node.style.removeProperty('--drift'));
      readings.forEach(node => node.style.removeProperty('--reading'));
      root.style.removeProperty('--page-progress');
      return; // No motion scroll/pointer listeners or animation frames in reduced mode.
    }
    function paint() {
      frame = 0;
      if (introActive || document.hidden) return;
      const height = innerHeight;
      // Measure untransformed boxes. An unusually long project or large text gets normal flow.
      // Both layouts have identical dimensions, so ResizeObserver cannot toggle them in a loop.
      if (measure) {
        stack = settings.stackProjects && desktop.matches && cards.length > 1 && surfaces.every(surface => surface.offsetHeight + 124 <= height);
        root.dataset.stack = String(stack);
        root.dataset.pointer = String(settings.pointerFollow && pointer.matches);
        measure = false;
      }
      const length = document.documentElement.scrollHeight - height;
      const rectangles = cards.map(card => card.getBoundingClientRect());
      const driftTops = drifts.map(node => node.getBoundingClientRect().top);
      const readingRects = readings.map(node => node.getBoundingClientRect());
      const approachTop = approach?.getBoundingClientRect().top ?? height;
      // All geometry reads precede writes; work is coalesced to at most one frame per event.
      set(root, '--page-progress', String(length > 0 ? scrollY / length : 0));
      set(approach, '--assembly', String(clamp((height * .9 - approachTop) / (height * .65))));
      drifts.forEach((node, index) => set(node, '--drift', settings.sectionDrift ? `${((clamp((height - driftTops[index]) / height) - .5) * (desktop.matches ? -96 : -24)).toFixed(2)}px` : '0px'));
      readings.forEach((node, index) => set(node, '--reading', String(clamp((height * .85 - readingRects[index].top) / (height * .5)))));
      surfaces.forEach((surface, index) => {
        const next = rectangles[index + 1];
        const depth = stack && next ? clamp((height * .75 - next.top) / Math.max(1, height * .75 - 104)) : 0;
        set(surface, '--stack-depth', depth.toFixed(4));
      });
    }
    function schedule() { if (!frame && !introActive && !document.hidden) frame = requestAnimationFrame(paint); }
    function resize() { measure = true; schedule(); }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    // Reduced CSS keeps everything readable without marking unseen sections as visited.
    // When resuming, preserve the current reading position and reveal later sections normally.
    const alreadyInView = resuming ? nodes.filter(node => node.getBoundingClientRect().top < innerHeight) : [];
    alreadyInView.forEach(node => node.classList.add('revealed'));
    nodes.forEach(node => { node.classList.add('reveal-ready'); if (!introActive && !node.classList.contains('revealed')) observer.observe(node); });
    const sizeObserver = new ResizeObserver(resize);
    surfaces.forEach(surface => sizeObserver.observe(surface));
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
    schedule();
    desktop.addEventListener('change', resize);
    pointer.addEventListener('change', resize);
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', schedule);
    if (settings.pointerFollow) document.addEventListener('pointermove', move, { passive: true });
    return () => {
      observer.disconnect(); sizeObserver.disconnect();
      cancelAnimationFrame(frame); cancelAnimationFrame(pointerFrame);
      desktop.removeEventListener('change', resize); pointer.removeEventListener('change', resize);
      removeEventListener('scroll', schedule); removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', schedule); document.removeEventListener('pointermove', move);
    };
  }, [routeKey, introActive, reduced]);
}
