"""Regenerate the diagnostic documents, apply final receipts, and check local links."""
import csv,json,pathlib,re,runpy
root=pathlib.Path(__file__).resolve().parents[2]
out=root/'ai-issues';ev=out/'evidence/2026-W46'
for name in ['diagnostic-report-w46.py','diagnostic-plan-2027.py','diagnostic-narratives-w46.py']:
    runpy.run_path(str(pathlib.Path(__file__).with_name(name)))
def load(name,default=None):
    p=ev/name
    return json.loads(p.read_text(encoding='utf-8-sig')) if p.exists() else default
def append(name,text):
    p=out/name;p.write_text(p.read_text(encoding='utf-8')+'\n'+text,encoding='utf-8')
after=load('local-smoke-after.json',{}).get('results',[])
targeted=load('local-targeted-final.json',{}).get('results',[])
cross=load('cross-browser-final.json',[])
reg=load('fix-regressions-after.json',[])
def counts(rows,key='status'):
    return f"{sum(bool(r.get('basicPass')) if key=='basicPass' else r.get(key)=='PASS' for r in rows)}/{len(rows)}"
append('2026-W46-diagnostic-findings.md',f'''## Final keyboard and fullscreen follow-up

The expanded sweep found two additional native-Space failures: the archived four-timer wrapper and speedcubing's window-level keyup listener. ILT-D06 now includes narrow guards in those existing handlers. The archived four-tool layout, controls, timing engines and storage remain intact; this is a keyboard repair, not an archive redesign. Evidence: [expanded red run](evidence/2026-W46/fix-regressions-expanded-before.json), [final regression run](evidence/2026-W46/fix-regressions-after.json).

**ILT-D09 / P1 / existing ILT-F03:** in `/speedcubing-timer`, enter fullscreen in the default hold-to-start mode and click Start. The button previously did nothing because its handler only stopped an active solve. The faithful red assertion reproduced this. The fix gives the explicit fullscreen Start button the same reset-and-start behavior as the normal Start button. Background hold/release remains separate and is regression-tested; session saving is unchanged. Worst risk: changing the deliberate hold workflow. The patch only changes explicit button activation and retains the 250 ms background arming path. Disposition: implemented, proposed W01 owner acceptance, not production-approved.

The first hold-to-start test incorrectly matched `Armed` case-sensitively against rendered `ARMED`. That assertion was corrected to ignore case; it was not a product defect. Final focused matrix: **{counts(reg)}**, including the hold/release and fullscreen cases. Review the actual receipt for any remaining failure.
''')
fib=load('fibonacci-date-after.json',[])
append('2026-W46-diagnostic-findings.md',f'''## ILT-D02 contained date subcase repaired

The after sweep was **524/528**, with four Fibonacci Clock hydration failures after the local date changed. Its date label called `new Date()` during render and memoized only on zone, independently of the loader-seeded clock. A controlled future-date test also showed its decimal time crossing midnight while its date stayed on the previous day: [8 failing assertions](evidence/2026-W46/fibonacci-date-before.json). The narrow repair formats the existing `now` state and includes it in the memo dependencies. It changes no tile algorithm, timezone selection, metadata or controls. Final result: **{counts(fib)}** in [the date regression](evidence/2026-W46/fibonacci-date-after.json). Cross-locale/timezone differences remain open under ILT-D02; this partial repair does not close the 46-route issue.

The world-clock typography follow-up found a transient old font size when toggling 24-hour to 12-hour time in Firefox/WebKit. The row now reserves at least the 15-character 12-hour width in either mode, avoiding a font-size transition on that toggle. The first two cross-browser receipts are retained. This is a localized extension of ILT-D03, not a shared font-fitting rewrite.

The initial Fibonacci fixture advanced the device into 2030 and also exposed a footer-year mismatch (`Footer.tsx` reads the current year during render). The final red/green fixture stays within 2026 to isolate the date-label repair. The original future-year receipts are retained. Footer year rollover is a source-backed extension of the initial-render risk and belongs to W02/W06; the footer was not changed in this pass.
''')
append('2026-W46-diagnostic-findings.md','''## ILT-D11 / P1 dependency release risk — needs owner choice

The final dependency audit reports two high package entries (`react-router` and `@react-router/node`) and one critical entry (`dompurify`, transitive through PostHog). This is not a reproduced site exploit. React Router's advisory concerns absent RSC APIs; its existing exception uses an obsolete npm numeric advisory ID. DOMPurify's reported modes were not found in app-owned use, and the relevant PostHog features are disabled. No blanket dependency upgrade or new exception was applied. Exact advisory links, versions, reachability evidence and limits are in [the triage record](evidence/2026-W46/dependency-reachability.md). This is a release hold before W01 acceptance: owner review must choose a documented applicability decision or an isolated patched-dependency candidate with full validation.
''')
append('2027-weekly-release-manifest.md','''## Dependency release hold

| Issue | Single disposition | Gate |
|---|---|---|
| ILT-D11 / dependency advisories and applicability | NEEDS OWNER CHOICE before W01 acceptance | Review exact reachability or a minimal patched-dependency candidate; no broad audit-fix command, major framework upgrade or automatic exception. See the diagnostic triage record. |
''')
append('2027-weekly-plans/2027-W01.md','''## Blocking dependency review

ILT-D11 must be resolved or explicitly accepted on exact applicability evidence before this candidate is approved. The diagnostic documents React Router advisory-ID drift and DOMPurify through disabled PostHog features; it does not claim the dependency audit is green or that every path is unreachable. No automatic dependency upgrade is authorized by this weekly record.
''')
append('2026-W46-functional-test-matrix.md',f'''## Final build coverage and runtime reconciliation

- Shared-change after sweep: **{counts(after,'basicPass')}** mobile/desktop/light/dark cases. Final targeted reruns cover archive, speedcubing, Fibonacci and world milliseconds: **{counts(targeted,'basicPass')}** in [targeted final smoke](evidence/2026-W46/local-targeted-final.json). No build was changed during either sweep.
- Changed-route Firefox/WebKit checks: **{counts(cross)}**, across seven affected routes, 390/1440 px, light/dark, native Start/Pause/Reset, world-clock value wrapping and cubing fullscreen. [Receipt](evidence/2026-W46/cross-browser-final.json).
- The first WebKit attempt used an incompatible runtime and stalled. The matching cached Playwright 1.59.1 runtime subsequently passed all six existing WebKit checks. No browser/package upgrade was installed. The final additional matrix uses matching cached runtimes for Firefox 1522 and WebKit 2272. Two exploratory WebKit 2287 runs completed their observations but stalled during teardown; only those verified owned test process trees were stopped. The final run exits normally with the four disclosed Firefox hydration failures. The old report's hardcoded “Firefox not installed” sentence is superseded by this actual run, not treated as evidence.
- A static-after sitewide run reached another local project on occupied port 3013. Its failures are invalid site evidence and preserved in the log. The harness now checks the expected homepage canonical, detects server exit and accepts an explicit isolated port. Rerunning on 3083 passed all 132 canonical and 28 redirect checks: [log](evidence/2026-W46/logs/sitewide-isolated-after.log). No unrelated process was terminated.
- Reproduce the final focused checks with `node scripts/tests/diagnostic-functional-w46.mjs`, `node scripts/tests/diagnostic-fix-regressions.mjs`, `node scripts/tests/diagnostic-cross-browser-w46.mjs` and `node scripts/tests/atomic-clock-legibility.mjs`. Use `ILT_EVIDENCE_LABEL=after` for the labeled scripts. Cached runtime paths are documented in source and can be overridden for the cross-browser runner.
- Fibonacci date regression: **{counts(fib)}**; the final targeted smoke includes this route and the final world-clock typography revision. The original 524/528 receipt is preserved rather than rewritten.
''')
append('2026-W46-visual-a11y-audit.md',f'''## Final rendered review

The repaired 1440 px atomic and world-millisecond images were opened and visually inspected: complete numeric values remain on one line, with readable controls and the existing content hierarchy. The final Firefox/WebKit matrix is **{counts(cross)}**; captures are linked from [its receipt](evidence/2026-W46/cross-browser-final.json). These checks supplement, rather than replace, the manual device and assistive-technology gates.
''')
append('2026-W46-implemented-fixes-and-validation.md',f'''## Final patch scope and receipt interpretation

ILT-D06 also changes only the existing archive keydown handler and cubing keyup guard. ILT-D09 changes the cubing fullscreen Start handler to match the normal explicit button. No archive layout or timing engine was replaced. The added sitewide harness port/identity guard prevents testing an unrelated local site; no assertion thresholds were relaxed.

The four review lenses were repeated for the late Fibonacci repair: it uses the existing seeded/live timestamp, has no shared call-site change, preserves the tile/display hierarchy in the final screenshots, and introduces no new browser API, metadata, storage, ad or analytics behavior. Eight isolated red assertions pass after the repair. The remaining cross-locale contract is expressly outside that narrow fix.

After sweep: **{counts(after,'basicPass')}**; final four-route follow-up: **{counts(targeted,'basicPass')}**; Firefox/WebKit matrix: **{counts(cross)}**. The four final cross-browser failures are world-clock hydration errors in Firefox; all recorded final value geometry and native-control assertions pass. The existing browser report passed 90 responsive/theme cases, menu focus/Escape and six WebKit cases, while its canonical gate remained red on 122 routes because current external-script behavior violates old expectations. Its top-level quality “passed” field is narrower than the failed command; do not use that field as release approval. The stage6 browser failure contains blocked-network console errors. Raw outputs remain available.

The clean typecheck and final candidate build are recorded in [typecheck log](evidence/2026-W46/logs/typecheck-final.log) and [build log](evidence/2026-W46/logs/build-final-candidate.log). The later final-release command consumes fresh generated evidence, including failures, instead of relying on historical PASS files. Lighthouse is run with third parties blocked and is a lab measurement only. Inspect its actual result below; field INP/p75 is unverified.

The initial offline `npx lighthouse` attempt failed before collecting any metrics because its cached registry metadata requested unavailable 13.6.0. The failure receipt remains in `suite-lighthouse-offline-failure.json`. An optional `ILT_LIGHTHOUSE_CLI` path now permits the existing cached Lighthouse 13.4.1 CLI to run directly without an install or upgrade; defaults and thresholds are unchanged. This is a harness portability repair, not a performance optimization.

The [short-navigation comparison](evidence/2026-W46/before-after-lab.json) records all 528 baseline and after samples: median observed LCP 112/116 ms, maximum CLS about 0.116 in each, and 1/2 cases above 0.1. These are unthrottled local samples with third parties blocked and varying concurrent audit load. They do not establish a causal speed regression or improvement, controlled Lighthouse equivalence, field p75 or INP.

The final release gate remains red. Alongside the old ad/script/content expectations, it rejects the fresh dependency findings (ILT-D11) and classifies this assignment's intentionally requested evidence logs as temporary files. The latter is a scope mismatch with this diagnostic deliverable, not an accidental build or dependency directory: the evidence index identifies the artifacts. Neither failure was hidden or waived in code. Read [the exact final gate](evidence/2026-W46/generated-reports/final/docs/final-release-gate.json) and [dependency triage](evidence/2026-W46/dependency-reachability.md).
''')
quality=load('generated-reports/lighthouse/docs/final-performance-accessibility.json',{})
lh=quality.get('performance',{}).get('lighthouse',{})
if lh:
    append('2026-W46-implemented-fixes-and-validation.md','### Fresh Lighthouse result\n\n'+
           f"Status: **{lh.get('status')}**; {len(lh.get('results',[]))} mobile/desktop reports. "+
           '[Full metrics and thresholds](evidence/2026-W46/generated-reports/lighthouse/docs/final-performance-accessibility.json). '+
           'This isolated run excludes ad/analytics network cost and cannot establish field performance.\n')
    results=lh.get('results',[])
    if len(results)==16:
        mobile=[r for r in results if r['formFactor']=='mobile']
        desktop=[r for r in results if r['formFactor']=='desktop']
        low=min(r['metrics']['largestContentfulPaint']['value'] for r in mobile)/1000
        high=max(r['metrics']['largestContentfulPaint']['value'] for r in mobile)/1000
        append('2026-W46-diagnostic-findings.md',f'''## ILT-D10 / P2 lab performance opportunity

Fresh Lighthouse produced 16 reports with no poor-threshold result. All eight desktop reports meet the configured good lab thresholds; all eight mobile reports fall in “needs improvement,” with LCP {low:.2f}–{high:.2f} seconds, above the 2.5-second goal. CLS is zero in these runs. This is a lab observation with ads/analytics blocked, not field p75 or a demonstrated before/after regression. No timing updates, typography or functional behavior were sacrificed to improve a score. Disposition: **stage the investigation at 2027-W26**, with field data and a controlled comparison required before optimization. [Metrics](evidence/2026-W46/generated-reports/lighthouse/docs/final-performance-accessibility.json).
''')
        append('2027-weekly-release-manifest.md','''## Additional measured performance disposition

| Issue | Single disposition | Acceptance gate |
|---|---|---|
| ILT-D10 / mobile lab LCP above the good goal | STAGE 2027-W26 investigation | Obtain field p75 where available and controlled local comparisons; keep timing correctness, readable values and ad reservations. No claim of regression from incomparable runs. |
''')
        append('2027-weekly-plans/2027-W26.md','''## ILT-D10 performance investigation

The diagnostic's eight mobile Lighthouse reports had LCP 2.63–3.08 seconds with third parties blocked. Establish a controlled baseline and inspect actual field data before proposing a bounded performance change. This investigation is part of the reliability checkpoint; it does not authorize reducing timer update correctness, text size or ad reservations to chase a score.
''')
commits=load('commit-register.json',[])
if commits:
    append('2026-W46-implemented-fixes-and-validation.md','## Branch commits\n\n| Commit | Scope |\n|---|---|\n'+
           '\n'.join(f"| `{r['sha']}` | {r['scope']} |" for r in commits)+'\n\nAll changes remain on the diagnostic branch. [Final safety receipt](evidence/2026-W46/final-safety.json).\n')
