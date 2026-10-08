import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { profile, projects, media, site, ui } from './content';
import type { Project } from './content/types';
import { backToWork, internalClick, useRoute } from './navigation';
import { MotionDebug } from './components/MotionDebug';
import { Header } from './components/Header';
import { MediaFrame, VideoControl } from './components/MediaFrame';
import { ScrollAlbum } from './components/ScrollAlbum';
import { Retouch } from './components/Retouch';
import { Arrow } from './components/Arrow';
import { Mark } from './components/Mark';
import { Experience } from './components/Experience';
import presentation from './config/presentation.json';
import { Intro, useIntro } from './motion/Intro';
import { ReadingText } from './motion/ReadingText';
import { MotionText } from './motion/MotionText';
import { usePageMotion } from './motion/usePageMotion';

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) { return <p className="section-label"><span className="section-number">{number}</span>{children}</p>; }

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false);
  const card = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (!project.trailerMediaId) return;
    const surface=card.current?.querySelector<HTMLElement>('.project-surface');
    const image=card.current?.querySelector<HTMLElement>('.card-image');
    if (!surface || !image) return;
    const position=()=>{
      let y=image.offsetHeight, node:HTMLElement|null=image;
      while(node && node!==surface){y+=node.offsetTop;node=node.offsetParent as HTMLElement|null;}
      surface.style.setProperty('--film-preview-y',`${y}px`);
    };
    position();let observer:ResizeObserver|undefined;
    try {if(typeof ResizeObserver==='function'){observer=new ResizeObserver(position);observer.observe(image);observer.observe(surface);}}catch{observer?.disconnect();}
    return()=>{observer?.disconnect();surface.style.removeProperty('--film-preview-y');};
  },[project.trailerMediaId]);
  return <article ref={card} className={`project-card card-${index % 6}`} data-tone={presentation.projectTones[index % presentation.projectTones.length]} onPointerEnter={e => { if (!project.trailerMediaId && e.pointerType === 'mouse') setHovered(true); }} onPointerLeave={() => setHovered(false)}>
    <div className="project-surface">
    <a className="project-link" id={`project-${project.slug}`} href={`/work/${project.slug}`} onClick={event => internalClick(event, `media-${project.coverMediaId}`)}>
      <div className="project-heading" data-reveal>
        <div className="project-meta"><span>{project.kind}</span>{project.year && <span>{project.year}</span>}</div>
        <div className="card-heading"><h3 lang={project.titleLanguage}><MotionText text={project.title} /></h3></div>
        {project.alternateTitle && project.alternateTitle !== project.title && <p className="card-alternate-title" lang="en">{project.alternateTitle}</p>}
      </div>
        {(project.role || project.recognition?.length) ? <div className="project-credits">
          {project.role && <p className="card-credit"><span className="credit-label">{ui.roleLabel}</span>{project.role}</p>}
          {project.recognition?.length ? <div className="card-recognition"><p className="credit-label">{ui.filmRecognition}</p>{project.recognition.map(item => <p className="recognition-tag" key={item.label}><Mark /> {item.label}</p>)}</div> : null}
        </div> : null}
      <div className="card-image" data-reveal="media" onPointerEnter={e=>{if(project.trailerMediaId && e.pointerType==='mouse')setHovered(true);}} onPointerLeave={()=>{if(project.trailerMediaId)setHovered(false);}}><MediaFrame id={project.coverMediaId} /><span className="open-project" aria-hidden="true"><Arrow /><span>{ui.openProject}</span></span></div>
      <p className="card-summary">{project.summary}</p>
      <span className="project-open">{ui.openProject} <Arrow /></span>
      <span className="project-number" aria-hidden="true">({String(index + 1).padStart(2, '0')})</span>
    </a>
    <VideoControl id={project.coverMediaId} preview hovered={hovered} />
    </div>
  </article>;
}

