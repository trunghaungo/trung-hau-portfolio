import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { profile, site, ui, media } from '../content';
import { isMotionReduced, subscribeMotion } from './preference';
import settings from '../config/motion.json';
import { Arrow } from '../components/Arrow';

const sessionKey = 'hew-intro-seen';
export function useIntro(path: string) {
  const [active, setActive] = useState(() => {
    if (path !== '/' || location.hash || !site.enableMotion || !settings.intro.enabled || isMotionReduced()) return false;
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
    const unsubscribe = subscribeMotion(() => { if (isMotionReduced()) finish(); });
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') finish(true); };
    const resize = () => finish();
    document.addEventListener('keydown', escape);
    window.addEventListener('resize', resize);
    return () => { clearTimeout(timer); unsubscribe(); document.removeEventListener('keydown', escape); window.removeEventListener('resize', resize); };
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
        // Keep the image's aspect ratio and fixed geometry throughout the handoff.
        // Only transform, clipping and opacity animate, not layout dimensions.
        Object.assign(aperture.current.style, { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px` });
        const scale = Math.max(from.width / to.width, from.height / to.height);
        const dx = from.left - to.left - (to.width * scale - from.width) / 2;
        const dy = from.top - to.top - (to.height * scale - from.height) / 2;
        const cropX = (to.width - from.width / scale) / 2;
        const cropY = (to.height - from.height / scale) / 2;
        const closed = { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, clipPath: `inset(${cropY}px ${cropX}px round 3px)` };
        const opened = { transform: 'translate(0px, 0px) scale(1)', clipPath: 'inset(0px 0px round 0px)' };
        animation = aperture.current.animate([
          { ...closed, opacity: 0, offset: 0 },
          { ...closed, opacity: 1, offset: .2 },
          { ...closed, opacity: 1, offset: .42, easing: 'cubic-bezier(.65,0,.2,1)' },
          { ...opened, opacity: 1, offset: .87 },
          { ...opened, opacity: 0, offset: 1 },
        ], { duration: settings.intro.durationMs - 32, easing: 'linear', fill: 'both' });
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
