"""Join fresh evidence into an exhaustive register; do not infer domain PASS from smoke."""
import csv,json,pathlib,re
root=pathlib.Path(__file__).resolve().parents[2]; out=root/'ai-issues'; ev=out/'evidence/2026-W46'
def read(name): return json.loads((ev/name).read_text(encoding='utf-8-sig'))
inv=read('inventory.json'); smoke=read('local-smoke.json')['results']; http=read('production-http.json')['results']; tz=read('timezone-hydration-before.json')['results']; functional=read('functional-corrected-baseline.json')
access=read('accessibility-before.json'); broken_tz={r['path'] for r in tz if r.get('errors')}; key_bugs={r['route'] for r in access if r.get('case')=='focused Reset Space' and r.get('runningAfterReset')}
def source_modules(owner):
    src=(root/owner).read_text(encoding='utf-8'); modules=[owner]
    for imp in re.findall(r'from ["\'](~\/clients\/components\/[^"\']+)["\']',src):
        if '/ui/' in imp: continue
        for ext in ['.tsx','.ts','.jsx','.js']:
            f='app/'+imp[2:]+ext
            if (root/f).exists():modules.append(f);break
    return modules
rows=[]
for n,r in enumerate(inv['routes']):
    path=r['path']; records=[x for x in smoke if x['path']==path]; live=next(x for x in http if x['path']==path); initial=records[0]['initial']; modules=source_modules(r['owner']); src='\n'.join((root/m).read_text(encoding='utf-8') for m in modules)
    primitives=sorted(set(re.findall(r'<(PageShell|ToolHero|DisplayStage|ToolFrame|ControlGroup|SettingGroup|SettingsPanel|SettingsDrawer|SeoBand|ContentPage|Button|Field|Select)\b',src)))
    engines=sorted(set(re.findall(r'\b(performance\.now|Date\.now|requestAnimationFrame|setInterval|setTimeout|Intl\.DateTimeFormat|useState|useReducer)\b',src)))
    math_modules=sorted(set(re.findall(r'from ["\']([^"\']*(?:Math|math|Configurations|Countdown|Timer)[^"\']*)["\']',src)))
    issues=[]
    if path in broken_tz:issues.append('ILT-D02')
    if path in ['/atomic-clock','/world-clock-with-milliseconds']:issues.append('ILT-UI09/ILT-D03')
    if path=='/hiit-timer':issues.append('ILT-F02/ILT-D05')
    if path in key_bugs:issues.append('ILT-F03/ILT-D06')
    if path!='/':issues.append('ILT-D04 (URL policy investigation)')
    if path in ['/current-local-time','/roman-numeral-clock']:issues.append('ILT-UI09 (AM/PM wraps; readable P2)')
    actual_tests=[x for x in functional if x['route']==path]
    if path in broken_tz or path in key_bugs or path in ['/atomic-clock','/world-clock-with-milliseconds','/hiit-timer']:status='VERIFIED DEFECT'
    elif len(records)!=4 or not all(x.get('basicPass') for x in records):status='NOT TESTED'
    elif path=='/free-online-timers':status='INTENTIONAL'
    else:status='PASS'
    rows.append({'path':path,'route_family':r['family'],'owner_component':'; '.join(modules),'canonical_URL':r['canonical'],'live_status':' -> '.join(str(s['status'])+' '+s['url'] for s in live['steps']),'indexability':r['indexability'],'primary_user_job':r['job'],'default_experience':(initial['stages'][0]['text'] if initial['stages'] else initial.get('mainText',''))[:400].replace('\n',' / '),'keyboard_touch_controls':'; '.join(c['name'] for c in initial['controls'][:24]),'shared_UI_primitives':'Referenced by route/module: '+', '.join(primitives),'expected_calculation_state_engine':'; '.join(math_modules+engines) or 'Static informational/navigation content','high_traffic_protection':r['protected'],'browser_viewport_theme_coverage':'Chromium 1440x900 and390x844 × light/dark; UTC/en-US and Sydney/en-GB hydration; additional cases in accessibility-before.json','observed_issue_IDs':'; '.join(issues) or 'None reproduced in scoped checks','known_test_coverage':'Fresh HTTP/meta/schema + four browser smoke cases; technical/formula/SEO/a11y/static scripts; '+('; '.join(x['name']+': '+x['status'] for x in actual_tests) or 'No additional route-specific domain assertion beyond family suite'),'remaining_gaps':'Real mobile sleep/audio/assistive technology; field p75; production semantic end-to-end for this route unless in production-browser.json; complete state-space not asserted. '+('Hydration correction and winner review outstanding.' if path in broken_tz else ''),'disposition':'Hold maturity; see named issue decisions and 2027 week record' if issues else 'Preserve current behavior; scoped smoke is not all-domain certification','audit_status':status,'visual_contact_sheet':f'evidence/2026-W46/contacts/{n//6+1:02}.png','evidence':'evidence/2026-W46/local-smoke.json; '+'; '.join(x['screenshot'] for x in records)})
with (out/'2026-W46-canonical-page-audit.csv').open('w',encoding='utf-8',newline='') as f:
    w=csv.DictWriter(f,fieldnames=rows[0]);w.writeheader();w.writerows(rows)
