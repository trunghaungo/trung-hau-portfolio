import { useEffect, useId, useRef, useState } from 'react';
import { media, ui } from '../content';
import { useReducedMotion } from '../motion/preference';
import { Arrow } from './Arrow';
import { MediaFrame } from './MediaFrame';

export function PhotoAlbum({ ids, title, allCards = false }: { ids: string[]; title: string; allCards?: boolean }) {
  const titleId = useId();
  const reduced = useReducedMotion();
  const cardIds = allCards ? ids : ids.filter(id => !media[id] || media[id].height >= media[id].width);
  const landscapeIds = allCards ? [] : ids.filter(id => media[id] && media[id].width > media[id].height);
  const [selected, setSelected] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);
  const scrollFrame = useRef(0);
  const selectionFrame = useRef(0);

  useEffect(() => () => {
    cancelAnimationFrame(scrollFrame.current);
    cancelAnimationFrame(selectionFrame.current);
  }, []);

  const select = (index: number, scroll = false) => {
    setSelected(index);
    if (!scroll || !matchMedia('(max-width: 1023px)').matches) return;
    cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(() => {
      panels.current[index]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'instant' : 'smooth' });
    });
  };

  const trackSwipe = () => {
    if (!matchMedia('(max-width: 1023px)').matches || selectionFrame.current) return;
    selectionFrame.current = requestAnimationFrame(() => {
      selectionFrame.current = 0;
      const viewport = rail.current;
      if (!viewport) return;
      const center = viewport.getBoundingClientRect().left + viewport.clientWidth / 2;
      const nearest = panels.current.slice(0, cardIds.length).reduce((best, panel, index) => {
        if (!panel) return best;
        const rect = panel.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - center);
        return distance < best.distance ? { index, distance } : best;
      }, { index: 0, distance: Infinity });
      setSelected(nearest.index);
    });
  };

  const active = Math.min(selected, Math.max(0, cardIds.length - 1));

  return <section className={`photo-album case-gallery${allCards ? ' photo-album--all-cards' : ''}`} aria-labelledby={titleId}>
    <div className="gallery-heading photo-album-heading">
      <h2 id={titleId}>{title}</h2>
      {cardIds.length > 1 && <div className="photo-album-controls">
        <button type="button" aria-label={ui.previousImage} disabled={active === 0} onClick={() => select(active - 1, true)}><Arrow diagonal={false} /></button>
        <button type="button" aria-label={ui.nextImage} disabled={active === cardIds.length - 1} onClick={() => select(active + 1, true)}><Arrow diagonal={false} /></button>
      </div>}
    </div>
    {cardIds.length > 0 && <div className="photo-album-grid" ref={rail} onScroll={trackSwipe}>
      {cardIds.map((id, index) => {
        const asset = media[id];
        return <figure key={id} ref={node => { panels.current[index] = node; }} className={active === index ? 'is-active' : undefined} onPointerMove={event => { if (active !== index && (event.pointerType === 'mouse' || event.pointerType === 'pen') && matchMedia('(min-width: 1024px) and (hover: hover)').matches) select(index); }}>
          {asset ? <a href={asset.posterSrc} target="_blank" rel="noreferrer" aria-label={`${ui.openPhoto}: ${asset.alt}`} aria-current={active === index ? 'true' : undefined} onFocus={() => select(index, true)}>
            <MediaFrame id={id} sizes="(max-width: 1023px) 82vw, 50vw" />
          </a> : <MediaFrame id={id} />}
        </figure>;
      })}
    </div>}
    {landscapeIds.map(id => {
      const asset = media[id];
      return <figure className="photo-album-landscape" key={id} data-reveal>
        <a href={asset.posterSrc} target="_blank" rel="noreferrer" aria-label={`${ui.openPhoto}: ${asset.alt}`}><MediaFrame id={id} sizes="(max-width: 1023px) 92vw, 960px" /></a>
        {asset.caption && <figcaption>{asset.caption}</figcaption>}
      </figure>;
    })}
  </section>;
}
