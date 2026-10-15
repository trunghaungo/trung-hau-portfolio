import { media, ui } from '../content';
import type { Project } from '../content/types';
import { MediaFrame } from './MediaFrame';

type Production = NonNullable<Project['production']>;

export function ProductionStory({ production, projectTitle }: { production: Production; projectTitle: string }) {
  const storyboard = media[production.storyboard.mediaId];
  const crew = media[production.crew.mediaId];

  return <div className="production-story">
    <section className="production-storyboard" aria-labelledby="production-storyboard-heading" data-reveal>
      <div className="production-section-heading">
        <h2 id="production-storyboard-heading">{production.storyboard.title}</h2>
        <p>{production.storyboard.description}</p>
      </div>
      <a href={storyboard.posterSrc} target="_blank" rel="noreferrer" aria-label={`${ui.openImage}: ${storyboard.caption}`}>
        <MediaFrame id={production.storyboard.mediaId} sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 48px), 1344px" />
      </a>
    </section>

    <section className="production-crew" aria-labelledby="production-crew-heading" data-reveal>
      <h2 id="production-crew-heading">{production.crew.title}</h2>
      <a href={crew.posterSrc} target="_blank" rel="noreferrer" aria-label={`${ui.openImage}: ${crew.caption}`}>
        <MediaFrame id={production.crew.mediaId} sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 48px), 1344px" />
      </a>
    </section>

    <section className="production-credits" aria-labelledby="production-credits-heading" data-reveal>
      <div className="production-credits-sheet">
        <header className="production-credits-header">
          <span>{projectTitle}</span>
          <h2 id="production-credits-heading">{production.credits.title}</h2>
          <span>{production.credits.subtitle}</span>
        </header>
        {production.credits.groups.map(group => <section className="production-credits-group" key={group.title}>
          <h3>{group.title}</h3>
          <dl>{group.entries.map(entry => <div className="production-credit" key={entry.role}>
            <dt>{entry.role}</dt>
            <dd>{entry.names.map(name => <span key={name}>{name}</span>)}</dd>
          </div>)}</dl>
        </section>)}
      </div>
    </section>
  </div>;
}
