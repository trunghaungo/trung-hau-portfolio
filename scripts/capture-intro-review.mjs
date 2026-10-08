import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const out = 'docs/intro-hero-preview';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
for (const [name, width, height] of (process.env.INTRO_FRAMES_ONLY ? [] : [['desktop',1440,900],['mobile',390,844]])) {
  const context = await browser.newContext({ viewport: {width,height}, reducedMotion:'no-preference', ...(name === 'mobile' ? {hasTouch:true,isMobile:true} : {}), recordVideo:{dir:'/tmp/hew-intro-recordings',size:{width,height}} });
  const page = await context.newPage();
  await page.goto(process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4176');
  await page.locator('.intro-screen').waitFor();
  await page.locator('.intro-screen').waitFor({state:'detached'});
  await page.waitForTimeout(900);
  await page.reload();
  await page.locator('.intro-screen').waitFor();
  await page.locator('.intro-screen').waitFor({state:'detached'});
  await page.waitForTimeout(900);
  const video = page.video();
  await context.close();
  execFileSync('ffmpeg',['-y','-v','error','-i',await video.path(),'-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',`${out}/${name}.mp4`]);
}
// Capture labelled, deterministic review frames separately from the real-time video.
for (const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
  const context = await browser.newContext({viewport:{width,height}, reducedMotion:'no-preference', ...(name==='mobile'?{hasTouch:true,isMobile:true}:{})});
  const page = await context.newPage();
  await page.goto(process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4176');
  await page.locator('.intro-aperture').waitFor();
  for (const [label,fraction] of [['photo-1',.28],['photo-2',.43],['photo-3',.55]]) {
    await page.evaluate(fraction => {
      for (const a of document.querySelector('.intro-composition').getAnimations({subtree:true})) {a.pause(); a.currentTime=3400*fraction;}
      for (const a of document.querySelector('.intro-aperture').getAnimations({subtree:true})) {a.pause(); a.currentTime=Math.max(0,Number(a.effect.getTiming().duration)-3400*(1-fraction));}
    },fraction);
    await page.screenshot({path:`${out}/${name}-${label}.png`});
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.screenshot({path:`${out}/${name}-hero.png`});
  await context.close();
}
await browser.close();
