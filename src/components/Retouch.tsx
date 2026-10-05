import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { media, site, ui } from '../content';
import { MediaFrame } from './MediaFrame';

export function Retouch() {
  const [original, setOriginal] = useState(false);
  const [held, setHeld] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClick = useRef(false);
  const pointer = useRef<number | null>(null);
  const control = useRef<HTMLButtonElement>(null);
  const cancel = (aborted = false) => { if (timer.current) clearTimeout(timer.current); timer.current = null; setHeld(false); pointer.current = null; if (aborted) suppressClick.current = true; };
  const begin = () => {
    suppressClick.current = false;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setHeld(true); suppressClick.current = true; }, 450);
  };
  useEffect(() => {
    const reset = () => cancel(true);
    window.addEventListener('blur', reset);
    window.addEventListener('scroll', reset, { passive: true });
    document.addEventListener('visibilitychange', reset);
    return () => { if (timer.current) clearTimeout(timer.current); window.removeEventListener('blur', reset); window.removeEventListener('scroll', reset); document.removeEventListener('visibilitychange', reset); };
  }, []);
  const shownOriginal = original || held;
  const demo = media[site.retouch.originalMediaId].isPlaceholder || media[site.retouch.editedMediaId].isPlaceholder;
  function keyboardDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) begin(); }
  }
  function keyboardUp(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!suppressClick.current) setOriginal(value => !value); cancel(); suppressClick.current = false; }
  }
  return <div className="retouch">
    <div className={`compare-frame ${shownOriginal ? 'show-original' : ''}`}>
      <MediaFrame id={site.retouch.editedMediaId} />
      <div className="compare-original"><MediaFrame id={site.retouch.originalMediaId} /></div>
      <span className="compare-label" role="status" aria-live="polite">{shownOriginal ? ui.original : ui.edited}</span>
      <div className="frame-corners" aria-hidden="true" />
    </div>
    <div className="compare-controls">
      <button ref={control} type="button" className="button button-dark" aria-pressed={original} aria-describedby="compare-hint"
        onPointerDown={e => { if (e.button === 0) { pointer.current = e.pointerId; begin(); } }}
        onPointerUp={() => cancel()} onPointerLeave={() => { if (pointer.current !== null) cancel(true); }} onPointerCancel={() => cancel(true)} onBlur={() => cancel(true)}
        onKeyDown={keyboardDown} onKeyUp={keyboardUp}
        onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } setOriginal(value => !value); }}>
        {original ? ui.showEdited : ui.showOriginal} <span aria-hidden="true">⇄</span>
      </button>
      <p id="compare-hint">{ui.compareHintFirst}<br />{ui.compareHintSecond}</p>
    </div>
    {demo && <p className="placeholder-note">{ui.comparePlaceholderNote}</p>}
  </div>;
}
