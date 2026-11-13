import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../..');
process.chdir(root);
const out='ai-issues/evidence/2026-W46';
const phase=process.argv[2]||'static';
const scripts=JSON.parse(fs.readFileSync('package.json','utf8')).scripts;
const staticNames=Object.keys(scripts).filter(n=>(n.startsWith('audit:')&&!['audit:final-release'].includes(n))||['test:technical-time','test:stage6-share-presets','test:calculators','test:ui-regressions','test:sitewide-ui'].includes(n));
const phases={static:staticNames,browser:['test:stage6-browser','test:display-stability','test:adsense','test:final-browser'],analytics:['test:analytics','build'],final:['typecheck','build','audit:static-deployment','audit:final-release'],lighthouse:['test:final-lighthouse']};
phases['browser-after']=phases.browser;
phases['static-after']=phases.static;
const results=[];
const npmCli=path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
fs.mkdirSync(`${out}/logs`,{recursive:true});
// Preserve historical reports separately; freshly generated reports are copied
// into this audit's evidence without silently rewriting older dated reports.
const originals=new Map();
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const f of walk('docs')) originals.set(f,fs.readFileSync(f));
try {
 if(phase==='final'||phase==='lighthouse') {
  // Final gate must evaluate fresh evidence, not historical PASS reports.
  for(const prior of phase==='final'?['static-after','browser-after','lighthouse']:['static-after','browser-after']) {
   const folder=path.join(out,'generated-reports',prior,'docs');
   if(fs.existsSync(folder))for(const f of walk(folder)){const target=path.join('docs',path.relative(folder,f));fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(f,target);}
  }
 }
 for(const name of phases[phase]||[]) {
  const log=`${out}/logs/${phase}-${name.replaceAll(':','-')}.log`;
  const fd=fs.openSync(log,'w');const startedAt=new Date().toISOString();
  console.log('Starting',name);
  const result=spawnSync(process.execPath,[npmCli,'run',name],{cwd:root,env:{...process.env,ILT_PLAYWRIGHT_MODULE:path.join(root,'scripts/tests/diagnostic-playwright-network.mjs'),FORCE_COLOR:'0'},stdio:['ignore',fd,fd],timeout:30*60*1000,windowsHide:true});
  fs.closeSync(fd);
  results.push({name,command:`npm run ${name}`,startedAt,finishedAt:new Date().toISOString(),exitCode:result.status,error:result.error?.message,log});
  fs.writeFileSync(`${out}/suite-${phase}.json`,JSON.stringify(results,null,2)+'\n');
  console.log('Finished',name,'exit',result.status,fs.readFileSync(log,'utf8').trim().split(/\r?\n/).slice(-2).join(' | '));
 }
} finally {
 for(const f of walk('docs')) {
  const current=fs.readFileSync(f),old=originals.get(f);
  if(!old||!old.equals(current)) {const target=path.join(out,'generated-reports',phase,f);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,current);if(old)fs.writeFileSync(f,old);}
 }
}
process.exitCode=results.some(r=>r.exitCode!==0)?1:0;
