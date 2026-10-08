import type { Page, BrowserContext } from '@playwright/test';
// Non-intro tests dismiss through the real Skip button. Session state no longer
// suppresses the production intro when reload replay is enabled.
export function dismissIntro(target: Page | BrowserContext) {
  return target.addInitScript(() => {
    const observer = new MutationObserver(() => {
      const skip = document.querySelector<HTMLButtonElement>('.intro-skip');
      if (skip) { skip.click(); observer.disconnect(); }
    });
    observer.observe(document, { childList: true, subtree: true });
  });
}
