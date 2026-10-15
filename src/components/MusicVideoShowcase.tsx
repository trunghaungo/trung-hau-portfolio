import { useEffect, useRef } from 'react';
import { media, ui } from '../content';
import type { Project } from '../content/types';
import { Arrow } from './Arrow';
import { MediaFrame } from './MediaFrame';

export function MusicVideoShowcase({ videos }: { videos: NonNullable<Project['musicVideos']> }) {
  const showcaseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targets = showcaseRef.current?.querySelectorAll<HTMLElement>('.music-video-heading, .music-video-clips figure');
    if (!targets || typeof IntersectionObserver !== 'function') return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.setAttribute('data-in-view', '');
        else entry.target.removeAttribute('data-in-view');
      });
    }, { rootMargin: '-18% 0px -18% 0px', threshold: 0 });
    targets.forEach(target => observer.observe(target));
    return () => {
      observer.disconnect();
      targets.forEach(target => target.removeAttribute('data-in-view'));
    };
  }, [videos]);

  return <div className="music-showcase" ref={showcaseRef}>
    {videos.map((video, index) => <section className="music-video" key={video.title} aria-labelledby={`music-video-${index}`}>
      <div className="music-video-heading" data-reveal>
        <span className="music-video-number" aria-hidden="true">{String(index + 1).padStart(2, '0')} / {String(videos.length).padStart(2, '0')}</span>
        <div>
          <h2 id={`music-video-${index}`} lang="vi">{video.title}</h2>
          <p>{video.year} <span aria-hidden="true">·</span> {video.role}</p>
        </div>
        <a className="text-link" href={video.videoUrl} target="_blank" rel="noreferrer">{ui.watchFullMusicVideo} <Arrow /></a>
      </div>
      <div className={`music-video-clips${video.clipMediaIds.length === 3 ? ' music-video-clips-three' : ''}`}>
        {video.clipMediaIds.map((id, clipIndex) => <figure key={id} data-reveal>
          <MediaFrame id={id} sizes={video.clipMediaIds.length === 3 ? '(max-width: 767px) calc(100vw - 40px), (max-width: 1370px) 30vw, 405px' : '(max-width: 767px) calc(100vw - 40px), (max-width: 1370px) 92vw, 1240px'} />
          <figcaption>{ui.bestCut} {String(clipIndex + 1).padStart(2, '0')}</figcaption>
        </figure>)}
      </div>
      {video.clipMediaIds.some(id => !media[id]) && <p role="status">{ui.imageUnavailable}</p>}
    </section>)}
  </div>;
}
