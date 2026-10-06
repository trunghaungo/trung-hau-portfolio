import type { CSSProperties } from 'react';

// The underlying text always remains readable; scroll only deepens the ink.
export function ReadingText({ text }: { text: string }) {
  const words = text.split(' ');
  return <span className="reading-text" data-reading>{words.map((word, index) => <span key={index} style={{ '--word-start': index / words.length } as CSSProperties}>{word}{index < words.length - 1 ? ' ' : ''}</span>)}</span>;
}