aliases=[]
for source,dest in inv['aliases'].items():
    states=[next(x for x in http if x['path']==p) for p in [source,source+'/']]
    aliases.append('| '+source+' | '+dest+' | '+'; '.join(' → '.join(str(s['status'])+' '+s['url'].replace('https://www.ilovetimers.com','') for s in v['steps']) for v in states)+' | preserved |')
badlinks=[]; allowed={r['path'] for r in inv['routes']}; alias_set=set(inv['aliases'])
for rec in smoke[:len(inv['routes'])]:
    for link in rec['initial']['links']:
        href=link['href']
        if href.startswith('/') and not href.startswith('//'):
            dest=href.split('?')[0].split('#')[0].rstrip('/') or '/'
            if dest in alias_set or (dest not in allowed and not re.search(r'\.(?:png|svg|jpg|ico|xml|txt|webp)$',dest)):
                badlinks.append({'route':rec['path'],'href':href,'alias':dest in alias_set})
(ev/'rendered-link-register.json').write_text(json.dumps({'routeCount':len(allowed),'findings':badlinks},indent=2)+'\n')
route_doc=f'''# 2026-W46 route and redirect register

Audit began November 12, 2026 (America/New_York). Base `54c19824b2a76da0ea671e912598fadb3214b8b9`; application source equals published main `468bda18f09812a9212b3e6a15921dd9ed013542` before repairs.

## Reconciliation

Source `app/routes.ts`, architecture manifest, generated static HTML and sitemap reconcile to **132 canonical /109 indexable /23 noindex /28 aliases**. All132 canonical build HTML files exist. XML sitemap contains109 canonical indexable paths, zero missing/extra. Fresh production HTTP register has322 requested paths:263 canonical slash variants,56 alias variants, unknown404, robots and sitemap. See [inventory](evidence/2026-W46/inventory.json), [HTTP evidence](evidence/2026-W46/production-http.json), [exhaustive CSV](2026-W46-canonical-page-audit.csv).

## Live URL signals: ILT-D04, owner decision required

All131 non-root canonical paths redirect301 to their trailing-slash final200. Both forms advertise a non-trailing canonical and OG URL. Aliases ordinarily add an extra301 through the non-trailing destination. This is a live disagreement, not merely historical GSC residue. It does **not** prove Google picked the wrong canonical or lost traffic. Root is200. Preserve existing redirects, indexability, internal paths and sitemap until an isolated URL-policy experiment has quantified risk and owner approval. Options: keep current contract with monitoring (recommended during repairs); test explicit no-slash serving privately; or plan a trailing-slash migration only with search evidence and full mapping. No migration in this branch.

Raw exports were found and independently recomputed: Google14038 clicks, page-grouped14162; Bing17644. Latest28days Google+6.3017%, Bing+18.0960%. Path-only grouping and full-URL slash normalization are separately labeled in [recalculation](evidence/2026-W46/raw-search-recalculation.json). No invented query/page join or Bing landing table. Protected routes remain unchanged except the narrow shared native-Space bug repair; their titles/H1s/URLs/default workflows are preserved.

## Discovery and support

Rendered internal href checks found **{len(badlinks)} alias/unknown candidates**; inspect [register](evidence/2026-W46/rendered-link-register.json), plus passing `audit:links` for source references. Root directory filters established alias entries before rendering. Historical ILT-UI03 is not an independently reproduced current alias-offer bug. Full footer directory and archived four-tool page intentionally preserved. Search/navigation taxonomy suggestions are proposals, not permission to remove useful routes.

Unknown path returns404. Its initial server fallback lacks normal title/H1 metadata; hydrated recovery is covered by the existing final-browser suite, whose complete result/failures are disclosed separately. Do not infer HTTP200 from client recovery. No fallback/404 routing change.

All canonical responses were collected for title,H1,canonical,robots,OG and JSON-LD. Existing SEO/schema audits were rerun. Automated consistency checks do not establish the truth of every natural-language claim or FAQ answer. No new ratings, dates, titles, credentials or pages were authored.

## Alias table (both slash forms actually requested)

| Alias | Canonical destination | Live chains, source then source/ | Disposition |
|---|---|---|---|
'''+ '\n'.join(aliases)+'\n\n## Canonical indexability\n\n'+ '\n'.join(f"- `{r['path']}` — {r['indexability']}" for r in inv['routes'])+'\n'
(out/'2026-W46-redirect-and-route-audit.md').write_text(route_doc,encoding='utf-8')
(ev/'coverage-summary.json').write_text(json.dumps({'canonical':len(rows),'smoke':len(smoke),'smokeBasicPass':sum(bool(x.get('basicPass')) for x in smoke),'timezoneCases':len(tz),'timezoneFailedCases':sum(bool(x.get('errors')) for x in tz),'timezoneAffected':sorted(broken_tz),'keyboardReproduced':sorted(key_bugs),'statusCounts':{s:sum(x['audit_status']==s for x in rows) for s in set(x['audit_status'] for x in rows)},'renderedLinkFindings':len(badlinks)},indent=2)+'\n')
print('Wrote132-row register and redirect report; all status meanings scoped, no inferred domain certification.')
