import { useState } from 'react';
import { profile, ui } from '../content';
import presentation from '../config/presentation.json';

export function Experience() {
  const [open, setOpen] = useState<number | null>(0);
  return <div className="experience-block" data-reveal>
    <div><h3>{ui.experience}</h3><p>{ui.experienceIntroFirst}<br />{' '}{ui.experienceIntroSecond}</p></div>
    <div className="experience-list">
      {profile.experience.map((item, index) => {
        const expandable = presentation.experienceAccordion && !!item.description;
        const expanded = !expandable || open === index;
        const identity = <><span className="experience-identity"><span className="experience-company">{item.company}</span><span className="experience-role">{item.role}</span></span><span className="experience-period">{item.period}</span></>;
        return <div className="experience-row" key={item.company} data-open={expanded}>
          {expandable ? <h4><button className="experience-toggle" id={`experience-toggle-${index}`} aria-expanded={expanded} aria-controls={`experience-panel-${index}`} onClick={() => setOpen(expanded ? null : index)} onKeyDown={event => { if (event.key === 'Escape') setOpen(null); }}>{identity}<span className="experience-sign" aria-hidden="true">{expanded ? '−' : '+'}</span></button></h4> : <div className="experience-static">{identity}</div>}
          {item.description && <div className="experience-panel" id={`experience-panel-${index}`} role={expandable ? 'region' : undefined} aria-labelledby={expandable ? `experience-toggle-${index}` : undefined} aria-hidden={!expanded} inert={!expanded}><div><p className="experience-scope">{item.description}</p></div></div>}
        </div>;
      })}
      <div className="education-row"><span>{ui.education}</span><div><h4>{profile.education.school}</h4><p>{profile.education.course}</p></div><span>{profile.education.period}</span></div>
    </div>
  </div>;
}
