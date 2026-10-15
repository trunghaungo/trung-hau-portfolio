import { useEffect, useLayoutEffect, useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { site } from './content';
import { isMotionReduced, subscribeMotion } from './motion/preference';

type Snapshot = { y: number; focus?: string };
type Route = { path: string; hash: string; key: string; pop: boolean };
const positions = new Map<string, Snapshot>();
let currentKey = history.state?.portfolioKey || crypto.randomUUID();
history.replaceState({ ...history.state, portfolioKey: currentKey }, '');
history.scrollRestoration = 'manual';
let updateRoute: ((r: Route) => void) | undefined;
let transition: { finished: Promise<void>; skipTransition: () => void } | undefined;
let pendingApply: (() => void) | undefined;
let navigationSequence = 0;
const getRoute = (pop = false): Route => ({ path: location.pathname.replace(/\/$/, '') || '/', hash: location.hash, key: currentKey, pop });
const reduced = isMotionReduced;
const clearCoverNames = () => document.querySelectorAll('[style*="project-cover"]').forEach(el => (el as HTMLElement).style.removeProperty('view-transition-name'));
function skipTransition() {
  try { transition?.skipTransition(); } catch { /* A broken presentation API cannot block routing. */ }
  transition = undefined;
}
const unsubscribeMotion = subscribeMotion(() => {
  if (!reduced()) return;
  skipTransition();
  pendingApply?.(); // skipTransition does not guarantee that a pending callback has run yet.
  clearCoverNames();
  window.scrollTo({ top: scrollY, behavior: 'instant' });
});
if (import.meta.hot) import.meta.hot.dispose(() => { unsubscribeMotion(); skipTransition(); pendingApply = undefined; });

export function navigate(href: string, coverId?: string) {
  const target = new URL(href, location.href);
  const sequence = ++navigationSequence;
  skipTransition(); pendingApply = undefined;
  clearCoverNames();
  if (target.pathname === location.pathname && target.hash === location.hash) {
    if (target.hash) document.getElementById(target.hash.slice(1))?.scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth' });
    else window.scrollTo({ top: 0, behavior: reduced() ? 'instant' : 'smooth' });
    return;
  }
  const focus = document.activeElement instanceof HTMLElement ? document.activeElement.id : undefined;
  positions.set(currentKey, { y: window.scrollY, focus });
  const returnTo = location.pathname === '/' && target.pathname.startsWith('/work/') ? currentKey : undefined;
  let applied = false;
  const apply = () => {
    if (applied || sequence !== navigationSequence) return;
    applied = true;
    pendingApply = undefined;
    currentKey = crypto.randomUUID();
    history.pushState({ portfolioKey: currentKey, returnTo }, '', target.pathname + target.hash);
    flushSync(() => updateRoute?.(getRoute()));
  };
  const api = document as Document & { startViewTransition?: (fn: () => void) => typeof transition };
  const wide = matchMedia('(min-width: 768px)').matches;
  if (site.enableViewTransitions && !reduced() && wide && api.startViewTransition) {
    if (coverId) document.getElementById(coverId)?.style.setProperty('view-transition-name', 'project-cover');
    pendingApply = apply;
    try {
      transition = api.startViewTransition(apply);
      if (!transition) { apply(); clearCoverNames(); return; }
      void transition.finished.catch(() => { apply(); }).finally(() => {
        if (sequence !== navigationSequence) return;
        transition = undefined; pendingApply = undefined; clearCoverNames();
      });
    } catch { skipTransition(); apply(); clearCoverNames(); }
  } else apply();
}

export function internalClick(event: MouseEvent<HTMLAnchorElement>, coverId?: string) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
  const link = event.currentTarget;
  if (link.origin !== location.origin || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  event.preventDefault();
  navigate(event.currentTarget.href, coverId);
}

export function backToWork(event: MouseEvent<HTMLAnchorElement>) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
  event.preventDefault();
  if (history.state?.returnTo && positions.has(history.state.returnTo)) history.back();
  else navigate('/#work');
}

export function useRoute() {
  const [route, setRoute] = useState(getRoute);
  useEffect(() => {
    updateRoute = setRoute;
    const onPop = () => { ++navigationSequence; skipTransition(); pendingApply = undefined; clearCoverNames(); currentKey = history.state?.portfolioKey || crypto.randomUUID(); setRoute(getRoute(true)); };
    const onScroll = () => {
      const existing = positions.get(currentKey);
      positions.set(currentKey, { y: window.scrollY, focus: existing?.focus });
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { updateRoute = undefined; window.removeEventListener('popstate', onPop); window.removeEventListener('scroll', onScroll); };
  }, []);
  useLayoutEffect(() => {
    const snapshot = route.pop ? positions.get(route.key) : undefined;
    const destination = route.hash ? document.getElementById(route.hash.slice(1)) : undefined;
    if (snapshot) {
      window.scrollTo({ top: snapshot.y, behavior: 'instant' });
      document.getElementById(snapshot.focus || '')?.focus({ preventScroll: true });
    } else if (destination) {
      destination.scrollIntoView({ behavior: 'instant' });
      destination.focus({ preventScroll: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (route.path !== '/') document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
    }
  }, [route]);
  return route;
}
