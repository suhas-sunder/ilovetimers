import datetime as dt,pathlib
root=pathlib.Path(__file__).resolve().parents[2];out=root/'ai-issues';plans=out/'2027-weekly-plans';plans.mkdir(exist_ok=True)
# One bounded candidate or explicit observation/decision week. No content quota.
work=[
('Diagnostic fixes acceptance','/atomic-clock; /world-clock-with-milliseconds; /hiit-timer; shared ToolFrame call sites','Approve only lock reproducibility, single-line digits, cancelled HIIT transition and native Space semantics; rerun final diagnostics on current main','ILT-D01; ILT-D03; ILT-D05; ILT-D06','current audit; no unresolved regression in changed behavior'),
('Hydration pilot','/current-local-time; /24-hour-clock','Serialize deterministic initial locale/zone output; hydrate into device time after mount without DOM rebuild; prototype only','ILT-D02','owner chooses initial-render contract; fail-first UTC/Sydney/NY and locale matrix'),
('Physical timing laboratory','/millisecond-timer; /online-alarm-clock; /pomodoro-timer; /multiple-timers','No release by default; obtain actual iOS/Android lock/sleep/audio/background evidence and separate elapsed accounting from audible delivery','ILT-F01 (blocked hardware gate)','physical devices and audible output; never substitute emulator evidence'),
('Keyboard and DOM-order candidate','/countdown-timer; /online-timer; /hiit-timer; /speedcubing-timer','Review CSS order against tab sequence and native Space regression; preserve hold-to-start and fullscreen Escape','ILT-UI05; ILT-F03','diagnostic fixes; assistive technology review for any DOM move'),
('Session mutation invariants','/countdown-timer; /pomodoro-timer; /hiit-timer; /interval-timer','Specify and test running/paused preset, Apply, sound, resize and next-phase policies; fix only reproduced state loss','ILT-F02','keyboard candidate; 0ms boundary and rapid interactions'),
('Hydration family gate','46 paths listed in timezone-hydration-before.json','No automatic rollout: after pilot acceptance, prepare one affected family with deterministic SSR; protected clock family needs elevated approval','ILT-D02 rollout gate','W02 pilot; all affected route list retained until closed'),
('Legibility family candidate','/current-local-time; /roman-numeral-clock; /world-clock-with-milliseconds','Correct only reproduced label/digit wrapping or clipping with before/after seven-width evidence','ILT-UI09','one family; no global fitting rewrite; review longest values'),
('Saved setup recovery','/countdown-timer; /pomodoro-timer; /hiit-timer; /time-zone-meeting-planner; /time-zone-converter','Corrupt and denied storage, refresh, delete/rename, invalid share tokens and clipboard refusal; clarify setup versus live session only where needed','ILT-F04','existing schemas and keys unchanged; five-route share tests'),
('Ad safety decision','/countdown-timer; /online-timer; /pomodoro-timer; /classroom-timer; /multiple-timers; one guide','Investigation only: real creative first-fill latch across SPA navigation, delayed/unfilled states; preserve whitespace until owner-approved policy','ILT-UI01; ILT-D07','real ads and owner decision; ad-blocked screenshots are insufficient'),
('Help typography pilot','/countdown-timer; /online-timer','Specify shared plain content rhythm and fix one live reproduced pattern; no cards, no blanket old-component replacement','ILT-UI02','rendered import/call-site proof; W09 must not be treated as permission'),
('Observe pilot','same URLs as W10','No planned code/content release; compare support flow and tool success, inspect regression reports','observation','14/28-day search lag; device checks'),
('Privacy-safe measurement audit','all canonical paths; production PostHog project293132','Read-only event/route sampling and define task success by tool type; no new identifiers, replay, billing or capture scope','ILT-F05','confirmed event ingestion; approved privacy schema only'),
('Discovery taxonomy candidate','/; header More search; /sitemap','One evidence-backed label/group fix using canonical destinations; preserve full footer and synonyms','ILT-UI04','zero alias/unknown rendered links; keyboard menu task test'),
('Related journey candidate','/countdown-timer; /hiit-timer; /digital-clock; /time-calculator','Select useful next tasks for one family; remove a recommendation only if demonstrably misleading','ILT-UI08','canonical-link register; route-specific support reviewed'),
('Winner density decision','/countdown-timer; protected pages only if separately approved','No release by default: compare default Start/edit/fullscreen journey before considering secondary settings disclosure','ILT-UI06','owner choice; no assumption that settings are clutter'),
('Observe navigation','W13–W14 affected paths','No content release; compare successful first-tool navigation and accessible search','observation','stable comparison window; no attribution from pageviews alone'),
('Control affordance candidate','shared buttons and one proven affected family','Fix verified tap target/focus/disabled-state defects; do not replace text controls with icons','ILT-F06','call-site inventory and all-route smoke; forced-colors and keyboard'),
('Factual copy corrections','/atomic-clock; /clock-with-milliseconds; /online-alarm-clock; /time-zone-converter','Only verified false/stale claims; retain device-clock, audio and DST limitations; manual review dates only after meaningful review','ILT-S02','line-level evidence; metadata unchanged unless separately approved'),
('Useful help pilot','one existing tool selected from supported engagement/feedback evidence','Replace a specific confusing passage with a practical example; no word count or keyword target','ILT-S01','W12 evidence and owner-approved exact URL before implementation'),
('Timer selection guidance','/; existing More search','One concise existing-tool choice aid only if failed first-task journeys justify it','ILT-S03','W13 observation; homepage is protected, elevated review'),
('Search signal observation','affected existing canonical pages','No title or URL release. Compare current GSC/Bing windows and seasonality; obtain page/query evidence for snippet hypotheses','ILT-S14 evidence gate','query/page join not supplied in six-month exports'),
('Classroom preset decision','/classroom-timer; /exam-timer; /presentation-timer','No release by default: teacher task evidence chooses one optional high-contrast or silent preset','ILT-S04 owner decision','physical projector and keyboard checks; no decorative themes'),
('Low-stimulation pilot','/visual-timer','One optional motion/seconds setting if demand validates it; preserve default and timing state','ILT-S05','reduced motion and user task evidence; no new landing page'),
('Observe visual pilot','/visual-timer','No new functionality; verify timers remain accurate through toggles/fullscreen','observation','W23 acceptance; support feedback'),
('Bookmarked setup candidate','one of /classroom-timer; /meeting-timer; /kitchen-timer','Extend existing share infrastructure to one proven workflow, local-only semantics and invalid-token recovery','ILT-S06','W08 schemas; owner chooses single target; no account feature'),
('Midyear reliability checkpoint','all132 canonical +28aliases, or reconciled current inventory','No major release; repeat exhaustive mobile/desktop/themes, URLs, privacy, ads and timezone matrix','midyear acceptance','all earlier defects explicitly closed/deferred; no silent omission'),
('Calculation guidance candidate','/work-hours-calculator; /time-card-calculator; /weekly-timesheet-calculator; /billable-hours-calculator','One bounded family of concrete break/rounding/overnight examples for US/CA/UK/AU readers; no payroll/legal guarantee','ILT-S10','formula assertions and visible calculation assumptions'),
('Observe calculation guidance','W27 paths','No content release; inspect wrong-result reports and input-recovery journeys','observation','formula regression suite; search comparison lag'),
('Distinct guide decision','/guides; existing background/audio/storage guides','Deduplicate proposed classroom/iPhone/sequence guidance against existing guides; no new route unless unique job and evidence','ILT-S11 owner decision','source citations; original actionable support; explicit new-route approval'),
('Hold or approved guide candidate','exact guide URL must be selected at W29','Default no release. At most one genuinely distinct guide after owner choice and complete navigation/schema/sitemap review','conditional candidate','W29 written approval and no duplicate intent'),
('Focus defaults pilot','one of /pomodoro-timer; /focus-session-timer; /study-timer','One optional one-session preset choice if supported; keep no-setup defaults and avoid productivity/health outcome claims','ILT-S12','mutation invariants from W05; no persistent key changes'),
('Observe focus pilot','W31 exact path','No content release; inspect session completion and interruption recovery, not time-on-page alone','observation','no confounded attribution'),
('Contextual correction path','/contact; one existing tool pilot','Route-only Report issue link with optional user-authored text; no automatic timer names/rates/dates/query payloads','ILT-S13','privacy review; no email sending or new backend'),
('Observe feedback path','/contact and W33 pilot','No content release; inspect accessibility and unwanted data inclusion','observation','owner confirms support workflow expectations'),
('Multi-timer opportunity review','/multiple-timers','No implementation: coordinated end-at-once/sequence requires demand and separate state-machine design','ILT-S07 deferred','existing independent timers must remain stable'),
('Classroom theme rejection review','/classroom-timer; /visual-timer','No theme library planned; revisit only with real demand, licensing and motion safety evidence','ILT-S08 rejected/deferred','no novelty/page quota'),
('Cubing analysis opportunity review','/speedcubing-timer','No implementation by default; distinguish existing best/average/history from requested rolling statistics or scramble validation','ILT-S09 deferred','real cuber feedback and bounded specification'),
('Physical fullscreen decision','/millisecond-timer; /classroom-timer; /analog-clock','No wake-lock addition without real phone/OS evidence; verify exit/return state and disclose limitations','ILT-S15 blocked hardware gate','iOS/Android, screen readers, orientation and battery behavior'),
('Canonical policy decision checkpoint','all canonical URLs and28aliases','Default keep URL contract. If owner selects migration, create separate plan with search evidence, redirect graph and rollback; no automatic switch','ILT-D04','live signals + selected-canonical evidence; protected traffic guardrails'),
('Observe URL decision','protected and high-impression routes','No major release; monitor chosen policy or unchanged baseline over recrawl windows','observation','W39 owner decision; 28/56-day data if migration ever approved'),
('Complete deferred reliability work','remaining verified P1 paths from current defect register','One bounded defect-only candidate; reconcile open hydration and native keyboard cases before feature freeze','P1 closure','explicit dependency/QA review; no unresolved severe item silently waived'),
('Cross-browser full gate','all canonical routes; representative functional journeys','No major release; Chromium/Firefox/WebKit desktop plus actual mobile acceptance, storage/audio/clipboard/fullscreen','cross-browser gate','real devices must be available; otherwise maturity remains blocked'),
('Protected winner acceptance','/; /millisecond-timer; /analog-clock; /birthday-countdown; /date-duration-calculator','No redesign; owner checks first-task defaults, readable running states, responsive layout and search continuity','winner acceptance','production snapshots and original default comparison'),
('Last bounded defect candidate','only reproduced remaining defect URLs','No new page/functionality. Fix one isolated P0/P1 if evidence and QA are complete; otherwise hold','freeze entry','owner-approved exact scope, full rollback and validation'),
('Stabilization 1','all current routes','No new major pages; exhaustive smoke/metadata/link/alias audit against current deployed SHA','stabilization','release freeze; unresolved P0/P1 list visible'),
('Stabilization 2','timer/stopwatch/interval families','No feature work; sustained runs, throttled callbacks, phase boundaries, rapid keyboard/mouse interactions','stabilization','physical test log; no timer leaks or false alarm promises'),
('Stabilization 3','clocks/date/time/work calculators','No feature work; locale/timezone/DST/year rollover/leap boundary and formula review','stabilization','deterministic hydration across build/runtime zones'),
('Stabilization 4','all ad-eligible and ad-free route classes','No policy changes; real filled/delayed/unfilled/navigation overlap proof, privacy and static deployment checks','stabilization','owner ad policy decision; no placeholder-over-creative risk'),
('Final evidence reconciliation','all canonical + aliases +404 + trust routes','No major release; regenerate route matrix, link evidence to exact candidate SHA, enumerate remaining exceptions','final audit','all external/manual gaps named with owner disposition'),
('Final owner walkthrough','protected routes + one prototype per family + all changed paths','No auto-merge. Owner accepts functional, mobile, assistive, privacy/ad and source-limit claims','owner acceptance','actual signed decisions; dates alone are not acceptance'),
('Final observation hold','accepted production baseline','No major release; inspect regressions and lagged GSC/Bing trends, hold if attribution is unclear','observation','minimum agreed observation window, rollback rehearsed'),
('Maturity decision','entire current site','Owner reviews evidence and unresolved scope; declare mature only if gates met, else publish explicit continuation plan','final maturity gate','zero unaccepted P0/P1; external/manual gates completed; no calendar-based success')]
assert len(work)==52
mapping=[
('ILT-UI01','SOURCE RISK','NEEDS OWNER CHOICE','W09 investigation only; real creative navigation/latch scope and padding policy require owner approval'),
('ILT-UI02','OPPORTUNITY','STAGE 2027-W10','Live shared content mostly flat; one demonstrated pattern, not blanket replacement of orphan components'),
('ILT-UI03','RESOLVED','INTENTIONAL/NO CHANGE','Current root filters aliases; rendered internal links contain no redirect aliases'),
('ILT-UI04','OPPORTUNITY','STAGE 2027-W13','Preserve directories; one taxonomy correction only after a failed find-the-tool task'),
('ILT-UI05','SOURCE RISK','STAGE 2027-W04','Visual order differs from DOM in some timers; real native-Space bug separately repaired, order redesign still gated'),
('ILT-UI06','OPPORTUNITY','NEEDS OWNER CHOICE','W15 compares density; no evidence authorizes hiding controls on winners'),
('ILT-UI07','INTENTIONAL','REJECT/NO CHANGE','Current AGENTS explicitly preserves complete footer; compact-footer proposal conflicts'),
('ILT-UI08','OPPORTUNITY','STAGE 2027-W14','Review next user job and legacy synonym promise; do not remove canonical discoverability'),
('ILT-UI09','VERIFIED','STAGE 2027-W07','Atomic/world millisecond clipping subset fixed in diagnostics; broader typography/reflow remains'),
('ILT-UI10','OPPORTUNITY','DEFER','No homepage abandonment evidence; protected navigation-first default remains'),
('ILT-F01','SOURCE RISK','BLOCKED','No physical iOS/Android sleep/audio acceptance available; W03 is evidence collection, not release'),
('ILT-F02','VERIFIED','STAGE 2027-W05','HIIT queued reset repaired; complete mutation-policy matrix remains'),
('ILT-F03','VERIFIED','STAGE 2027-W04','Native Space subset repaired; hold-to-start/fullscreen/assistive coverage remains'),
('ILT-F04','OPPORTUNITY','STAGE 2027-W08','Preserve keys; robust existing versioned shares, clarity/recovery review'),
('ILT-F05','VERIFIED','STAGE 2027-W12','Existing stored event availability confirmed; no retention/revenue conclusions from counts'),
('ILT-F06','OPPORTUNITY','STAGE 2027-W17','Guardrail maintenance only; no novelty visual system'),
('ILT-S01','OPPORTUNITY','STAGE 2027-W19','Select one demonstrated confusing passage; no broad rewrite'),
('ILT-S02','OPPORTUNITY','STAGE 2027-W18','Target factual issues; AdSense legal disclosures are intentional, not leaked process copy'),
('ILT-S03','OPPORTUNITY','STAGE 2027-W20','Existing-route choice aid only; protected homepage elevated approval'),
('ILT-S04','OPPORTUNITY','NEEDS OWNER CHOICE','W22 teacher evidence and one optional setting; no default redesign'),
('ILT-S05','OPPORTUNITY','STAGE 2027-W23','One opt-in low-stimulation mode inside existing visual timer'),
('ILT-S06','OPPORTUNITY','STAGE 2027-W25','One workflow after demand proof, no cloud account'),
('ILT-S07','OPPORTUNITY','DEFER','Unproven demand and significant state-machine risk; W35 review does not authorize implementation'),
('ILT-S08','OPPORTUNITY','REJECT/DEFER','Theme library adds novelty/licensing/motion risk without demonstrated task value'),
('ILT-S09','OPPORTUNITY','DEFER','Existing best/average/history present; rolling stats/scramble work needs specific demand'),
('ILT-S10','OPPORTUNITY','STAGE 2027-W27','Concrete local-time/rounding examples, no payroll/legal accuracy claims'),
('ILT-S11','OPPORTUNITY','NEEDS OWNER CHOICE','W29 uniqueness gate; W30 defaults to hold, no guaranteed guide'),
('ILT-S12','OPPORTUNITY','STAGE 2027-W31','Optional session preset only after behavioral evidence'),
('ILT-S13','OPPORTUNITY','STAGE 2027-W33','Route-only correction context; no private field capture or new backend'),
('ILT-S14','SOURCE RISK','BLOCKED','Six-month exports lack query/page join and selected-canonical evidence; W21 collects evidence, no title optimization'),
('ILT-S15','SOURCE RISK','BLOCKED','Physical screen/OS and permission behavior unverified; W38 decision only')]
assert len(mapping)==31 and len({x[0] for x in mapping})==31
matrix='Changed URLs:320/375/390/768/1024/1440/1920 × light/dark; default/running/paused/finished/fullscreen where applicable; keyboard/touch/200–400% actual zoom/reduced motion/forced colors. All-current-route390/1440 smoke. Exact domain adversarial tests and physical-device gates for affected behavior. Typecheck/build and relevant actual package scripts; disclose every failure.'
table=[]
for num,(title,urls,accept,ids,deps) in enumerate(work,1):
    week=f'2027-W{num:02}';start=dt.date.fromisocalendar(2027,num,1);end=start+dt.timedelta(days=6)
    if num==1: ids+='; ILT-D09'
    hold=any(word in title.lower() for word in ['observe','observation','decision','review','stabilization','checkpoint','acceptance','gate'])
    elevated=any(word in (ids+' '+urls) for word in ['ILT-D02','ILT-D04','ILT-D07','homepage','millisecond-timer'])
    estimate=('Review/evidence only: 0–1 engineering day and 1–2 QA days; no implementation assumed.' if hold else 'Planning estimate: 1–3 engineering days and 1–2 QA days for the bounded candidate; re-estimate after reproduction.')
    risk=('High: protected workflow, initial render, URL or ad safety may be involved. Elevated owner review and a reversible pilot are required.' if elevated else 'Moderate: preserve state, keyboard behavior and shared call sites; use route-specific evidence before accepting broader effects.')
    text=f'''# {week} — {title}

- Dates: {start} to {end} (ISO week; owner schedule America/New_York).
- Status: PROPOSED, NOT OWNER-APPROVED. Hold is the default if any gate is incomplete.
- Base/main SHA: UNSET until candidate preparation; verify actual remote main and Netlify published SHA. Planning reference only:468bda18f09812a9212b3e6a15921dd9ed013542.
- Planned URLs/job: {urls}. {title}.
- Issue scope: {ids}.
- Change/user problem/acceptance: {accept}.
- SEO impact: no new indexable page, title/H1/canonical/indexability/redirect change by default. Any separately approved guide/URL work needs an explicit exact-route diff and inventory/sitemap review before merge.
- Dependencies: {deps}. Previous unresolved severe issues do not disappear at week rollover.
- Engineering/QA estimate: {estimate}
- Regression risk: {risk}
- Test/screenshot matrix: {matrix}
- Draft PR: NONE; create only the bounded candidate against main, keep draft until owner review. No automatic merge/deploy.
- Rollback: record pre-merge production SHA and exact candidate commit; revert only that approved change through an owner-approved revert PR. For data/schema changes, design backward-compatible recovery before implementation. Never roll back the first-real-ad placeholder safety latch.
- Owner approval: NOT GRANTED. Record reviewer, reviewed SHA, decision and date before merge; a passing suite/calendar slot is not approval.
- Production verification after approved merge: read-only Netlify ready/commit/redirect/header/functions check; HTTP canonical/alias/404; protected first-task smoke; browser errors, ad overlap and privacy checks. Quota/credits inspected only if exposed; no paid service activation.
- GSC/Bing observation: baseline prior28days; inspect7-day operational changes, then14/28-day search windows; URL policy experiments need28/56-day recrawl context. Segment affected paths and device/country when available; avoid attributing seasonality or delayed indexing to this release.
- Final result/evidence: PENDING; no future result asserted. Record exact logs/screenshots/limitations and accepted exceptions here.
'''
    (plans/f'{week}.md').write_text(text,encoding='utf-8');table.append(f'| [{week}](2027-weekly-plans/{week}.md) | {start} | {title} | {ids} | Proposed / hold until gated |')
