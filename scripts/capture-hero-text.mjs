import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const output = 'docs/hero-text-preview';
mkdirSync(output,{recursive:true});
const browser = await chromium.launch({executablePath:existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,args:['--no-sandbox']});
const results=[];
for (const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference',...(name==='mobile'?{isMobile:true,hasTouch:true}:{}),recordVideo:{dir:'/tmp/hew-text-recordings',size:{width,height}}});
  const page=await context.newPage(); const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4176/');
  await page.getByRole('button',{name:'Skip intro'}).click();
  await page.waitForTimeout(400);
  const text=page.locator('.hero-description');
  const origin=await text.evaluate(el=>el.getBoundingClientRect().top+scrollY);
  const start=Math.max(0,origin-height*.95), end=origin-height*.25;
  await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),start);
  await page.waitForTimeout(600);
  const measurements=[];
  const sample=async label=>measurements.push({label,...await text.evaluate(el=>({scrollY,top:el.getBoundingClientRect().top,progress:el.querySelector('[data-reading]').style.getPropertyValue('--reading'),opacity:[...el.querySelectorAll('.reading-text > span')].map(word=>Number(getComputedStyle(word).opacity))}))});
  await sample('before');
  for (let pass=0;pass<2;pass++) {
    for(let i=1;i<=40;i++) {
      const from=pass===0?start:end,to=pass===0?end:start;
      await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),from+(to-from)*i/40);
      await page.waitForTimeout(65);
      if(i===20) {await sample(pass===0?'partial-down':'partial-up');await page.screenshot({path:`${output}/${name}-${pass===0?'down':'up'}.png`});}
    }
    await page.waitForTimeout(600); await sample(pass===0?'full':'reversed');
    if(pass===0) await page.screenshot({path:`${output}/${name}-full.png`});
  }
  results.push({name,viewport:{width,height},errors,measurements});
  const video=page.video();await context.close();
  execFileSync('ffmpeg',['-y','-v','error','-i',await video.path(),'-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',`${output}/${name}.mp4`]);
}
await browser.close();
writeFileSync(`${output}/motion-measurements.json`,JSON.stringify(results,null,2)+'\n');
