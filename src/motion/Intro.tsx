import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { profile, site, ui, media } from '../content';
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
    const resize = () => finish();
    document.addEventListener('keydown', escape);
    window.addEventListener('resize', resize);
    return () => { clearTimeout(timer); preference.removeEventListener('change', change); document.removeEventListener('keydown', escape); window.removeEventListener('resize', resize); };
  }, [active, finish]);
  useEffect(() => { if (path !== '/' && active) finish(); }, [path, active, finish]);
  return { active, finish };
}

export function Intro({ finish }: { finish: (moveFocus?: boolean) => void }) {
  const aperture = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLSpanElement>(null);
  const asset = media[site.heroMediaId];
  const handoff = settings.intro.imageHandoff && !!asset;
  useLayoutEffect(() => {
    if (!handoff) return;
    let animation: Animation | undefined;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const target = document.querySelector('.hero-frame');
        if (!target || !slot.current || !aperture.current) return;
        const from = slot.current.getBoundingClientRect(), to = target.getBoundingClientRect();
        const box = (rect: DOMRect) => ({ left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
        animation = aperture.current.animate([
          { ...box(from), opacity: 0, borderRadius: '3px', offset: 0 },
          { ...box(from), opacity: 1, borderRadius: '3px', offset: .2 },
          { ...box(from), opacity: 1, borderRadius: '3px', offset: .42 },
          { ...box(to), opacity: 1, borderRadius: '0px', offset: .87 },
          { ...box(to), opacity: 0, borderRadius: '0px', offset: 1 },
        ], { duration: settings.intro.durationMs - 32, easing: 'cubic-bezier(.65,0,.2,1)', fill: 'both' });
      });
    });
    return () => { cancelAnimationFrame(frame); animation?.cancel(); };
  }, [handoff]);
  const words = profile.name.toUpperCase().split(' ');
  return <div className={`intro-screen ${handoff ? 'intro-handoff' : ''}`} style={{ '--intro-duration': `${settings.intro.durationMs}ms` } as CSSProperties}>
    {handoff && <div className="intro-backdrop" />}
    <div className="intro-composition" aria-hidden="true">
      <span className="intro-corner intro-corner-top" /><span className="intro-corner intro-corner-bottom" />
      <div className="intro-name">{words.map((word, wordIndex) => <span className="intro-part" key={`${word}-${wordIndex}`}><span className="intro-word">{Array.from(word).map((letter, index) => <span className="intro-letter-mask" key={index}><span style={{ '--letter-index': index + wordIndex * 5 } as CSSProperties}>{letter}</span></span>)}</span>{handoff && wordIndex === 0 && <span className="intro-aperture-slot" ref={slot} />}</span>)}</div>
      <span className="intro-signature">{profile.alias}</span>
    </div>
    {handoff && <div className="intro-aperture" ref={aperture} aria-hidden="true"><img src={asset.posterSrc} srcSet={asset.srcSet} sizes="100vw" alt="" style={{ objectPosition: asset.objectPosition }} /></div>}
    <button className="intro-skip" onClick={() => finish(true)}>{ui.skipIntro}<Arrow /></button>
  </div>;
}
