export function Arrow({ diagonal = true, direction, className = '' }: { diagonal?: boolean; direction?: 'left' | 'up'; className?: string }) {
  return <svg className={`arrow ${className}`} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ transform: direction === 'left' ? 'rotate(180deg)' : direction === 'up' ? 'rotate(-90deg)' : undefined }}>
    <path d={diagonal && !direction ? 'M5 19 19 5M5 5h14v14' : 'M4 12h16m-7-7 7 7-7 7'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
