import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { profile, site, ui, media } from '../content';
import { isMotionReduced, subscribeMotion } from './preference';
import settings from '../config/motion.json';
import { Arrow } from '../components/Arrow';

const sessionKey = 'hew-intro-seen';
const handoffOpenMs = settings.intro.durationMs * .96;
const handoffBackdropMs = 220;
const handoffFadeMs = 500;
const handoffEndMs = handoffOpenMs + handoffFadeMs;
export function useIntro(path: string) {
  const [active, setActive] = useState(() => {
    if (path !== '/' || location.hash || !site.enableMotion || !settings.intro.enabled || isMotionReduced()) return false;
    try {
      const replay = new URLSearchParams(location.search).get('intro');
      return replay === '1' || !settings.intro.oncePerSession || sessionStorage.getItem(sessionKey) !== '1';
    }
    catch { return true; }
  });
  const finish = useCallback((moveFocus = false) => {
    try { sessionStorage.setItem(sessionKey, '1'); } catch { /* Storage can be unavailable in private contexts. */ }
    const restoreFocus = moveFocus || !!document.activeElement?.closest('.intro-screen');
    // Release the actual hero in this update, without starting another reveal.
    document.querySelectorAll<HTMLElement>('.hero [data-reveal]').forEach(node => {
      node.dataset.introSettled = 'true';
      node.classList.remove('reveal-ready');
      node.classList.add('revealed');
    });
    setActive(false);
    if (restoreFocus) requestAnimationFrame(() => document.getElementById('hero-title')?.focus({ preventScroll: true }));
  }, []);
  useLayoutEffect(() => {
    if (!active) { document.documentElement.dataset.intro = 'complete'; return; }
    document.documentElement.dataset.intro = 'playing';
    const overflow = document.body.style.overflow;
    const gutter = document.documentElement.style.scrollbarGutter;
    // Keep the hero width identical when the scroll lock is released.
    document.documentElement.style.scrollbarGutter = 'stable';
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; document.documentElement.style.scrollbarGutter = gutter; document.documentElement.dataset.intro = 'complete'; };
  }, [active]);
  useEffect(() => {
    if (!active) return;
    const duration = settings.intro.imageHandoff && media[site.heroMediaId] ? handoffEndMs : settings.intro.durationMs;
    const timer = window.setTimeout(() => finish(), duration);
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
  const sequence = [...settings.intro.mediaIds.map(id => media[id]).filter(Boolean), asset].filter(Boolean);
  const handoff = settings.intro.imageHandoff && !!asset;
  useLayoutEffect(() => {
    if (!handoff) return;
    if (typeof aperture.current?.animate !== 'function') { finish(); return; }
    const started = performance.now();
    const animations: Animation[] = [];
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const target = document.querySelector('.hero-frame');
        if (!target || !slot.current || !aperture.current) { finish(); return; }
        // Reload can restore an old scroll offset; an active intro always lands on the hero.
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        const from = slot.current.getBoundingClientRect(), to = target.getBoundingClientRect();
        const finalPhoto = aperture.current.querySelector<HTMLImageElement>('img:last-child');
        const heroPhoto = target.querySelector('img');
        if (finalPhoto && heroPhoto) finalPhoto.style.transform = getComputedStyle(heroPhoto).transform;
        if (!from.width || !from.height || !to.width || !to.height) { finish(); return; }
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
        const elapsed = performance.now() - started;
        const duration = Math.max(1, handoffEndMs - elapsed);
        const atMs = (timeMs: number) => Math.max(0, Math.min(1, (timeMs - elapsed) / duration));
        const at = (fraction: number) => atMs(settings.intro.durationMs * fraction);
        try {
          animations.push(aperture.current.animate([
            { ...closed, offset: 0 },
            { ...closed, offset: at(.60), easing: 'cubic-bezier(.42, 0, .18, 1)' },
            { ...opened, offset: at(.96) },
            { ...opened, offset: 1 },
          ], { duration, easing: 'linear', fill: 'both' }));
          // Reveal the matching hero only after the photo has filled its final frame.
          animations.push(aperture.current.animate([
            { opacity: 0, offset: 0 },
            { opacity: 0, offset: at(.12) },
            { opacity: 1, offset: at(.24) },
            { opacity: 1, offset: atMs(handoffOpenMs + handoffBackdropMs), easing: 'ease-in-out' },
            { opacity: 0, offset: atMs(handoffEndMs - 30) },
            { opacity: 0, offset: 1 },
          ], { duration, easing: 'linear', fill: 'both' }));
          const images = aperture.current.querySelectorAll('img');
          // A finite photo sequence, not a GIF/video or a recurring RAF loop.
          images.forEach((image, index) => {
            const begin = index === 0 ? 0 : index === images.length - 1 ? .50 : .32;
            const end = index === images.length - 1 ? 1 : index === 0 ? .32 : .50;
            const frames: Keyframe[] = [{ opacity: index === 0 ? 1 : 0, offset: 0 }];
            if (begin > 0) frames.push({ opacity: 0, offset: at(begin) }, { opacity: 1, offset: at(begin + .025) });
            if (end < 1) frames.push({ opacity: 1, offset: at(end) }, { opacity: 0, offset: at(end + .025) });
            frames.push({ opacity: index === images.length - 1 ? 1 : 0, offset: 1 });
            animations.push(image.animate(frames, { duration, easing: 'linear', fill: 'both' }));
          });
        } catch { finish(); }
      });
    });
    return () => { cancelAnimationFrame(frame); animations.forEach(animation => animation.cancel()); };
  }, [handoff, finish]);
  const words = profile.name.toUpperCase().split(' ');
  return <div className={`intro-screen ${handoff ? 'intro-handoff' : ''}`} style={{ '--intro-duration': `${settings.intro.durationMs}ms`, '--intro-handoff-open': `${handoffOpenMs}ms`, '--intro-backdrop-fade': `${handoffBackdropMs}ms` } as CSSProperties}>
    {handoff && <div className="intro-backdrop" />}
    <div className="intro-composition" aria-hidden="true">
      <span className="intro-corner intro-corner-top" /><span className="intro-corner intro-corner-bottom" />
      <div className="intro-name">{words.map((word, wordIndex) => <span className="intro-part" key={`${word}-${wordIndex}`}><span className="intro-word">{Array.from(word).map((letter, index) => <span className="intro-letter-mask" key={index}><span style={{ '--letter-index': index + wordIndex * 5 } as CSSProperties}>{letter}</span></span>)}</span>{handoff && wordIndex === 0 && <span className="intro-aperture-slot" ref={slot} />}</span>)}</div>
      <span className="intro-signature">{profile.alias}</span>
    </div>
    {handoff && <div className="intro-aperture" ref={aperture} aria-hidden="true">{sequence.map((photo, index) => <img key={photo.posterSrc} data-intro-photo={index + 1} src={photo.posterSrc} srcSet={photo.srcSet} sizes={index === sequence.length - 1 ? '100vw' : '(max-width: 767px) 60vw, 480px'} alt="" decoding="async" fetchPriority={index === 0 || index === sequence.length - 1 ? 'high' : 'auto'} style={{ objectPosition: photo.objectPosition, opacity: index === 0 ? 1 : 0 }} onError={() => finish()} />)}</div>}
    <button className="intro-skip" onClick={() => finish(true)}>{ui.skipIntro}<Arrow /></button>
  </div>;
}
