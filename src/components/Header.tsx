import { useEffect, useRef, useState } from 'react';
import { profile, site, ui } from '../content';
import { internalClick } from '../navigation';
import { Arrow } from './Arrow';

export function Header({ routeKey }: { routeKey: string }) {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLButtonElement>(null);
  const links = useRef<HTMLElement>(null);
  useEffect(() => setOpen(false), [routeKey]);
  useEffect(() => {
    if (!open) return;
    links.current?.querySelector<HTMLElement>('a')?.focus();
    const handle = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); menu.current?.focus(); }
      if (e.key === 'Tab') {
        const controls = [menu.current, ...Array.from(links.current?.querySelectorAll<HTMLElement>('a') || [])].filter(Boolean) as HTMLElement[];
        const first = controls[0]; const last = controls[controls.length - 1];
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open]);
  return <header className={`site-header ${open ? 'menu-open' : ''}`}>
    <div className="container header-inner">
      <a className="wordmark" href="/" onClick={internalClick} aria-label={`${profile.name} — Home`}>{profile.name}<span className="wordmark-slash"> / </span><span className="alias">{profile.alias}</span><span className="brand-dot" aria-hidden="true" /></a>
      <span className="header-note">{ui.practiceLabel}</span>
      <button ref={menu} className="menu-toggle" type="button" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(value => !value)}>{open ? ui.closeMenu : ui.menu} <span aria-hidden="true">{open ? '−' : '+'}</span></button>
      <nav ref={links} id="main-nav" aria-label="Main navigation">{site.navigation.map(link => <a key={link.href} href={link.href} onClick={e => { setOpen(false); internalClick(e); }}>{link.label}<Arrow /></a>)}</nav>
    </div>
  </header>;
}
