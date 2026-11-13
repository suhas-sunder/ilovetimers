import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { spawnStaticPreview } from './preview-process.mjs';
const root=path.resolve(import.meta.dirname,'../..');process.chdir(root);
const label=process.env.ILT_EVIDENCE_LABEL||'current';
const out=`ai-issues/evidence/2026-W46/atomic-${label}`;fs.mkdirSync(out,{recursive:true});
const {chromium}=await import(pathToFileURL(process.env.ILT_PLAYWRIGHT_MODULE||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.ILT_BROWSER_PATH||path.join(os.homedir(),'AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe')});
const server=spawnStaticPreview({root,port:3064});const base='http://127.0.0.1:3064';
for(let i=0;i<100;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
const results=[];
function measure(){const e=document.querySelector('[data-primary-display-value]'),range=document.createRange();range.selectNodeContents(e);const rect=e.getBoundingClientRect(),stage=e.closest('.timer-display-surface').getBoundingClientRect();return {text:e.textContent,fontSize:getComputedStyle(e).fontSize,letterSpacing:getComputedStyle(e).letterSpacing,lineCount:range.getClientRects().length,withinStage:rect.left>=stage.left&&rect.right<=stage.right&&rect.top>=stage.top&&rect.bottom<=stage.bottom,overflow:document.documentElement.scrollWidth>innerWidth+1};}
try{
 for(const width of [320,375,390,768,1024,1440,1920])for(const theme of ['light','dark']){
  const c=await browser.newContext({viewport:{width,height:900}});await c.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());await c.addInitScript(t=>localStorage.setItem('ilt-theme-mode',t),theme);
  const p=await c.newPage();await p.goto(base+'/atomic-clock');await p.waitForTimeout(250);
  await p.getByRole('button',{name:'Freeze',exact:true}).click();const frozen=await p.locator('[data-primary-display-value]').innerText();await p.waitForTimeout(80);assert.equal(await p.locator('[data-primary-display-value]').innerText(),frozen);
  for(const ms of [true,false]){
   if(!ms)await p.getByRole('button',{name:'Hide ms',exact:true}).click();
   results.push({width,theme,ms,fullscreen:false,...await p.evaluate(measure)});
  }
  await p.getByRole('button',{name:'Show ms',exact:true}).click();await p.screenshot({path:`${out}/${width}-${theme}.png`,fullPage:false});
  await p.getByRole('button',{name:'Fullscreen',exact:true}).click();await p.waitForTimeout(100);results.push({width,theme,ms:true,fullscreen:await p.evaluate(()=>!!document.fullscreenElement),...await p.evaluate(measure)});
  await p.getByRole('button',{name:'Exit (Esc)',exact:true}).click();assert.equal(await p.evaluate(()=>!!document.fullscreenElement),false);
  await c.close();
 }
}finally{await browser.close();server.kill();fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2)+'\n');}
const failures=results.filter(r=>r.lineCount!==1||!r.withinStage||r.overflow);
console.log(JSON.stringify({cases:results.length,failures},null,2));
assert.equal(failures.length,0,'Clock value must stay one readable line inside its display');
