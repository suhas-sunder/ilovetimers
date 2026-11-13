// Diagnostic evidence collection. No deployment, account mutation, or production form submission.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { PERMANENT_REDIRECTS } from '../../app/config/redirects.js';
import { spawnStaticPreview } from './preview-process.mjs';

const root = path.resolve(import.meta.dirname, '../..');
process.chdir(root);
const out = path.join(root, 'ai-issues/evidence/2026-W46');
fs.mkdirSync(out, { recursive: true });
const read = p => fs.readFileSync(p, 'utf8');
const save = (p, data) => { fs.mkdirSync(path.dirname(path.join(out,p)), {recursive:true}); fs.writeFileSync(path.join(out,p), JSON.stringify(data,null,2)+'\n'); };
const sha = execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const manifest = JSON.parse(read('docs/route-architecture-manifest.json'));
const historic = JSON.parse(read('docs/adsense-route-inventory.json'));
const routes = [{path:'/',owner:'app/routes/home.tsx'}, ...[...read('app/routes.ts').matchAll(/\broute\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/g)].map(m=>({path:'/'+m[1],owner:'app/'+m[2]}))];
const sitemap = [...read('public/sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname.replace(/\/$/,'')||'/');
for (const r of routes) {
  const old = historic.find(x=>x.path===r.path) || {};
  const entry = manifest.find(x=>x.sourcePath===r.path);
  if(!entry || entry.indexability==='redirect') throw Error('Inventory mismatch '+r.path);
  const src = read(r.owner);
  Object.assign(r,{indexability:entry.indexability,canonical:entry.canonical,family:old.pageType||entry.overlapGroup,job:entry.retainedDistinctiveFunctionality,oldCoverage:entry.verificationTests,primitives:[...new Set([...src.matchAll(/<(PageShell|ToolHero|DisplayStage|ToolFrame|ControlGroup|SettingGroup|SettingsPanel|SettingsDrawer|SeoBand|ContentPage|Button|Field|Select)\b/g)].map(m=>m[1]))],hooks:[...new Set([...src.matchAll(/\b(use[A-Z]\w+)\(/g)].map(m=>m[1]))],protected:['/','/millisecond-timer','/analog-clock','/birthday-countdown','/date-duration-calculator'].includes(r.path)?'protected':['/clock-with-milliseconds','/atomic-clock','/seconds-timer','/utc-clock','/online-alarm-clock'].includes(r.path)?'elevated':'standard'});
}
const mode = process.argv[2] || 'inventory';
if(mode==='inventory') {
  const built=routes.filter(r=>fs.existsSync(path.join('build/client',r.path,'index.html')));
  const missing=sitemap.filter(p=>!routes.some(r=>r.path===p&&r.indexability==='indexable'));
  const omitted=routes.filter(r=>r.indexability==='indexable'&&!sitemap.includes(r.path));
  save('inventory.json',{sha,generatedAt:new Date().toISOString(),counts:{canonical:routes.length,indexable:routes.filter(r=>r.indexability==='indexable').length,noindex:routes.filter(r=>r.indexability==='noindex').length,aliases:Object.keys(PERMANENT_REDIRECTS).length,sitemap:sitemap.length,built:built.length},missing,omitted,routes,aliases:PERMANENT_REDIRECTS});
  console.log(JSON.stringify({routes:routes.length,built:built.length,missing,omitted}));
  process.exit(missing.length||omitted.length?1:0);
}

async function chain(url) {
  const steps=[];
  for(let i=0;i<8;i++) {
    const res=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(20000)});
    const html=await res.text();
    steps.push({url,status:res.status,location:res.headers.get('location'),robotsHeader:res.headers.get('x-robots-tag'),contentType:res.headers.get('content-type')});
    if(res.status>=300&&res.status<400&&res.headers.get('location')) {url=new URL(res.headers.get('location'),url).href;continue;}
    return {steps,title:html.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1],h1Count:(html.match(/<h1\b/g)||[]).length,canonical:html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1],robots:html.match(/<meta[^>]*name="robots"[^>]*content="([^"]+)"/)?.[1],ogUrl:html.match(/<meta[^>]*property="og:url"[^>]*content="([^"]+)"/)?.[1],bytes:Buffer.byteLength(html),jsonLd:[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>{try{return JSON.parse(m[1]);}catch{return {invalid:true};}})};
  }
  return {steps,error:'redirect limit'};
}
if(mode==='http') {
  const jobs=[...routes.flatMap(r=>r.path==='/'?[r.path]:[r.path,r.path+'/']),...Object.keys(PERMANENT_REDIRECTS).flatMap(p=>[p,p+'/']),'/diagnostic-w46-unknown-route','/sitemap.xml','/robots.txt'];
  let next=0;const results=[];
  await Promise.all(Array.from({length:4},async()=>{while(next<jobs.length){const p=jobs[next++];try{results.push({path:p,...await chain('https://www.ilovetimers.com'+p)});}catch(e){results.push({path:p,error:String(e)});}save('production-http.json',{sha,at:new Date().toISOString(),results});if(results.length%30===0)console.log('HTTP',results.length,'/',jobs.length);}}));
  console.log('HTTP finished',results.length);process.exit(0);
}

