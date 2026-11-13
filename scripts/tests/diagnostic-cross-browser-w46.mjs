import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {spawnStaticPreview} from './preview-process.mjs';
const root=path.resolve(import.meta.dirname,'../..');process.chdir(root);
const {firefox,webkit}=await import(pathToFileURL(process.env.ILT_CROSS_BROWSER_MODULE||path.join(os.homedir(),'AppData/Local/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright/index.mjs')).href);
const legacy=await import(pathToFileURL(process.env.ILT_WEBKIT_MODULE||path.join(os.homedir(),'AppData/Local/npm-cache/_npx/8d2e8001be657ecc/node_modules/playwright/index.mjs')).href);
const out='ai-issues/evidence/2026-W46',base='http://127.0.0.1:3068',server=spawnStaticPreview({root,port:3068}),results=[];
for(let i=0;i<100;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
const routes=process.env.ILT_CROSS_BROWSER_ROUTES?.split(',')||['/countdown-timer','/millisecond-timer','/atomic-clock','/world-clock-with-milliseconds','/hiit-timer','/speedcubing-timer','/free-online-timers'];
try{
 for(const [engine,type] of [['firefox',firefox],['webkit',legacy.webkit]]){
  const browser=await type.launch({headless:true});
  try{for(const width of [390,1440])for(const theme of ['light','dark']){
   const context=await browser.newContext({viewport:{width,height:900},timezoneId:'America/New_York',reducedMotion:'reduce'});
   await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
   await context.addInitScript(t=>localStorage.setItem('ilt-theme-mode',t),theme);
   for(const route of routes){const p=await context.newPage(),errors=[];p.setDefaultTimeout(5000);p.on('pageerror',e=>errors.push(e.message));const r={route,engine,version:browser.version(),width,theme};
    try{assert.equal((await p.goto(base+route)).status(),200);await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
     const start=p.getByRole('button',{name:'Start',exact:true}).first();
     if(await start.count()){await start.focus();await p.keyboard.press('Space');await p.waitForTimeout(100);const pause=p.getByRole('button',{name:/^(Pause|Stop)$/,exact:true});assert.ok(await pause.count()>0,'native Start');await pause.first().focus();await p.keyboard.press('Space');const reset=p.getByRole('button',{name:/^Reset(?: all)?$/,exact:true}).first();await reset.focus();await p.keyboard.press('Space');await p.waitForTimeout(100);assert.equal(await pause.count(),0,'Reset remains stopped');}
     if(route==='/world-clock-with-milliseconds'){await p.getByLabel('24-hour',{exact:false}).first().uncheck();r.geometry=await p.locator('.timer-list-value').evaluateAll(es=>es.map(e=>{const range=document.createRange();range.selectNodeContents(e);return {text:e.textContent,lines:range.getClientRects().length,width:e.getBoundingClientRect().width,parentWidth:e.parentElement.getBoundingClientRect().width,font:getComputedStyle(e).fontSize,family:getComputedStyle(e).fontFamily,style:e.getAttribute('style')};}));assert.ok(r.geometry.every(x=>x.lines===1),'clock values one line');}
     if(route==='/speedcubing-timer'){await p.getByRole('button',{name:'Fullscreen',exact:true}).click();await p.getByRole('button',{name:'Start',exact:true}).click();assert.equal(await p.getByRole('button',{name:'Stop',exact:true}).count(),1);await p.getByRole('button',{name:'Stop',exact:true}).click();await p.getByRole('button',{name:'Exit (Esc)',exact:true}).click();}
     assert.deepEqual(errors,[]);r.status='PASS';
    }catch(e){r.status='FAIL';r.error=String(e);}r.errors=errors;
    if((width===390&&theme==='dark')||(width===1440&&theme==='light')){r.screenshot=`screens/cross-browser/${engine}-${route.slice(1)}-${width}-${theme}.png`;fs.mkdirSync(path.dirname(`${out}/${r.screenshot}`),{recursive:true});await p.screenshot({path:`${out}/${r.screenshot}`});}
    results.push(r);fs.writeFileSync(`${out}/cross-browser-final.json`,JSON.stringify(results,null,2)+'\n');console.log(engine,width,theme,route,r.status,r.error||'');await p.close();
   }await context.close();
  }}finally{await browser.close();}
 }
}finally{server.kill();}
assert.equal(results.filter(r=>r.status==='FAIL').length,0);console.log('Cross-browser cases:',results.length);