function Home() {
  return <>
    <section className="hero hero-editorial" aria-labelledby="hero-title">
      <div className="hero-topline container"><p className="eyebrow"><span className="short-line" aria-hidden="true" />{profile.hero.eyebrow}</p><p className="location">{profile.location}</p></div>
      <div className="hero-stage">
        <div className="hero-identity container">
          <h1 id="hero-title" className="hero-name" tabIndex={-1}><MotionText text={profile.name} /><span className="hero-alias"> / {profile.alias}</span></h1>
          <p className="hero-role">{profile.role}</p>
        </div>
        <div className="hero-visual"><div className="hero-frame"><MediaFrame id={site.heroMediaId} eager sizes="100vw" /></div></div>
        <div className="hero-stage-foot container">
          <div className="hero-actions"><a className="button button-dark" href="/#work" onClick={internalClick}>{profile.hero.primaryAction}<Arrow diagonal={false} /></a><a className="text-link" href="/#contact" onClick={internalClick}>{profile.hero.secondaryAction}<Arrow /></a></div>
          <a href="/#work" onClick={internalClick} className="hero-scroll">{ui.scrollPrompt}<Arrow diagonal={false} /></a>
        </div>
      </div>
      <div className="hero-copy container">
        <p className="hero-caption">{ui.heroCaption}<br />{' '}{profile.alias}<span>{ui.heroFormats}</span></p>
        <p className="hero-description"><ReadingText text={profile.tagline} /></p>
      </div>
      <div className="hero-bottom container"><span>{ui.heroNote}</span><span aria-hidden="true">{profile.alias} / 01</span></div>
    </section>

    <section className="work-section work-editorial" id="work" tabIndex={-1} aria-labelledby="work-title">
      <div className="container">
        <div className="section-heading" data-reveal><div><SectionLabel number="01">{ui.workLabel}</SectionLabel><h2 id="work-title"><MotionText text={ui.workTitleFirst} /><br /><span className="muted-heading" data-drift><MotionText text={ui.workTitleSecond} /></span></h2></div><div className="work-intro"><p>{profile.workIntro}</p><span className="work-count">{String(projects.length).padStart(2, '0')} {ui.workCountLabel}</span></div></div>
        <div className="work-grid">{projects.map((p, index) => <ProjectCard key={p.slug} project={p} index={index} />)}</div>
        {projects.length === 0 && <p className="empty-work">{ui.emptyWork} <a href="/#contact" onClick={internalClick}>{ui.getInTouch} <Arrow /></a></p>}
        <div className="work-footer"><span>{ui.workEndNote}</span><a href="/#contact" onClick={internalClick}>{ui.projectPrompt} <Arrow /></a></div>
      </div>
    <section className="portraits-section container" aria-labelledby="portraits-title">
      <div className="section-heading" data-reveal><div><SectionLabel number="02">{ui.portraitsLabel}</SectionLabel><h2 id="portraits-title"><MotionText text={ui.portraitsTitleFirst} /><br /><MotionText text={ui.portraitsTitleSecond} /></h2></div><div><p>{profile.portraitsIntro}</p><p className="small-intro">{ui.portraitsHint}</p></div></div>
      <div className="portraits-grid" data-reveal><Retouch /><div className="portrait-pair">{site.portraitMediaIds.map((id, index) => <figure key={id}><MediaFrame id={id} /><figcaption>{ui.portraitStudy} / {String(index + 1).padStart(2, '0')}{media[id]?.isPlaceholder ? ` · ${ui.placeholder}` : ''}</figcaption></figure>)}</div></div>
    </section>

    </section>

    <section className="about-section container" id="about" tabIndex={-1} aria-labelledby="about-title">
      <div className="about-intro"><div className="about-image" data-reveal="media"><MediaFrame id={site.aboutMediaId} /><p className="image-caption">{ui.aboutCaption}</p></div><div className="about-copy" data-reveal><SectionLabel number="03">{ui.aboutLabel}</SectionLabel><h2 id="about-title"><MotionText text={ui.aboutTitleFirst} /><br /><MotionText text={ui.aboutTitleSecond} /></h2>{profile.bio.map(p => <p className="bio" key={p}>{p}</p>)}<a className="text-link" href={`mailto:${profile.contact.email}`}>{ui.sayHello} <Arrow /></a></div></div>
      <Experience />
    </section>

    <section className="approach-section container" aria-labelledby="approach-title">
      <div className="section-heading" data-reveal><div><SectionLabel number="04">{ui.approachLabel}</SectionLabel><h2 id="approach-title"><MotionText text={ui.approachTitle} /></h2></div></div>
      <div className="approach-grid">{profile.approach.map((step, index) => <article key={step.title} data-reveal><span className="step-number">0{index + 1} <Arrow diagonal={index === 2} /></span><h3>{step.title}</h3><p>{step.body}</p></article>)}</div>
      <div className="tools-row" data-reveal><span>{ui.toolsLabel}</span><div>{profile.tools.map(tool => <span key={tool}>{tool}</span>)}</div></div>
    </section>
    <Contact />
  </>;
}