const playwright = await import(pathToFileURL(process.env.ILT_PLAYWRIGHT_MODULE || path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const browser = await playwright.chromium.launch({headless:true,executablePath:process.env.ILT_BROWSER_PATH||path.join(os.homedir(),'AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe')});
const production=mode==='production';
const base=production?'https://www.ilovetimers.com':'http://127.0.0.1:3061';
const server=production?null:spawnStaticPreview({root,port:3061});
if(server) {let ready=false;for(let i=0;i<100;i++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error('preview unavailable');}
const selected = process.env.ILT_DIAGNOSTIC_ROUTES ? routes.filter(r=>process.env.ILT_DIAGNOSTIC_ROUTES.split(',').includes(r.path)) : production?routes.filter(r=>r.protected!=='standard'):routes;
const combinations = production?[{width:1440,height:900,theme:'light'},{width:390,height:844,theme:'dark'}]:[{width:1440,height:900,theme:'light'},{width:390,height:844,theme:'light'},{width:1440,height:900,theme:'dark'},{width:390,height:844,theme:'dark'}];
const evidenceFile=process.env.ILT_DIAGNOSTIC_EVIDENCE_FILE || (production?'production-browser.json':mode==='smoke-after'?'local-smoke-after.json':'local-smoke.json');
const results=process.env.ILT_DIAGNOSTIC_RESUME==='1'&&fs.existsSync(path.join(out,evidenceFile))?JSON.parse(read(path.join(out,evidenceFile))).results:[];
function snapshot() {
  const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden';};
  const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
  const name=e=>e.getAttribute('aria-label')||(e.getAttribute('aria-labelledby')||'').split(/\s+/).map(id=>document.getElementById(id)?.textContent||'').join(' ').trim()||[...e.labels||[]].map(l=>l.textContent).join(' ')||e.textContent?.trim()||e.title||'';
  const main=document.querySelector('main');
  const controls=[...main?.querySelectorAll('button,input,select,textarea,[role=button],summary')||[]].filter(visible).map(e=>({tag:e.tagName,type:e.type,name:name(e).slice(0,160),value:e.value,disabled:!!e.disabled,rect:rect(e),cursor:getComputedStyle(e).cursor}));
  const stages=[...document.querySelectorAll('[data-display-stage],.timer-display-surface')].filter(visible).map(e=>({text:e.innerText?.slice(0,500),rect:rect(e)}));
  const links=[...document.querySelectorAll('a[href]')].map(e=>({href:e.getAttribute('href'),text:e.textContent?.trim().slice(0,150),visible:visible(e),main:!!e.closest('main')}));
  const headings=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible).map(e=>({level:e.tagName,text:e.textContent?.trim(),rect:rect(e)}));
  return {url:location.href,title:document.title,canonical:document.querySelector('link[rel=canonical]')?.href,robots:document.querySelector('meta[name=robots]')?.content,theme:document.documentElement.dataset.theme,overflow:document.documentElement.scrollWidth>innerWidth+1,scrollWidth:document.documentElement.scrollWidth,controls,stages,headings,links,mainText:main?.innerText?.slice(0,14000),adStatus:document.querySelector('[data-adsense-page-status]')?.dataset.adsensePageStatus,adUnits:[...document.querySelectorAll('[data-ad-placement]')].map(e=>({placement:e.dataset.adPlacement,rect:rect(e),status:e.querySelector('ins')?.dataset.adStatus,fallbackVisible:[...e.querySelectorAll('[data-ad-placeholder]')].some(visible)})),liveRegions:[...document.querySelectorAll('[aria-live]')].map(e=>({live:e.getAttribute('aria-live'),text:e.textContent?.slice(0,150)})),unnamed:controls.filter(c=>!c.name),duplicateIds:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((v,i,a)=>a.indexOf(v)!==i),performance:window.__iltDiagnosticMetrics||null};
}
async function task(page,r) {
  if(r.path==='/'||r.path.startsWith('/guides')||['/about','/contact','/author/suhas-sunder','/copyright','/how-ilovetimers-is-made','/privacy','/terms','/cookies','/sitemap'].includes(r.path)) {
    const link=page.locator('main a[href^="/"]:visible').first();
    if(!await link.count())return {kind:'reading',result:'visible content inspected; no internal primary link'};
    return {kind:'navigation',href:await link.getAttribute('href'),result:'visible and focusable',focused:await link.evaluate(e=>{e.focus();return document.activeElement===e;})};
  }
  const buttons=page.locator('main button:visible:enabled');
  for(let i=0;i<await buttons.count();i++) {
    const b=buttons.nth(i),label=((await b.getAttribute('aria-label'))||await b.innerText()).trim();
    if(!/^(start(?: timer| test)?|calculate|convert|tap|begin|set alarm|new test|add timer|run|show result)$/i.test(label))continue;
    const before=await page.locator('main').innerText();
    await b.click({timeout:4000});await page.waitForTimeout(220);
    const after=await page.locator('main').innerText();
    const stop=page.locator('main button:visible:enabled').filter({hasText:/^(Pause|Stop)$/i}).first();
    let stopped=false;if(await stop.count()){await stop.click({timeout:3000});stopped=true;}
    return {kind:'primary action',label,changed:before!==after,stopped,after:after.slice(0,900),limitation:'smoke only; domain assertions recorded separately'};
  }
  const toggle=page.locator('main input[type=checkbox]:visible:enabled').first();
  if(await toggle.count()){const before=await toggle.isChecked();await toggle.click();const changed=await toggle.isChecked()!==before;await toggle.click();return {kind:'setting',changed,restored:await toggle.isChecked()===before};}
  const input=page.locator('main input:visible:enabled,main select:visible:enabled').first();
  if(await input.count()){await input.focus();return {kind:'form',result:'default output and focusable input; domain input checks pending'};}
  return {kind:'specialized',result:'needs route-specific interaction'};
}
try {
 for(const combo of combinations) {
  const context=await browser.newContext({viewport:{width:combo.width,height:combo.height},colorScheme:'light',timezoneId:'America/New_York',reducedMotion:'no-preference'});
  const blocked=[];
  // Prevent synthetic diagnostic traffic from entering analytics. Local bulk
  // sweeps use blocked ad scripts, explicitly NOT evidence of network unfilled.
  await context.route('**/*',async route=>{const u=new URL(route.request().url());if(/posthog\.com$/.test(u.hostname)||(!production&&u.origin!==base)){blocked.push(u.origin);await route.abort();}else await route.continue();});
  await context.addInitScript(theme=>{if(theme==='dark')localStorage.setItem('ilt-theme-mode','dark');window.__iltDiagnosticMetrics={cls:0,lcp:0,longTasks:0};for(const type of ['layout-shift','largest-contentful-paint','longtask'])try{new PerformanceObserver(list=>{for(const e of list.getEntries()){if(type==='layout-shift'&&!e.hadRecentInput)window.__iltDiagnosticMetrics.cls+=e.value;if(type==='largest-contentful-paint')window.__iltDiagnosticMetrics.lcp=e.startTime;if(type==='longtask')window.__iltDiagnosticMetrics.longTasks++;}}).observe({type,buffered:true});}catch{}},combo.theme);
  for(const r of selected) {
   if(results.some(x=>x.path===r.path&&x.combo.width===combo.width&&x.combo.theme===combo.theme))continue;
   const page=await context.newPage();const errors=[],consoleErrors=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});page.on('dialog',d=>d.dismiss());
   const result={path:r.path,combo,at:new Date().toISOString(),sha,networkMode:production?'live ad requests; analytics blocked':'third parties blocked, not an unfilled-ad simulation'};
   try {
    const response=await page.goto(base+r.path,{waitUntil:'load',timeout:30000});await page.waitForTimeout(production?1800:500);
    result.status=response?.status();result.initial=await page.evaluate(snapshot);
    const file=`screens/${process.env.ILT_DIAGNOSTIC_SCREEN_FOLDER || (production?'production':mode==='smoke-after'?'local-after':'local')}/${r.path==='/'?'home':r.path.slice(1).replaceAll('/','--')}-${combo.width}-${combo.theme}.jpg`;
    fs.mkdirSync(path.dirname(path.join(out,file)),{recursive:true});await page.screenshot({path:path.join(out,file),type:'jpeg',quality:48,fullPage:true,timeout:15000});result.screenshot=file;
    if(!production)result.task=await task(page,r);
    result.errors=errors;result.consoleErrors=consoleErrors;result.blockedOrigins=[...new Set(blocked)];
    result.basicPass=result.status===200&&!result.initial.overflow&&result.initial.headings.filter(h=>h.level==='H1').length===1&&errors.length===0&&result.initial.unnamed.length===0;
   }catch(e){result.error=String(e);result.errors=errors;}
   results.push(result);save(evidenceFile,{sha,at:new Date().toISOString(),browser:browser.version(),mode,results});await page.close();
   console.log(mode,results.length,'/',selected.length*combinations.length,r.path,combo.width,combo.theme,result.error||result.basicPass);
  }
  await context.close();
 }
}finally{await browser.close();server?.kill();}
