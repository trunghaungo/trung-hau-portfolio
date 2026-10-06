import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties } from 'react';
import { profile, site, ui } from '../content';
import settings from '../config/motion.json';
import { Arrow } from '../components/Arrow';

const sessionKey = 'hew-intro-seen';
export function useIntro(path: string) {
  const [active, setActive] = useState(() => {
    if (path !== '/' || location.hash || !site.enableMotion || !settings.intro.enabled || matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    try { return new URLSearchParams(location.search).get('intro') === '1' || !settings.intro.oncePerSession || sessionStorage.getItem(sessionKey) !== '1'; }
    catch { return true; }
  });
  const finish = useCallback((moveFocus = false) => {
    try { sessionStorage.setItem(sessionKey, '1'); } catch { /* Storage can be unavailable in private contexts. */ }
    const restoreFocus = moveFocus || !!document.activeElement?.closest('.intro-screen');
    setActive(false);
    if (restoreFocus) requestAnimationFrame(() => document.getElementById('hero-title')?.focus({ preventScroll: true }));
  }, []);
  useLayoutEffect(() => {
    if (!active) { document.documentElement.dataset.intro = 'complete'; return; }
    document.documentElement.dataset.intro = 'playing';
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; document.documentElement.dataset.intro = 'complete'; };
  }, [active]);
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => finish(), settings.intro.durationMs);
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => { if (preference.matches) finish(); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') finish(true); };
    preference.addEventListener('change', change);
    document.addEventListener('keydown', escape);
    return () => { clearTimeout(timer); preference.removeEventListener('change', change); document.removeEventListener('keydown', escape); };
  }, [active, finish]);
  useEffect(() => { if (path !== '/' && active) finish(); }, [path, active, finish]);
  return { active, finish };
}

export function Intro({ finish }: { finish: (moveFocus?: boolean) => void }) {
  return <div className="intro-screen" style={{ '--intro-duration': `${settings.intro.durationMs}ms` } as CSSProperties}>
    <div className="intro-composition" aria-hidden="true">
      <span className="intro-corner intro-corner-top" /><span className="intro-corner intro-corner-bottom" />
      <div className="intro-name">{profile.name.toUpperCase().split(' ').map((word, wordIndex) => <span className="intro-word" key={word}>{Array.from(word).map((letter, index) => <span className="intro-letter-mask" key={index}><span style={{ '--letter-index': index + wordIndex * 5 } as CSSProperties}>{letter}</span></span>)}</span>)}</div>
      <span className="intro-signature">{profile.alias}</span>
    </div>
    <button className="intro-skip" onClick={() => finish(true)}>{ui.skipIntro}<Arrow /></button>
  </div>;
}
