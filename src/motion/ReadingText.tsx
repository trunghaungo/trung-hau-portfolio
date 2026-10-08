import type { CSSProperties } from 'react';

// Normal/reduced/fallback presentation is readable; full motion scrubs each word both ways.
export function ReadingText({ text }: { text: string }) {
  const words = text.split(' ');
  return <span className="reading-text" data-reading>{words.map((word, index) => <span key={index} style={{ '--word-start': index / words.length * .8 } as CSSProperties}>{word}{index < words.length - 1 ? ' ' : ''}</span>)}</span>;
}