owner='''# Owner review — local diagnostic candidate only

Use `C:/Users/Suhas/.codex/worktrees/ilovetimers-diagnostic-W46` on `release/2026-W46-diagnostic-audit-plan`. The original E: worktree is untouched. After audit processes finish, run `npm ci --no-fund --no-audit`, `npm run build`, then `npm run start -- --port 3070`. Open [the local preview](http://localhost:3070). No public staging indexing assumption is required.

1. **Atomic clock:** open `/atomic-clock` at 1024, 1440 and 1920 px. Freeze, show/hide milliseconds, enter/exit fullscreen, and repeat in dark mode. The complete value should fit on one line. The device-time disclaimer must remain. [Before](evidence/2026-W46/atomic-before/1440-light.png) / [after](evidence/2026-W46/atomic-after/1440-light.png).
2. **World milliseconds:** open `/world-clock-with-milliseconds` at 768, 1440 and 1920 px, then mobile. Toggle 24-hour time, add/remove a city, enter/exit fullscreen, and repeat in dark mode. Every value should fit within its own column. Selected zones and calculations are unchanged.
3. **HIIT:** on `/hiit-timer`, set warm-up 1 second, work 1 second, rest 0, rounds 2, cool-down 0 and sound off. Start, then Reset near the warm-up boundary. It must stay stopped. A normal uninterrupted run must still finish. The automated simulated-clock test supplies the exact 20 ms race proof that is difficult to reproduce manually.
4. **Native keyboard controls:** on `/countdown-timer`, `/millisecond-timer`, `/stopwatch` and `/free-online-timers`, Start, Pause, focus Reset and press Space. It should reset and remain stopped. Space on a focused Start/Pause button should perform that button's action. The archived page must still show its original four tools.
5. **Speedcubing:** on `/speedcubing-timer`, focus Start and press Space, stop, then reset. Focus the display background, hold Space for over a quarter second, and release: timing should start. Enter fullscreen in default hold mode and click Start: it should also start. Stop should still save the solve. This is the additional fullscreen repair, ILT-D09.
6. **Install:** clean installation must succeed on the supported Node version. The lockfile repair adds the already-declared lucide-react 1.43.0 entry; it upgrades no existing dependency.

The practical risks are shared keyboard dispatch, delayed phase cancellation and fitted clock typography. Reject the candidate if background shortcuts, saved results, automatic phases or readable digits regress. Review [the validation report](2026-W46-implemented-fixes-and-validation.md), including its red checks, before approval.

## Decisions separate from these repairs

- **Hydration:** 46 routes still fail some first renders across timezones/locales. Choose and test a deterministic initial-display contract before a family rollout, with elevated review for traffic winners. Do not approve broad warning suppression or universal UTC defaults as shortcuts.
- **URLs:** 131 non-root paths redirect to slash URLs while their canonical tags prefer non-slash. Keep the present contract during repairs; require search evidence and isolated proof before any migration.
- **Ads:** the source latch lifetime is route-scoped, while the required invariant is global after the first real creative. Observe real fill → SPA navigation → delayed/unfilled behavior before deciding. This branch changes no ad lifecycle or whitespace policy.
- **2027:** all 52 records are proposals. Physical devices, screen readers, actual zoom/audio and unresolved P1 defects remain maturity gates. No week authorizes an automatic merge or deployment.
- **Dependencies:** the release gate flags React Router and transitive DOMPurify. Read [the applicability review](evidence/2026-W46/dependency-reachability.md) and choose an explicit reviewed exception or a separately validated patch candidate before merge. No site exploit or blanket safety claim is asserted.

Production approval remains a separate explicit owner action. Keep this branch unmerged until that review.
'''
(out/'2026-W46-owner-manual-review.md').write_text(owner,encoding='utf-8')
append('2026-W46-owner-manual-review.md','''## Fibonacci date check

On `/fibonacci-clock`, the date below Decimal time should follow the live clock across midnight. The automated future-date test verifies both that rollover and opening a build on a later calendar date without rebuilding the page during hydration. Explore controls and tile calculations are unchanged. This repair addresses the date subcase only; cross-timezone/locale hydration is still a separate open gate.
''')

