# Owner review — local diagnostic candidate only

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

## Fibonacci date check

On `/fibonacci-clock`, the date below Decimal time should follow the live clock across midnight. The automated future-date test verifies both that rollover and opening a build on a later calendar date without rebuilding the page during hydration. Explore controls and tile calculations are unchanged. This repair addresses the date subcase only; cross-timezone/locale hydration is still a separate open gate.
