import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const output='docs/film-media-preview';mkdirSync(output,{recursive:true});
const browser=await chromium.launch({executablePath:existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,args:['--no-sandbox']});
const results=[];
for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
 const context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference',...(name==='mobile'?{isMobile:true,hasTouch:true}:{}),recordVideo:{dir:'/tmp/hew-film-review',size:{width,height}}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.PORTFOLIO_PREVIEW_URL||'http://127.0.0.1:4176/');await page.getByRole('button',{name:'Skip intro'}).click();
 const banner=page.locator('.card-0 .card-image');await banner.scrollIntoViewIfNeeded();await page.waitForTimeout(500);
 if(name==='desktop')await banner.hover();else await page.locator('.card-0').getByRole('button',{name:'Preview video'}).tap();
 await page.waitForTimeout(1800);await page.screenshot({path:`${output}/${name}-preview.png`});
 const previewTime=await page.locator('.card-0 video').evaluate(v=>v.currentTime);
 await page.mouse.move(0,0);await page.goto(new URL('/work/chuyen-di-bat-y',page.url()).href);
 await page.screenshot({path:`${output}/${name}-case.png`});
 const trailer=page.locator('.film-trailer');await trailer.scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Play trailer'}).click();await page.waitForTimeout(2200);
 await page.screenshot({path:`${output}/${name}-trailer.png`});const trailerTime=await trailer.locator('video').evaluate(v=>v.currentTime);
 await trailer.getByRole('button',{name:'Stop video'}).click();
 const album=page.locator('.film-album'),view=album.locator('.film-album-viewport');
 const stageTop=await album.evaluate(el=>el.getBoundingClientRect().top+scrollY-(document.querySelector('.site-header').getBoundingClientRect().height+20));
 await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),stageTop);await page.waitForTimeout(700);
 const snapshots=[];
 const measure=async label=>snapshots.push({label,...await album.evaluate(el=>({pinned:el.dataset.pinned,scrollY,x:el.style.getPropertyValue('--album-x'),index:el.querySelector('.film-album-controls > span').textContent,left:el.querySelector('figure').getBoundingClientRect().left,overflow:document.documentElement.scrollWidth-innerWidth}))});
 await measure('start');await page.screenshot({path:`${output}/${name}-album-start.png`});
 if(name==='desktop') {
  for(let i=0;i<45;i++){await page.evaluate(()=>scrollBy({top:58,behavior:'instant'}));await page.waitForTimeout(40);}
  await measure('down');await page.screenshot({path:`${output}/${name}-album-down.png`});await page.waitForTimeout(700);
  for(let i=0;i<22;i++){await page.evaluate(()=>scrollBy({top:-58,behavior:'instant'}));await page.waitForTimeout(40);}
  await measure('up');await page.screenshot({path:`${output}/${name}-album-up.png`});
  await album.getByRole('button',{name:'Next image'}).click();await page.waitForTimeout(700);
  await album.locator('figure a').last().focus();await page.waitForTimeout(1200);
  await measure('last');await page.screenshot({path:`${output}/${name}-album-last.png`});
 } else {
  const box=await view.boundingBox();const cdp=await context.newCDPSession(page);const y=Math.max(140,Math.min(height-120,box.y+120));
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width-45,y}]});
  for(let i=1;i<=15;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:width-45-i*17,y}]});await page.waitForTimeout(30);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(700);
  await measure('swipe');await page.screenshot({path:`${output}/${name}-album-swipe.png`});
  await album.getByRole('button',{name:'Next image'}).tap();await page.waitForTimeout(750);await measure('next');
  await page.screenshot({path:`${output}/${name}-album-next.png`});
 }
 results.push({name,previewTime,trailerTime,errors,snapshots});
 await page.waitForTimeout(600);const video=page.video();await context.close();
 execFileSync('ffmpeg',['-y','-v','error','-i',await video.path(),'-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',`${output}/${name}.mp4`]);
}
await browser.close();writeFileSync(`${output}/measurements.json`,JSON.stringify(results,null,2)+'\n');
