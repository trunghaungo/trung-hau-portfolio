import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { media, site, ui, profile } from '../content';
import type { MediaAsset } from '../content/types';
import { useReducedMotion } from '../motion/preference';
import { Arrow } from './Arrow';

export function MediaFrame({ id, eager = false, transition = false, className = '', sizes, playMotion = true, onPointerEnter, onPointerLeave }: {
  id: string; eager?: boolean; transition?: boolean; className?: string; sizes?: string;
  playMotion?: boolean;
  onPointerEnter?: () => void; onPointerLeave?: () => void;
}) {
  const reduced = useReducedMotion();
  const asset: MediaAsset | undefined = media[id];
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [motionFailed, setMotionFailed] = useState(false);
  const [visible, setVisible] = useState(false);
  const animate = Boolean(asset?.motionVideoSrc && site.mediaMode === 'live' && playMotion && !reduced && !((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData));
  useEffect(() => { setFailed(false); setMotionFailed(false); }, [id]);
  useEffect(() => {
    if (!animate) { setVisible(false); return; }
    const node = frame.current;
    if (!node) return;
    let observer: IntersectionObserver | undefined;
    let frameId = 0;
    const checkVisible = () => {
      frameId = 0;
      const rect = node.getBoundingClientRect();
      setVisible(!document.hidden && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth);
    };
    const scheduleCheck = () => { if (!frameId) frameId = requestAnimationFrame(checkVisible); };
    try {
      if (typeof IntersectionObserver !== 'function') throw new Error('IntersectionObserver unavailable');
      observer = new IntersectionObserver(([entry]) => setVisible(!document.hidden && entry.isIntersecting), { threshold: 0.01 });
      observer.observe(node);
    } catch {
      observer?.disconnect(); observer = undefined;
      // A failed observer still gets lazy playback through native scroll events.
      addEventListener('scroll', scheduleCheck, { passive: true });
      addEventListener('resize', scheduleCheck);
      scheduleCheck();
    }
    const onVisibilityChange = () => {
      if (document.hidden) setVisible(false);
      else scheduleCheck();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      observer?.disconnect(); cancelAnimationFrame(frameId);
      removeEventListener('scroll', scheduleCheck); removeEventListener('resize', scheduleCheck);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [animate, id]);
  useEffect(() => {
    if (visible && animate && !motionFailed) void video.current?.play().catch(() => { /* The still frame remains available. */ });
  }, [visible, animate, motionFailed]);
  return <div ref={frame} id={`media-${id}`} className={`media-frame ${className}`} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}
    style={{ aspectRatio: asset?.frameAspectRatio || (asset ? `${asset.width} / ${asset.height}` : '3 / 2'), viewTransitionName: transition ? 'project-cover' : undefined }}>
    {asset && !failed ? <img src={asset.posterSrc} srcSet={asset.srcSet} sizes={sizes || asset.sizes || (transition ? '(max-width: 767px) calc(100vw - 40px), (max-width: 1370px) 92vw, 1240px' : '(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 60vw, 800px')}
      alt={asset.alt} width={asset.width} height={asset.height} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async"
      style={{ objectPosition: asset.objectPosition || '50% 50%', objectFit: asset.objectFit || 'cover' }} onError={() => setFailed(true)} /> :
      <div className="media-fallback" role="img" aria-label={asset?.alt || ui.imageUnavailable}><span>{profile.alias} / {ui.visualNotes}</span><strong>{ui.frameInProgress}</strong><span>{ui.imageUnavailable}</span></div>}
    {asset?.motionVideoSrc && animate && visible && !motionFailed && <video ref={video} className="media-motion-video" src={asset.motionVideoSrc} aria-hidden="true" muted autoPlay loop playsInline preload="none" poster={asset.posterSrc}
      style={{ objectPosition: asset.objectPosition || '50% 50%', objectFit: asset.objectFit || 'cover' }} onError={() => setMotionFailed(true)} />}
    {asset?.isPlaceholder && <span className="media-placeholder" aria-hidden="true">{ui.placeholder}</span>}
  </div>;
}

// Card previews and other optional videos stay opt-in.
export function VideoControl({ id, preview = false, hovered = false }: { id: string; preview?: boolean; hovered?: boolean }) {
  const reduced = useReducedMotion();
  const asset = media[id];
  const src = preview ? asset?.previewSrc : asset?.fullVideoSrc;
  const [active, setActive] = useState(false);
  const [error, setError] = useState(false);
  const manual = useRef(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if ((!hovered || reduced) && !manual.current) setActive(false);
    if (site.mediaMode !== 'live' || !src || !preview || !site.enableHoverPreview || !matchMedia('(hover: hover) and (pointer: fine)').matches || reduced || connection?.saveData) return;
    if (!hovered) { if (!manual.current) setActive(false); return; }
    const timer = setTimeout(() => { document.dispatchEvent(new CustomEvent('portfolio:play', { detail: id })); setError(false); setActive(true); }, 220);
    return () => clearTimeout(timer);
  }, [hovered, id, preview, src, reduced]);
  useEffect(() => {
    if (site.mediaMode !== 'live' || !src) return;
    const pause = () => { manual.current = false; setActive(false); };
    const pauseOther = (e: Event) => { if ((e as CustomEvent).detail !== id) pause(); };
    const hidden = () => { if (document.hidden) pause(); };
    document.addEventListener('portfolio:play', pauseOther);
    document.addEventListener('visibilitychange', hidden);
    let observer: IntersectionObserver | undefined;
    try {
      if (typeof IntersectionObserver === 'function') {
        observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) pause(); });
        if (video.current) observer.observe(preview ? video.current.closest('.project-card') || video.current : video.current);
      }
    } catch { observer?.disconnect(); observer = undefined; }
    let disposed = false;
    if (active) video.current?.play().catch((error: DOMException) => { if (disposed || error.name === 'AbortError') return; setActive(false); setError(true); });
    return () => { disposed = true; document.removeEventListener('portfolio:play', pauseOther); document.removeEventListener('visibilitychange', hidden); observer?.disconnect(); };
  }, [active, id, src, preview]);
  if (site.mediaMode !== 'live' || !src) return null;
  const previewHost = preview ? document.getElementById(`media-${id}`)?.parentElement : null;
  const player = active && <video ref={video} className={preview ? 'preview-video' : undefined} src={src} poster={asset.posterSrc} muted={preview} controls={!preview} loop={preview} playsInline preload="none" onError={() => { setError(true); setActive(false); }} />;
  return <div className={`video-control ${preview ? 'is-preview' : ''}`}>
    <button className="text-link" type="button" aria-expanded={active} onClick={() => {
      if (!active) document.dispatchEvent(new CustomEvent('portfolio:play', { detail: id }));
      manual.current = !active;
      setActive(!active); setError(false);
    }}>{active ? ui.stopVideo : preview ? ui.previewVideo : ui.watchVideo} <Arrow /></button>
    {previewHost ? createPortal(player, previewHost) : player}
    {error && <p className="video-error" role="status">{ui.videoError} <a href={src} target="_blank" rel="noreferrer">{ui.openVideoFile} <Arrow /></a></p>}
  </div>;
}

