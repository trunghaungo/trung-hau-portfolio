import type { CSSProperties } from 'react';

/** Keep the accessible text intact; masks affect only its visual presentation. */
export function MotionText({ text }: { text: string }) {
  return <span className="motion-words">{text.split(' ').map((word, index, words) => <span key={index}><span className="word-mask"><span style={{ '--word-delay': `${Math.min(index, 7) * 35}ms` } as CSSProperties}>{word}</span></span>{index < words.length - 1 ? ' ' : ''}</span>)}</span>;
}