function Contact() {
  return <section className="contact-section contact-editorial" id="contact" tabIndex={-1} aria-labelledby="contact-title"><div className="container" data-reveal>
    <SectionLabel number="05">{ui.contactLabel}</SectionLabel>
    <div className="contact-heading">{presentation.contactImage && <span className="contact-image" aria-hidden="true"><img src={media[site.contactMediaId]?.posterSrc} srcSet={media[site.contactMediaId]?.srcSet} sizes="100vw" width="180" height="132" alt="" loading="lazy" /></span>}<h2 id="contact-title"><MotionText text={profile.contact.heading} /></h2><Arrow className="contact-arrow" /></div>
    <a className="contact-email" href={`mailto:${profile.contact.email}`}>{profile.contact.email}<Arrow /></a>
    <div className="contact-details"><a href={`tel:${profile.contact.phoneLink}`}>{profile.contact.phone}</a><div>{profile.contact.socials.map(s => <a key={s.label} href={s.url} target="_blank" rel="noreferrer">{s.label} <Arrow /></a>)}</div><span>{profile.location}</span></div>
  </div></section>;
}

function CasePage({ project }: { project: Project }) {
  const index = projects.findIndex(p => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length];
  return <>
    <section className="case-intro container">
      <a className="text-link back-link" href="/#work" onClick={backToWork}><span aria-hidden="true">←</span> {ui.backToWork}</a>
      <p className="section-label"><span className="section-number">{String(index + 1).padStart(2, '0')}</span>{project.kind}</p>
      <div className="case-heading" data-reveal><div><h1 tabIndex={-1} lang={project.titleLanguage}><MotionText text={project.title} /></h1>
      {project.alternateTitle && project.alternateTitle !== project.title && <p className="case-title-vi">{project.alternateTitle}</p>}</div><span className="case-number" aria-hidden="true">({String(index + 1).padStart(2, '0')})</span></div>
      <div className="case-metadata"><span>{project.kind}</span>{project.year && <span>{project.year}</span>}{project.role && <span>{ui.roleLabel}: {project.role}</span>}</div>
      <MediaFrame id={project.coverMediaId} eager transition />
      {!project.trailerMediaId && <VideoControl id={project.coverMediaId} />}
    </section>
    <section className="case-content container">
      {project.overview && <div className="case-text-block" data-reveal><h2>{ui.overview}</h2><p>{project.overview}</p></div>}
      {project.trailerMediaId && <section className="film-trailer" aria-labelledby="trailer-heading"><h2 id="trailer-heading">{ui.trailer}</h2><VideoControl id={project.trailerMediaId} label={ui.playTrailer} showPoster /></section>}
      {project.recognition?.length ? <div className="case-recognition" data-reveal><Mark /><div><p className="eyebrow">{ui.filmRecognition}</p>{project.recognition.map(item => <div key={item.label}><h2>{item.label}</h2>{item.description && <p className="award-description">{item.description}</p>}<a className="text-link" href={item.sourceUrl} target="_blank" rel="noreferrer">{ui.awardCoverage} <Arrow /></a></div>)}</div></div> : null}
      {project.galleryMediaIds.length > 0 && (project.galleryLayout === 'scroll' ? <ScrollAlbum ids={project.galleryMediaIds} title={project.galleryTitle || ui.galleryFrames} /> : <div className="case-gallery"><div className="gallery-heading"><h2>{project.kind.toLowerCase().includes('photo') ? ui.galleryPhotos : ui.galleryFrames}</h2>{project.galleryMediaIds.some(id => media[id]?.isPlaceholder) && <p>{ui.galleryPlaceholderNote}</p>}</div><div className={`gallery-grid ${project.slug === 'short-form' ? 'gallery-vertical' : ''}`}>{project.galleryMediaIds.map(id => <figure key={id} data-reveal><MediaFrame id={id} /><figcaption>{media[id]?.caption || ui.selectedFrame}{media[id]?.isPlaceholder ? ` · ${ui.placeholder}` : ''}</figcaption><VideoControl id={id} /></figure>)}</div></div>)}
      {project.contributions?.length ? <div className="case-text-block" data-reveal><h2>{ui.contribution}</h2><ul>{project.contributions.map(c => <li key={c}>{c}</li>)}</ul></div> : null}
      {project.decisions?.length ? <div className="case-decisions" data-reveal><h2>{ui.decisions}</h2>{project.decisions.map(d => <article key={d.title}><h3>{d.title}</h3><p>{d.body}</p>{d.mediaId && <MediaFrame id={d.mediaId} />}</article>)}</div> : null}
      <div className="case-next" data-reveal>{next && next.slug !== project.slug ? <><p className="eyebrow">{ui.nextProject}</p><a href={`/work/${next.slug}`} onClick={internalClick}><span>{next.title}</span><Arrow /></a></> : <a href="/#work" onClick={backToWork}>{ui.backToWork} <Arrow /></a>}<a className="text-link" href="/#contact" onClick={internalClick}>{ui.getInTouch} <Arrow /></a></div>
    </section>
  </>;
}

