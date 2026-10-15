import { useCallback, useEffect, useRef, useState } from 'react';
import { media, site, ui } from '../content';
import type { Project } from '../content/types';
import { Arrow } from './Arrow';
import { MediaFrame } from './MediaFrame';

type Showcase = NonNullable<Project['shortLong']>;

function ReelPlayer({ id, index, onClose }: { id: string; index: number; onClose: () => void }) {
  const asset = media[id];
  const dialog = useRef<HTMLDialogElement>(null);
  const player = useRef<HTMLVideoElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = dialog.current;
    const video = player.current;
    if (!node || !video) return;
    try {
      if (typeof node.showModal === 'function') node.showModal();
      else node.setAttribute('open', '');
    } catch {
      node.setAttribute('open', '');
    }
    closeButton.current?.focus();
    video.muted = false;
    video.volume = 1;
    void video.play().catch((error: DOMException) => {
      if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') setFailed(true);
      // Native controls remain available if the browser blocks automatic playback.
    });
    const hidden = () => { if (document.hidden) onClose(); };
    document.addEventListener('visibilitychange', hidden);
    return () => {
      document.removeEventListener('visibilitychange', hidden);
      video.pause();
      video.removeAttribute('src');
      video.load();
      if (node.open && typeof node.close === 'function') node.close();
      else node.removeAttribute('open');
    };
  }, [onClose]);

  const label = `${ui.shortCardLabel} ${String(index + 1).padStart(2, '0')}`;
  return <dialog ref={dialog} className="reel-dialog" aria-labelledby="reel-dialog-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="reel-dialog-inner">
      <div className="reel-dialog-header"><h3 id="reel-dialog-title">{label}</h3><button ref={closeButton} type="button" onClick={onClose} aria-label={ui.closeVideo}>×</button></div>
      {failed ? <div className="reel-dialog-fallback">
        <MediaFrame id={id} sizes="(max-width: 767px) 90vw, 450px" />
        <p role="status">{ui.videoError} <a href={asset.fullVideoSrc} target="_blank" rel="noreferrer">{ui.openVideoFile}</a></p>
      </div> : <video ref={player} src={asset.fullVideoSrc} poster={asset.posterSrc} aria-label={label} controls playsInline preload="none" onError={() => setFailed(true)} />}
    </div>
  </dialog>;
}

function ShortReels({ content }: { content: Showcase }) {
  const [selected, setSelected] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const close = useCallback(() => setSelected(null), []);
  useEffect(() => {
    if (selected !== null) return;
    opener.current?.focus();
  }, [selected]);

  return <section className="short-reels" id="short-form-gallery" aria-labelledby="short-reels-title">
    <div className="showcase-section-heading">
      <h2 id="short-reels-title">{ui.shortFormSection}</h2>
      <p>{String(content.clipMediaIds.length).padStart(2, '0')} / {ui.shortCollectionLabel}</p>
    </div>
    <div className="reel-grid">
      {content.clipMediaIds.map((id, index) => <article className="reel-card" key={id}>
        <div className="reel-card-media">
          <MediaFrame id={id} sizes="(max-width: 359px) 140px, (max-width: 767px) 44vw, (max-width: 1023px) 30vw, 19vw" />
          {site.mediaMode === 'live' && media[id]?.fullVideoSrc && <button type="button" className="reel-card-play" aria-label={`${ui.playClip} ${index + 1}`}
            onClick={event => { opener.current = event.currentTarget; setSelected(index); }}><span aria-hidden="true">▶</span></button>}
        </div>
        <h3>{ui.shortCardLabel} {String(index + 1).padStart(2, '0')}</h3>
      </article>)}
    </div>
    {selected !== null && site.mediaMode === 'live' && <ReelPlayer id={content.clipMediaIds[selected]} index={selected} onClose={close} />}
  </section>;
}

function LongVideoCard({ video, featured }: { video: Showcase['longVideos'][number]; featured: boolean }) {
  return <article className="long-video-card">
    <a className="long-video-link" href={video.videoUrl} target="_blank" rel="noreferrer" aria-label={`${video.title} — ${ui.openOnYouTube}`}>
      <div className="long-video-frame">
        <MediaFrame id={video.posterMediaId} sizes={featured ? '(max-width: 767px) calc(100vw - 40px), 65vw' : '(max-width: 767px) calc(100vw - 40px), 32vw'} />
        <span className="long-play-mark" aria-hidden="true"><Arrow /></span>
      </div>
      <h3>{video.title}</h3>
    </a>
  </article>;
}

export function ShortLongShowcase({ content }: { content: Showcase }) {
  return <div className="short-long-showcase">
    <ShortReels content={content} />
    <section className="long-form-section" id="long-form-gallery" aria-labelledby="long-form-title">
      <div className="showcase-section-heading">
        <h2 id="long-form-title">{ui.longFormSection}</h2>
        <p>{String(content.longVideos.length).padStart(2, '0')} / {ui.longCollectionLabel}</p>
      </div>
      <div className="long-video-grid">{content.longVideos.map((video, index) => <LongVideoCard video={video} featured={index === 0} key={video.videoUrl} />)}</div>
    </section>
  </div>;
}
