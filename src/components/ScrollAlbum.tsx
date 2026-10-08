import { useLayoutEffect, useRef, useState } from 'react';
import { media, ui } from '../content';
import { useReducedMotion } from '../motion/preference';
import { MediaFrame } from './MediaFrame';
import { Arrow } from './Arrow';

// Native vertical scrolling drives the desktop track. The same images become a
// native horizontal scroller on touch/short windows/reduced motion/API fallback.
export function ScrollAlbum({ ids, title }: { ids: string[]; title: string }) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null), stage = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null), track = useRef<HTMLDivElement>(null);
  const current = useRef(0), go = useRef<(index: number) => void>(() => {});
  const [index, setIndex] = useState(0), [pinned, setPinned] = useState(false);
  useLayoutEffect(() => {
    const host=root.current!, panel=stage.current!, view=viewport.current!, rail=track.current!;
    const figures=Array.from(rail.querySelectorAll<HTMLElement>('figure'));
    const query=matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    let frame=0, disposed=false, pin=false, travel=0, top=0, start=0, pendingMeasure=true, geometryReady=false;
    let observer: ResizeObserver | undefined;
    const updateIndex=(x:number) => {
      const next=figures.reduce((best,figure,i) => Math.abs(figure.offsetLeft-x)<Math.abs(figures[best].offsetLeft-x)?i:best,0);
      if(current.current!==next) {current.current=next;setIndex(next);}
    };
    function measure() {
      const oldX=pin?Math.min(travel,Math.max(0,scrollY-start)):view.scrollLeft;
      const selected=current.current;
      const oldTop=panel.getBoundingClientRect().top;
      const reading=oldTop>=0 && oldTop<innerHeight*.5 && panel.getBoundingClientRect().bottom>innerHeight*.4;
      top=(document.querySelector('.site-header')?.getBoundingClientRect().height??72)+20;
      const height=Math.min(innerHeight,window.visualViewport?.height??innerHeight)-top-24;
      const next=query.matches && !reduced && height>=480 && geometryReady;
      const changed=next!==pin;
      pin=next; host.dataset.pinned=String(pin);setPinned(pin);
      if(pin) {
        host.style.setProperty('--album-height',`${height}px`);
        host.style.setProperty('--album-top',`${top}px`);
        travel=Math.max(0,rail.scrollWidth-view.clientWidth);
        host.style.height=`${height+travel}px`;
        start=host.getBoundingClientRect().top+scrollY-top;
        view.scrollLeft=0;
        if(changed && reading) scrollTo({top:start+Math.min(oldX,travel),behavior:'instant'});
      } else {
        host.style.removeProperty('height'); host.style.removeProperty('--album-x');
        host.style.removeProperty('--album-height'); host.style.removeProperty('--album-top');
        if(changed && reading) scrollTo({top:host.getBoundingClientRect().top+scrollY-top,behavior:'instant'});
        view.scrollLeft=changed && reading?figures[selected].offsetLeft:oldX;
      }
      pendingMeasure=false;
    }
    function paint() {
      frame=0;if(disposed||document.hidden)return;
      if(pendingMeasure)measure();
      const x=pin?Math.min(travel,Math.max(0,scrollY-start)):view.scrollLeft;
      if(pin) {host.style.setProperty('--album-x',`${x}px`);if(view.scrollLeft!==0)view.scrollLeft=0;}
      updateIndex(x);
    }
    function schedule(){if(!frame&&!disposed&&!document.hidden)frame=requestAnimationFrame(paint);}
    function resize(){pendingMeasure=true;schedule();}
    go.current=(i:number)=>{
      const target=figures[Math.max(0,Math.min(figures.length-1,i))];
      const x=Math.min(pin?travel:rail.scrollWidth-view.clientWidth,target.offsetLeft);
      if(pin)scrollTo({top:start+x,behavior:reduced?'instant':'smooth'});
      else view.scrollTo({left:x,behavior:reduced?'instant':'smooth'});
    };
    try { if(typeof ResizeObserver==='function'){observer=new ResizeObserver(resize);observer.observe(view);observer.observe(rail);geometryReady=true;} }
    catch { observer?.disconnect();observer=undefined;query.removeEventListener('change',resize); }
    // If observer construction fails, avoid sticky geometry and leave the native rail usable.
    if(!observer) {
      host.dataset.pinned='false';setPinned(false);pendingMeasure=false;
      host.style.removeProperty('height');host.style.removeProperty('--album-x');
    } else measure();
    paint();
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resize);
    view.addEventListener('scroll',schedule,{passive:true});query.addEventListener('change',resize);
    window.visualViewport?.addEventListener('resize',resize);document.addEventListener('visibilitychange',schedule);
    return()=>{
      disposed=true;cancelAnimationFrame(frame);observer?.disconnect();
      removeEventListener('scroll',schedule);removeEventListener('resize',resize);
      view.removeEventListener('scroll',schedule);query.removeEventListener('change',resize);
      window.visualViewport?.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',schedule);
      // Convert the current sticky position to the corresponding native image
      // before a reduced-motion/viewport change removes the tall spacer.
      const x=pin?Math.min(travel,Math.max(0,scrollY-start)):view.scrollLeft;
      const reading=pin && scrollY>=start && scrollY<=start+travel;
      host.dataset.pinned='false';host.style.removeProperty('height');host.style.removeProperty('--album-x');
      if(reading)scrollTo({top:host.getBoundingClientRect().top+scrollY-top,behavior:'instant'});
      view.scrollLeft=x;
    };
  },[ids,reduced]);
  return <div className="film-album" ref={root} data-pinned="false">
    <div className="film-album-stage" ref={stage}>
      <div className="film-album-heading"><div><h2>{title}</h2><p>{pinned?ui.galleryScrollHint:ui.gallerySwipeHint}</p></div>
        <div className="film-album-controls"><span aria-label={`${index+1} / ${ids.length}`}>{String(index+1).padStart(2,'0')} / {String(ids.length).padStart(2,'0')}</span>
          <button type="button" aria-label={ui.previousImage} disabled={index===0} onClick={()=>go.current(index-1)}><Arrow diagonal={false} /></button>
          <button type="button" aria-label={ui.nextImage} disabled={index===ids.length-1} onClick={()=>go.current(index+1)}><Arrow diagonal={false} /></button>
        </div>
      </div>
      <div className="film-album-viewport" ref={viewport}>
        <div className="film-album-track" ref={track}>{ids.map((id,i)=><figure key={id}>
          <a href={media[id].posterSrc} target="_blank" rel="noreferrer" aria-label={`${ui.openImage}: ${media[id].caption}`} onFocus={()=>{if(pinned)go.current(i);}}><MediaFrame id={id} sizes="(max-width: 767px) 90vw, 1000px" /></a>
          <figcaption><span>{String(i+1).padStart(2,'0')}</span>{media[id].caption}</figcaption>
        </figure>)}</div>
      </div>
    </div>
  </div>;
}
