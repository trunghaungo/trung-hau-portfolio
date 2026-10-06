import { useEffect, useState } from 'react';
import { getMotionPreference, useReducedMotion } from '../motion/preference';
import release from '../config/release.json';
import { site } from '../content';

const snapshot = () => ({
  version: release.version, url: location.href, viewport: `${innerWidth} × ${innerHeight}`,
  ...getMotionPreference(), enableMotion: site.enableMotion,
  intro: document.documentElement.dataset.intro, stack: document.documentElement.dataset.stack,
  pointer: document.documentElement.dataset.pointer,
  hover: matchMedia('(hover: hover)').matches, finePointer: matchMedia('(pointer: fine)').matches,
});
export function MotionDebug() {
  const reduced = useReducedMotion();
  const [status, setStatus] = useState(snapshot);
  useEffect(() => { const timer = setTimeout(() => setStatus(snapshot()), 100); return () => clearTimeout(timer); }, [reduced]);
  return <aside className="motion-debug" aria-label="Motion diagnostics"><strong>HEW · Motion diagnostics</strong><pre>{JSON.stringify(status, null, 2)}</pre><button type="button" onClick={() => setStatus(snapshot())}>Refresh status</button><a href={location.pathname}>Close diagnostics</a></aside>;
}