function NotFound() { return <section className="not-found container"><p className="eyebrow">{ui.notFoundLabel}</p><h1 tabIndex={-1}>{ui.notFoundTitleFirst}<br />{ui.notFoundTitleSecond}</h1><p>{ui.notFoundBody}</p><a className="button button-dark" href="/#work" onClick={internalClick}>{ui.backToWork} <Arrow diagonal={false} /></a></section>; }

export function App() {
  const route = useRoute();
  const intro = useIntro(route.path);
  usePageMotion(route.key, intro.active);
  const project = projects.find(p => route.path === `/work/${p.slug}`);
  const home = route.path === '/';
  useEffect(() => {
    document.documentElement.lang = site.language;
    document.title = home ? `${site.siteTitle} — ${profile.role}` : project ? `${project.title} — ${site.siteTitle}` : `Page not found — ${site.siteTitle}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', project?.summary || site.description);
  }, [home, project, route.key]);
  return <>
    {intro.active && <Intro finish={intro.finish} />}
    <div className="site-shell" inert={intro.active}>
    <a className="skip-link" href="#main">{ui.skipContent}</a>
    <Header routeKey={route.key} />
    {new URLSearchParams(location.search).get('motionDebug') === '1' && <MotionDebug />}
    <main id="main" tabIndex={-1} key={route.path} className="page-enter">{home ? <Home /> : project ? <CasePage project={project} /> : <NotFound />}</main>
    <footer className="site-footer container"><a href="/" onClick={internalClick}>{profile.name} / {profile.alias}</a><span>© {new Date().getFullYear()}</span><a href={home ? '/#hero-title' : '/'} onClick={internalClick}>{ui.backToTop} <span aria-hidden="true">↑</span></a></footer>
    </div>
  </>;
}