# Keep generated prose readable without changing code, identifiers, file links or SHAs.
replacements={
 'newindexablepages':'new indexable pages','majorwinnerredesign':'major winner redesign',
 'realcreative':'real creative','realfill':'real fill','ownerpolicy':'owner policy','Physicaldevice':'Physical device',
 'physicalzoom':'physical zoom','actualzoom':'actual zoom','screenreaders':'screen readers','Screenreader':'Screen reader',
 'longrun':'long-run','fieldp75':'field p75','fullsmoke':'full smoke','storagekeys':'storage keys',
 'Productionanalytics':'Production analytics','actualad':'actual ad','alreadyhandled':'already handled',
 "don'tpreventDefault":"do not call preventDefault",'declaredlucide':'declared lucide',
 'deterministiccqw':'deterministic cqw','defaultaction':'default action','establishedseconds':'established seconds',
 'sevenwidths/twothemes':'seven widths/two themes','legalAdSense':'legal AdSense','exitcode':'exit code',
 'toolscope':'tool scope','all-current-route':'all-current-route','fullURL':'full URL',
 'fullpage':'full-page','globalfirst':'global first','all52':'all 52','All132':'All 132',
 'all132':'all 132','all22':'all 22','All22':'All 22','All20':'All 20','leaves46':'leaves 46',
 'These31':'These 31','at54':'at 54','Base54':'Base 54','production468':'production 468',
 'published468':'published 468','main468':'main 468','deploy6ad':'deploy 6ad',
 'and390':'and 390','before/after1440':'before/after 1440','the2027':'the 2027',
 'keyilt-theme-mode':'key ilt-theme-mode','perbaseline':'per baseline','andfullscreen':'and fullscreen',
 'Reserved whitespace and global first-fill safety are preserved.':'Reserved whitespace and existing fill handling are unchanged; the required global first-fill invariant still needs navigation evidence.',
}
protected=r'(`[^`]*`|\[[^\]]*\]\([^)]*\)|https?://\S+|(?<![a-f0-9])[a-f0-9]{40}(?![a-f0-9])|\b(?:ILT-[A-Z]+\d+|202[67]-W\d+|[PFDSUIW]+\d+s?|CWV|H1s?|UTC|ISO\d*|p\d+|a11y)\b)'
def clean(text):
    for sha in ['54c19824b2a76da0ea671e912598fadb3214b8b9','468bda18f09812a9212b3e6a15921dd9ed013542']+[c['sha'] for c in commits]:
        text=re.sub(r'(?<!`)'+sha+r'(?!`)',lambda m: (' ' if m.start()>0 and text[m.start()-1].isalnum() else '')+'`'+sha+'`',text)
    text=text.replace('=528.132/132','= 528. All 132/132')
    parts=re.split(protected,text)
    for i in range(0,len(parts),2):
        s=parts[i]
        for old,new in replacements.items():s=s.replace(old,new)
        s=re.sub(r'(?<=[a-zA-Z])(?=\d)', ' ',s)
        s=re.sub(r'(?<=\d)(?=[a-zA-Z])', ' ',s)
        s=re.sub(r',(?=[^\s\d])', ', ',s)
        s=re.sub(r'(November \d+),(\d{4})',r'\1, \2',s)
        s=re.sub(r'(?<=[a-z])\.(?=[A-Z0-9])', '. ',s)
        s=re.sub(r'(?<=[A-Za-z]):(?=[A-Za-z0-9`])', ': ',s)
        s=re.sub(r';(?=\S)', '; ',s)
        s=s.replace('p 75','p75').replace(', ”',',”')
        if i+1<len(parts) and re.fullmatch(r'[a-f0-9]{40}',parts[i+1]) and s and s[-1].isalnum():s+=' '
        parts[i]=s
    return ''.join(parts)
