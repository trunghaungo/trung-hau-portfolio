import { useSyncExternalStore } from 'react';
import site from '../config/site.json';

export const motionStorageKey = 'hew-reduce-motion';
const system = matchMedia('(prefers-reduced-motion: reduce)');
const listeners = new Set<() => void>();
const read = (): boolean | null => {
  try {
    const value = localStorage.getItem(motionStorageKey);
    return value === 'on' ? true : value === 'off' ? false : null;
  } catch { return null; }
};
let choice = read();
export const isMotionReduced = () => !site.enableMotion || (choice ?? system.matches);
export const subscribeMotion = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
function publish() {
  // Set before React paints; CSS, navigation and the intro share this one decision.
  document.documentElement.dataset.motion = String(!isMotionReduced());
  listeners.forEach(listener => listener());
}
export function setReducedMotion(reduce: boolean) {
  choice = reduce;
  try { localStorage.setItem(motionStorageKey, reduce ? 'on' : 'off'); } catch { /* Keep the choice in memory when storage is unavailable. */ }
  publish();
}
export function useReducedMotion() { return useSyncExternalStore(subscribeMotion, isMotionReduced); }
export function getMotionPreference() { return { systemReduced: system.matches, choice: choice === null ? 'system' : choice ? 'reduced' : 'full', reduced: isMotionReduced() }; }
const onStorage = (event: StorageEvent) => { if (event.key === motionStorageKey || event.key === null) { choice = read(); publish(); } };
system.addEventListener('change', publish);
window.addEventListener('storage', onStorage);
publish();
if (import.meta.hot) import.meta.hot.dispose(() => { system.removeEventListener('change', publish); window.removeEventListener('storage', onStorage); });
