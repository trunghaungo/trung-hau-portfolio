import { useEffect } from 'react';
import { site } from '../content';
import settings from '../config/motion.json';

const clamp = (value: number) => Math.min(1, Math.max(0, value));
export function usePageMotion(routeKey: string, introActive: boolean) {
  useEffect(() => {
    const root = document.documentElement;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = matchMedia('(min-width: 1024px) and (min-height: 760px) and (hover: hover) and (pointer: fine)');
    const pointer = matchMedia('(hover: hover) and (pointer: fine)');
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.project-card'));
    const surfaces = cards.map(card => card.querySelector<HTMLElement>('.project-surface')!);
    const work = document.querySelector<HTMLElement>('.work-section');
    const approach = document.querySelector<HTMLElement>('.approach-grid');
    let observer: IntersectionObserver | undefined;
    let frame = 0;
    let pointerFrame = 0;
    let enabled = false;
    root.style.setProperty('--reveal-duration', `${settings.revealDurationMs}ms`);
    function paint() {
      frame = 0;
      if (!enabled || introActive) return;
      const height = innerHeight;
      const scrollLength = document.documentElement.scrollHeight - height;
      root.style.setProperty('--page-progress', String(scrollLength > 0 ? scrollY / scrollLength : 0));
      const workTop = work?.getBoundingClientRect().top ?? height;
      work?.style.setProperty('--section-entry', String(clamp((height - workTop) / (height * .8))));
      if (approach) {
        const top = approach.getBoundingClientRect().top;
        approach.style.setProperty('--assembly', String(clamp((height * .9 - top) / (height * .65))));
      }
      // Sticky positioning is native CSS; only the surface beneath the next card recedes.
      const stack = settings.stackProjects && desktop.matches;
      const rectangles = cards.map(card => card.getBoundingClientRect());
      surfaces.forEach((surface, index) => {
        const next = rectangles[index + 1];
        const depth = stack && next ? clamp((height * .7 - next.top) / Math.max(1, height * .7 - 104)) : 0;
        surface.style.setProperty('--stack-depth', String(depth));
      });
    }
    function schedule() { if (!frame && enabled) frame = requestAnimationFrame(paint); }
    function configure() {
      enabled = site.enableMotion && !preference.matches;
      root.dataset.motion = String(enabled);
      root.dataset.stack = String(enabled && settings.stackProjects && desktop.matches);
      root.dataset.pointer = String(enabled && settings.pointerFollow && pointer.matches);
      observer?.disconnect();
      if (!enabled) {
        nodes.forEach(node => node.classList.add('revealed'));
        surfaces.forEach(surface => surface.style.removeProperty('--stack-depth'));
        root.style.removeProperty('--page-progress');
        return;
      }
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer?.unobserve(entry.target);
        }
      }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
      nodes.forEach(node => {
        node.classList.add('reveal-ready');
        if (!introActive) observer?.observe(node);
      });
      schedule();
    }
    function move(event: PointerEvent) {
      if (!enabled || !settings.pointerFollow || !pointer.matches || event.pointerType !== 'mouse') return;
      const image = (event.target as Element).closest<HTMLElement>('.card-image');
      if (!image) return;
      cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        const rect = image.getBoundingClientRect();
        image.style.setProperty('--pointer-x', `${Math.max(48, Math.min(rect.width - 48, event.clientX - rect.left))}px`);
        image.style.setProperty('--pointer-y', `${Math.max(48, Math.min(rect.height - 48, event.clientY - rect.top))}px`);
      });
    }
    configure();
    preference.addEventListener('change', configure);
    desktop.addEventListener('change', configure);
    pointer.addEventListener('change', configure);
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    document.addEventListener('pointermove', move, { passive: true });
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame); cancelAnimationFrame(pointerFrame);
      preference.removeEventListener('change', configure);
      desktop.removeEventListener('change', configure);
      pointer.removeEventListener('change', configure);
      removeEventListener('scroll', schedule); removeEventListener('resize', schedule);
      document.removeEventListener('pointermove', move);
    };
  }, [routeKey, introActive]);
}
