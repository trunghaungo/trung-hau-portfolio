import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { media, site, ui, profile } from '../content';
import type { MediaAsset } from '../content/types';
import { Arrow } from './Arrow';

export function MediaFrame({ id, eager = false, transition = false, className = '', sizes, onPointerEnter, onPointerLeave }: {
  id: string; eager?: boolean; transition?: boolean; className?: string; sizes?: string;
  onPointerEnter?: () => void; onPointerLeave?: () => void;
}) {
  const asset: MediaAsset | undefined = media[id];
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [id]);
  return <div id={`media-${id}`} className={`media-frame ${className}`} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}
    style={{ aspectRatio: asset?.frameAspectRatio || (asset ? `${asset.width} / ${asset.height}` : '3 / 2'), viewTransitionName: transition ? 'project-cover' : undefined }}>
    {asset && !failed ? <img src={asset.posterSrc} srcSet={asset.srcSet} sizes={sizes || asset.sizes || (transition ? '(max-width: 767px) calc(100vw - 40px), (max-width: 1370px) 92vw, 1240px' : '(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 60vw, 800px')}
      alt={asset.alt} width={asset.width} height={asset.height} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async"
      style={{ objectPosition: asset.objectPosition || '50% 50%', objectFit: asset.objectFit || 'cover' }} onError={() => setFailed(true)} /> :
      <div className="media-fallback" role="img" aria-label={asset?.alt || ui.imageUnavailable}><span>{profile.alias} / {ui.visualNotes}</span><strong>{ui.frameInProgress}</strong><span>{ui.imageUnavailable}</span></div>}
    {asset?.isPlaceholder && <span className="media-placeholder" aria-hidden="true">{ui.placeholder}</span>}
  </div>;
}

// Video elements are mounted only after a deliberate request in live mode.
export function VideoControl({ id, preview = false, hovered = false }: { id: string; preview?: boolean; hovered?: boolean }) {
  const asset = media[id];
  const src = preview ? asset?.previewSrc : asset?.fullVideoSrc;
  const [active, setActive] = useState(false);
  const [error, setError] = useState(false);
  const manual = useRef(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (site.mediaMode !== 'live' || !src || !preview || !site.enableHoverPreview || !matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches || connection?.saveData) return;
    if (!hovered) { if (!manual.current) setActive(false); return; }
    const timer = setTimeout(() => { document.dispatchEvent(new CustomEvent('portfolio:play', { detail: id })); setError(false); setActive(true); }, 220);
    return () => clearTimeout(timer);
  }, [hovered, id, preview, src]);
  useEffect(() => {
    if (site.mediaMode !== 'live' || !src) return;
    const pause = () => { manual.current = false; setActive(false); };
    const pauseOther = (e: Event) => { if ((e as CustomEvent).detail !== id) pause(); };
    const hidden = () => { if (document.hidden) pause(); };
    document.addEventListener('portfolio:play', pauseOther);
    document.addEventListener('visibilitychange', hidden);
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) pause(); });
    let disposed = false;
    if (video.current) observer.observe(preview ? video.current.closest('.project-card') || video.current : video.current);
    if (active) video.current?.play().catch((error: DOMException) => { if (disposed || error.name === 'AbortError') return; setActive(false); setError(true); });
    return () => { disposed = true; document.removeEventListener('portfolio:play', pauseOther); document.removeEventListener('visibilitychange', hidden); observer.disconnect(); };
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
