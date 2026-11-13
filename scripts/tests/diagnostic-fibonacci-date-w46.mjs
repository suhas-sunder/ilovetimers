import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {pathToFileURL} from 'node:url';import {spawnStaticPreview} from './preview-process.mjs';
const root=path.resolve(import.meta.dirname,'../..');process.chdir(root);
const {chromium}=await import(pathToFileURL(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const out='ai-issues/evidence/2026-W46',label=process.env.ILT_EVIDENCE_LABEL||'before',base='http://127.0.0.1:3069',server=spawnStaticPreview({root,port:3069}),results=[];
const browser=await chromium.launch({executablePath:path.join(os.homedir(),'AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe'),headless:true});
try{for(let i=0;i<100;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 for(const width of [390,1440])for(const theme of ['light','dark']){
  const c=await browser.newContext({viewport:{width,height:900},timezoneId:'America/New_York',locale:'en-US'});await c.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());await c.addInitScript(t=>localStorage.setItem('ilt-theme-mode',t),theme);
  const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));const t=new Date('2026-11-15T04:59:57Z');await p.clock.install({time:t});await p.clock.pauseAt(t);await p.goto(base+'/fibonacci-clock');await p.waitForTimeout(150);
  results.push({route:'/fibonacci-clock',width,theme,case:'client date differs from build date; no hydration error',errors:[...errors],status:errors.length?'FAIL':'PASS'});
  await p.clock.runFor(1100);const before=await p.locator('.timer-specialty-clock-panel').first().innerText();await p.clock.runFor(4000);const after=await p.locator('.timer-specialty-clock-panel').first().innerText();
  results.push({route:'/fibonacci-clock',width,theme,case:'live date advances across local midnight',before,after,status:before.includes('November 14, 2026')&&after.includes('November 15, 2026')?'PASS':'FAIL'});await c.close();
 }
}finally{await browser.close();server.kill();fs.writeFileSync(`${out}/fibonacci-date-${label}.json`,JSON.stringify(results,null,2)+'\n');}
console.log(JSON.stringify(results,null,2));process.exitCode=results.some(r=>r.status==='FAIL')?1:0;

