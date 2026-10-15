import { site, ui } from '../content';
import { setReducedMotion, useReducedMotion } from '../motion/preference';

export function MotionSwitch() {
  const reduced = useReducedMotion();
  if (!site.enableMotion) return null;
  return <button className="motion-switch" type="button" role="switch" aria-checked={reduced} aria-label={ui.reduceMotion} onClick={() => setReducedMotion(!reduced)}>
    <span>{ui.reduceMotion}</span><span className="motion-track" aria-hidden="true"><span /></span><span className="motion-value" aria-hidden="true">{reduced ? ui.motionOn : ui.motionOff}</span>
  </button>;
}
