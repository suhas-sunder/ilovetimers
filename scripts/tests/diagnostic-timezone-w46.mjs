import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { spawnStaticPreview } from './preview-process.mjs';
const root=path.resolve(import.meta.dirname,'../..');process.chdir(root);
const out='ai-issues/evidence/2026-W46';
const {chromium}=await import(pathToFileURL(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const browser=await chromium.launch({headless:true,executablePath:path.join(os.homedir(),'AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe')});
const server=spawnStaticPreview({root,port:3063});const base='http://127.0.0.1:3063';
for(let i=0;i<100;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
const paths=JSON.parse(fs.readFileSync(`${out}/inventory.json`)).routes.map(r=>r.path);
const results=[];
try {
 for(const settings of [{timezoneId:'UTC',locale:'en-US'},{timezoneId:'Australia/Sydney',locale:'en-GB'}]) {
  const context=await browser.newContext({...settings,viewport:{width:390,height:844}});
  await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
  await context.addInitScript(()=>{window.__removedMain=0;new MutationObserver(ms=>{for(const m of ms)for(const n of m.removedNodes)if(n.nodeType===1&&(n.matches('main')||n.querySelector('main')))window.__removedMain++;}).observe(document,{childList:true,subtree:true});});
  for(const p of paths){const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));try{await page.goto(base+p,{waitUntil:'load'});await page.waitForTimeout(180);results.push({path:p,...settings,errors,removedMain:await page.evaluate(()=>window.__removedMain)});}catch(e){results.push({path:p,...settings,error:String(e)});}await page.close();if(results.length%20===0)console.log('Timezone',results.length);fs.writeFileSync(`${out}/timezone-hydration-before.json`,JSON.stringify({at:new Date().toISOString(),buildTimezone:Intl.DateTimeFormat().resolvedOptions().timeZone,results},null,2)+'\n');}
  await context.close();
 }
}finally{await browser.close();server.kill();}
console.log('Hydration failures',results.filter(r=>r.errors?.length).length,'of',results.length);