docs=list(out.glob('2026-W46-*.md'))+[out/'2027-weekly-release-manifest.md']+list((out/'2027-weekly-plans').glob('*.md'))
for p in docs:p.write_text(clean(p.read_text(encoding='utf-8')),encoding='utf-8')

# Update the route register with final repair evidence, retaining baseline defects.
p=out/'2026-W46-canonical-page-audit.csv'
with p.open(encoding='utf-8',newline='') as f:rows=list(csv.DictReader(f))
for row in rows:
    path=row['path']
    if path in ['/free-online-timers','/speedcubing-timer']:
        row['audit_status']='VERIFIED DEFECT'
        row['observed_issue_IDs']+='; ILT-F03/ILT-D06 (repaired)'+('; ILT-D09 (repaired)' if path=='/speedcubing-timer' else '')
    if any(r.get('route')==path and r.get('formFactor')=='mobile' and r.get('thresholdStatus','').startswith('needs') for r in lh.get('results',[])):
        row['observed_issue_IDs']+='; ILT-D10 (lab LCP investigation)'
        if row['audit_status']=='PASS':row['audit_status']='RISK NEEDS REPRO'
    row['known_test_coverage']+='; after shared-change smoke: '+str(sum(r['path']==path and bool(r.get('basicPass')) for r in after))+'/4; final targeted rerun where listed in local-targeted-final.json'
    row['browser_viewport_theme_coverage']+='; changed-route Firefox/WebKit in cross-browser-final.json'
    row['evidence']='; '.join('evidence/2026-W46/'+part if part.startswith('screens/') else part for part in row['evidence'].split('; '))
