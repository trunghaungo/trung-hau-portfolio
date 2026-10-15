import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { media, site, ui } from '../content';
import { Arrow } from './Arrow';
import { MediaFrame } from './MediaFrame';

export function Retouch() {
  const [index, setIndex] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const position = useRef(50);
  const touchPointer = useRef<number | null>(null);
  const pair = site.retouchPairs[index];
  const after = media[pair.afterMediaId];
  const portrait = after.height > after.width;
  const imageSizes = '(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 80vw, 1000px';

  const reveal = useCallback((value: number) => {
    const next = Math.max(0, Math.min(100, Math.round(value)));
    position.current = next;
    frame.current?.style.setProperty('--split', `${next}%`);
    frame.current?.setAttribute('aria-valuenow', String(next));
    frame.current?.setAttribute('aria-valuetext', `${next}% ${ui.original}`);
  }, []);

  const releaseTouch = useCallback(() => {
    if (touchPointer.current === null) return;
    touchPointer.current = null;
    reveal(50);
  }, [reveal]);

  useEffect(() => { reveal(50); }, [index, reveal]);
  useEffect(() => {
    const hidden = () => { if (document.hidden) releaseTouch(); };
    window.addEventListener('pointerup', releaseTouch);
    window.addEventListener('pointercancel', releaseTouch);
    window.addEventListener('blur', releaseTouch);
    window.addEventListener('scroll', releaseTouch, { passive: true });
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('pointerup', releaseTouch);
      window.removeEventListener('pointercancel', releaseTouch);
      window.removeEventListener('blur', releaseTouch);
      window.removeEventListener('scroll', releaseTouch);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, [releaseTouch]);

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    reveal((event.clientX - bounds.left) / bounds.width * 100);
  };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -10, PageUp: 10 };
    if (event.key in steps) { event.preventDefault(); reveal(position.current + steps[event.key]); }
    else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); reveal(event.key === 'Home' ? 0 : 100); }
  };

  return <div className={`retouch${portrait ? ' retouch--portrait' : ''}`}>
    <div ref={frame} className="compare-frame" role="slider" tabIndex={0}
      aria-label={ui.compareSliderLabel} aria-valuemin={0} aria-valuemax={100} aria-valuenow={50} aria-valuetext={`50% ${ui.original}`}
      style={{ aspectRatio: `${after.width} / ${after.height}`, '--split': '50%' } as CSSProperties}
      onPointerMove={move}
      onPointerDown={event => { if (event.pointerType === 'touch') { touchPointer.current = event.pointerId; reveal(100); } }}
      onKeyDown={keyboard}>
      <div className="compare-after">
        <MediaFrame id={pair.afterMediaId} sizes={imageSizes} />
        <span className="compare-tag compare-tag--after" aria-hidden="true">{ui.edited}</span>
      </div>
      <div className="compare-before">
        <MediaFrame id={pair.beforeMediaId} sizes={imageSizes} />
        <span className="compare-tag compare-tag--before" aria-hidden="true">{ui.original}</span>
      </div>
      <span className="compare-divider" aria-hidden="true"><span>↔</span></span>
    </div>
    <div className="compare-navigation">
      <span aria-live="polite">{ui.compareImageLabel} {String(index + 1).padStart(2, '0')} / {String(site.retouchPairs.length).padStart(2, '0')}</span>
      <div>
        <button type="button" aria-label={ui.previousComparison} disabled={index === 0} onClick={() => setIndex(current => current - 1)}><Arrow direction="left" /></button>
        <button type="button" aria-label={ui.nextComparison} disabled={index === site.retouchPairs.length - 1} onClick={() => setIndex(current => current + 1)}><Arrow diagonal={false} /></button>
      </div>
    </div>
  </div>;
}