manifest='''# Proposed 2027 weekly release manifest

This is a proposed maintenance train, not an approved release schedule. One bounded candidate per week at most; observation/decision weeks intentionally ship nothing. January1–3 belongs to ISO2026-W53 and is a carryover hold. ISO2027-W52 ends January2,2028. No new-content quota; no cloned durations, city/country doorway pages, or formula copies.

## Release authority and gates

Only an explicit owner-approved merge into main may normally trigger Netlify production. This diagnostic assignment authorizes branch preparation/commits/push only. Off-cycle verified small fixes may be prepared sooner, but still require owner-approved merge and elevated review for winners. Hold candidates when tests, search guardrails, real-device checks or ad policy evidence are incomplete. Dates never waive quality gates.

Every linked week has its own base SHA field, URLs/job, scope/SEO impact, acceptance, matrix, PR, dependencies, rollback, owner approval, production verification and observation window. Future SHA/PR/approvals are deliberately UNSET/NONE, not invented. Candidate preparers must fill them before requesting approval. Hardware/owner-decision reviews do not implicitly change the single disposition in the closure map below.

All P0/P1 must be fixed and validated or explicitly accepted with owner rationale before final maturity. This audit leaves46-route cross-locale hydration open; that is a first-quarter reliability dependency, not a cosmetic backlog item. Complete that family rollout before discretionary feature pilots. Investigate ad latch scope without weakening existing safety. Global URL policy remains unchanged unless separately approved.

## Week-by-week records

| Week record | Monday | Bounded candidate or hold | Issue scope | Status |
|---|---|---|---|---|
'''+ '\n'.join(table)+'''

## Existing backlog: exactly one disposition per ID

These31 entries replace treating October hypotheses as automatically proven bugs. Partial diagnostic repairs do not silently close broader work.

| ID | Fresh classification | Single disposition | Reason/evidence gate |
|---|---|---|---|
'''+ '\n'.join('| '+' | '.join(row)+' |' for row in mapping)+'''

## New diagnostic issue closure map

| Issue | Disposition | Closure condition |
|---|---|---|
| ILT-D01 lockfile/install | W01 acceptance | Clean npm ci and unchanged preexisting dependency resolutions |
| ILT-D02 hydration | W02 pilot, W06 gated family continuation | All46 affected routes pass cross-build-zone/locale hydration with no main replacement; elevated winner review |
| ILT-D03 digit wrapping (subcase of UI09) | W01 acceptance | Atomic42states and world56states readable; current-local/roman P2 remainder stays UI09 |
| ILT-D04 URL signals | Needs owner choice, W39 checkpoint | Quantified selected-canonical/search evidence and isolated URL-policy proof; no diagnostic migration |
| ILT-D05 queued HIIT transition (F02) | W01 acceptance | Reset/settings/manual transition/unmount cannot resurrect pending phase; normal rounds still finish |
| ILT-D06 native Space (F03) | W01 acceptance | Native Start/Pause/Reset and background/hold-to-start shortcuts retain their separate meanings |
| ILT-D07 ad latch lifecycle (UI01) | Needs owner choice | Real creative navigation evidence; account safety has priority over whitespace |
| ILT-D08 audit/report drift | W01 documented exception; W26 reconciliation | Do not hide legal AdSense disclosures; modernize stale assertions only with test-review proof, not weaker product thresholds |
| ILT-D09 cubing fullscreen Start (F03) | W01 acceptance | Default hold mode still supports the explicit Start button in fullscreen; background hold/release and session history remain |

## Final maturity gate (W45–W52)

- Reconcile current routes,aliases,search data,Netlify deployed SHA and issue dispositions; rerun exhaustive mobile/desktop/theme/locale audit and actual domain suites.
- No unaccepted P0/P1, no silent test failures, no broken winner workflows, no ad-placeholder overlap, no privacy-scope expansion, no static-hosting regression.
- Actual iOS/Android sleep/audio/fullscreen, screen-reader, zoom/forced-color and clipboard-denial acceptance complete. Lab Chromium/WebKit and simulated clocks do not substitute.
- Owner performs W50 walkthrough against exact candidate SHA and signs each exception. Observe accepted production changes through agreed windows; keep rollback available.
- If any gate remains unmet at W52, record a continuation plan and retain incomplete status. Calendar completion alone is not maturity.
'''
(out/'2027-weekly-release-manifest.md').write_text(manifest,encoding='utf-8')
print('Wrote52proposed week records and31-ID single-disposition map.')
