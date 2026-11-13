// Audit transport guard: preserve application DOM and existing assertions while
// preventing synthetic local sessions from reaching production analytics/ads.
// Tests may register later, more-specific routes for their own mock responses.
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const pw=await import(pathToFileURL(process.env.ILT_REAL_PLAYWRIGHT_MODULE||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
function guarded(type){return new Proxy(type,{get(target,key){if(key!=='launch')return Reflect.get(target,key);return async(...args)=>{const browser=await target.launch(...args),original=browser.newContext.bind(browser);browser.newContext=async(...contextArgs)=>{const context=await original(...contextArgs);await context.route('**/*',route=>{const u=new URL(route.request().url());return ['127.0.0.1','localhost'].includes(u.hostname)||!/^https?:$/.test(u.protocol)?route.continue():route.abort();});return context;};return browser;};}});}
export const chromium=guarded(pw.chromium),webkit=guarded(pw.webkit),firefox=guarded(pw.firefox);
