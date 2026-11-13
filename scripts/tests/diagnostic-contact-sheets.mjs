import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));
const root=path.resolve(import.meta.dirname,'../..');process.chdir(root);
const out='ai-issues/evidence/2026-W46';
const data=JSON.parse(fs.readFileSync(`${out}/local-smoke.json`)).results;
const paths=JSON.parse(fs.readFileSync(`${out}/inventory.json`)).routes.map(r=>r.path);
fs.mkdirSync(`${out}/contacts`,{recursive:true});
for(let offset=0;offset<paths.length;offset+=6){const composites=[];
 for(let i=0;i<6&&offset+i<paths.length;i++){
  const items=data.filter(r=>r.path===paths[offset+i]);
  for(let j=0;j<items.length;j++){const r=items[j],file=path.join(out,r.screenshot),meta=await sharp(file).metadata();const crop=await sharp(file).extract({left:0,top:0,width:meta.width,height:Math.min(meta.height,r.combo.height)}).resize(360,285,{fit:'contain',background:'#888'}).toBuffer();
   composites.push({input:crop,left:j*360,top:i*315+30});
   const label=`${r.path} ${r.combo.width} ${r.combo.theme}`.replaceAll('&','&amp;');composites.push({input:Buffer.from(`<svg width="360" height="30"><rect width="360" height="30" fill="white"/><text x="5" y="20" font-size="12" fill="black">${label}</text></svg>`),left:j*360,top:i*315});
  }
 }
 await sharp({create:{width:1440,height:1890,channels:3,background:'#888'}}).composite(composites).png().toFile(`${out}/contacts/${String(offset/6+1).padStart(2,'0')}.png`);
}
console.log('22 sheets, 132 routes × 4 states; viewport crops only. Full pages retained separately.');
