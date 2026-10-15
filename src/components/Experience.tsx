import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { profile, ui } from '../content';

export function Experience() {
  const [open, setOpen] = useState(0);
  const section = useRef<HTMLDivElement>(null);
  const count = profile.experience.length;

  useEffect(() => {
    const node = section.current;
    if (!node || count < 2) return;
    let frame = 0;
    const sync = () => {
      const travel = Math.max(1, node.offsetHeight - innerHeight);
      const progress = Math.max(0, Math.min(1, -node.getBoundingClientRect().top / travel));
      const next = Math.min(count - 1, Math.floor(progress * count));
      setOpen(current => current === next ? current : next);
    };
    const schedule = () => {
      if (frame) return;
      if (typeof requestAnimationFrame !== 'function') { sync(); return; }
      frame = requestAnimationFrame(() => { frame = 0; sync(); });
    };
    sync();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    return () => {
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [count]);

  const education = <div className="experience-education" data-reveal><div className="education-row"><span>{ui.education}</span><div><h4>{profile.education.school}</h4><p>{profile.education.course}</p></div><span>{profile.education.period}</span></div></div>;
  if (!count) return education;

  return <>
    <div className="experience-block" ref={section} data-reveal
      style={{ '--experience-travel': `${Math.max(0, count - 1) * 44}svh` } as CSSProperties}>
      <div className="experience-overview">
        <h3>{ui.experience}</h3>
        <p>{ui.experienceIntroFirst}<br />{' '}{ui.experienceIntroSecond}</p>
        <ol className="experience-index" aria-hidden="true">
          {profile.experience.map((item, index) => <li key={item.company} data-active={open === index}><span>{String(index + 1).padStart(2, '0')}</span>{item.company}</li>)}
        </ol>
      </div>
      <div className="experience-stage">
        {profile.experience.map((item, index) => <article className="experience-card" key={item.company} data-open={open === index} aria-hidden={open !== index} inert={open !== index}>
          <div className="experience-card-top"><span>{String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span><span>{item.period}</span></div>
          <h4>{item.company}</h4>
          <p className="experience-card-role">{item.role}</p>
          {item.description && <p className="experience-card-description">{item.description}</p>}
        </article>)}
        <span className="experience-status" role="status" aria-live="polite">{profile.experience[open]?.company}</span>
      </div>
    </div>
    {education}
  </>;
}