with p.open('w',encoding='utf-8',newline='') as f:
    w=csv.DictWriter(f,fieldnames=rows[0]);w.writeheader();w.writerows(rows)
missing=[]
for p in docs+[ev/'README.md',ev/'dependency-reachability.md']:
    for ref in re.findall(r'\[[^\]]*\]\(([^)]+)\)',p.read_text(encoding='utf-8')):
        if re.match(r'^[a-z]+://',ref) or ref.startswith('#'):continue
        if not (p.parent/ref.split('#')[0]).exists():missing.append({'document':str(p.relative_to(root)),'target':ref})
assert len(rows)==132 and len({r['path'] for r in rows})==132
assert len(list((out/'2027-weekly-plans').glob('2027-W*.md')))==52
receipt={'canonicalRows':len(rows),'weeks':52,'missingLocalLinks':missing,'afterSmoke':counts(after,'basicPass'),'finalTargetedSmoke':counts(targeted,'basicPass'),'crossBrowser':counts(cross)}
manifest=(out/'2027-weekly-release-manifest.md').read_text(encoding='utf-8')
old_section=manifest.split('## Existing backlog: exactly one disposition per ID')[1].split('## New diagnostic issue closure map')[0]
ids=re.findall(r'^\| (ILT-(?:UI|F|S)\d+) \|',old_section,re.M)
assert len(ids)==31 and len(set(ids))==31
receipt['legacyDispositionCount']=len(ids)
for row in rows:
    for ref in row['evidence'].split('; '):
        if not (out/ref).exists():missing.append({'document':'canonical-page-audit.csv','target':ref})
(ev/'coverage-summary.json').write_text(json.dumps({**load('coverage-summary.json'),'finalRowStatuses':{s:sum(r['audit_status']==s for r in rows) for s in sorted({r['audit_status'] for r in rows})},'afterSmoke':counts(after,'basicPass'),'targetedFinalSmoke':counts(targeted,'basicPass'),'crossBrowserFinal':counts(cross)},indent=2)+'\n')
(ev/'document-verification.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt,indent=2))
if missing:raise SystemExit('Missing document links must be fixed before handoff')