export function TrailerPlayer({ id }: { id: string }) {
  const reduced = useReducedMotion();
  const asset = media[id];
  const src = asset?.fullVideoSrc;
  const video = useRef<HTMLVideoElement>(null);
  const visible = useRef(false);
  const pausedByUser = useRef(false);
  const automaticPause = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (site.mediaMode !== 'live' || !src) return;
    const player = video.current;
    if (!player) return;
    const pause = () => {
      if (!player.paused) { automaticPause.current = true; player.pause(); }
    };
    const playIfVisible = () => {
      if (!visible.current || document.hidden || reduced || pausedByUser.current || !player.src) return;
      void player.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
    };
    const onVisibilityChange = () => {
      if (document.hidden) pause();
      else playIfVisible();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    if (reduced) pause();
    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver === 'function') {
      try {
        observer = new IntersectionObserver(([entry]) => {
          visible.current = entry.isIntersecting;
          if (!entry.isIntersecting) pause();
          else if (entry.intersectionRatio >= 0.25) {
            setLoaded(true);
            playIfVisible();
          }
        }, { threshold: [0, 0.25] });
        observer.observe(player);
      } catch { observer?.disconnect(); observer = undefined; }
    }
    if (!observer) setLoaded(true); // Manual playback still works without the observer API.
    if (loaded) playIfVisible();
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', onVisibilityChange); pause(); };
  }, [src, reduced, loaded]);

  if (site.mediaMode !== 'live' || !src) return null;
  return <div className="trailer-player">
    <video ref={video} src={loaded ? src : undefined} poster={asset.posterSrc} aria-label={ui.trailer}
      muted controls playsInline preload="none" onPlay={() => { pausedByUser.current = false; }}
      onPause={() => {
        if (!automaticPause.current && visible.current && !document.hidden && !reduced) pausedByUser.current = true;
        automaticPause.current = false;
      }}
      onError={() => setError(true)} />
    {error && <p className="video-error" role="status">{ui.videoError} <a href={src} target="_blank" rel="noreferrer">{ui.openVideoFile} <Arrow /></a></p>}
  </div>;
}
