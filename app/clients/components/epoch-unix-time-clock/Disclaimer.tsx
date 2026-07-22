import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Live epoch in seconds and milliseconds • Copy buttons • Local + UTC time • Freeze/snap • Fullscreen view • Keyboard shortcuts";

  return (
    <section className="space-y-4">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Unix Time Clock at a glance
              </h2>
              <p className="mt-1 text-sm font-medium text-[var(--ilt-text-muted)]">
                {preview}
              </p>
            </div>

            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          {/* What this page is for (tight, user-first) */}
          <div className="mt-3 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Use this page to grab the current Unix epoch timestamp instantly,
              in both seconds and milliseconds, with fast copy and a clean
              fullscreen display.
            </strong>{" "}
            It’s built for quick “what time is it in epoch?” checks, copying a
            value into logs/tools, and freezing a moment in time when you need a
            stable timestamp.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Seconds and milliseconds.
              </strong>{" "}
              See both formats side by side: seconds is common in APIs and logs,
              milliseconds is common in JavaScript tooling and some event data.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Copy fast.</strong> Copy
              seconds or milliseconds with one click (or keyboard shortcuts). A
              quick toast confirms what you copied.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Local + UTC time.</strong>{" "}
              Confirm the human-readable time in your local timezone and in UTC
              right under the timestamp.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Live or Frozen.</strong> Leave
              it live to keep updating, or freeze to keep one value steady while
              you copy or compare.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Snap now.</strong> When frozen,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Snap</span> grabs a
              fresh “now” value once without going back to live mode.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen.</strong> Big, clean
              seconds display for screen-sharing, demos, or “read it from across
              the room” use. In fullscreen, clicking/tapping the main display
              toggles Live or Freeze.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Read it</strong>: seconds
                is the big number. Milliseconds is shown below as a separate
                device-clock unit.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Freeze if needed</strong>:
                stop the clock so the value doesn’t change while you work.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Copy</strong>: use Copy s
                / Copy ms (or shortcuts) and paste into your tool or log.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Common uses
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Logging and debugging
                  </strong>
                  : copy a timestamp for test data, bug reports, or event
                  traces.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">API checks</strong>: verify
                  “now” in epoch when working with endpoints that expect Unix
                  time.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Timezone sanity check
                  </strong>
                  : compare local vs UTC display to avoid off-by-timezone
                  mistakes.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Freeze a moment</strong>:
                  capture a stable value, then copy seconds or ms without it
                  changing mid-click.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Need a pure UTC display for quick comparisons?{" "}
                  <Link
                    to="/utc-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    UTC Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Converting between time zones?{" "}
                  <Link
                    to="/time-zone-converter"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Zone Converter
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Working in milliseconds a lot?{" "}
                  <Link
                    to="/milliseconds-converter"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Milliseconds Converter
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want a live local clock instead?{" "}
                  <Link
                    to="/current-local-time"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Current Local Time
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer a minimal, clean clock view?{" "}
                  <Link
                    to="/minimalist-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Minimalist Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need to time something right now?{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </Link>
                  .
                </div>
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 ilt-surface-card p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-[var(--ilt-text-primary)] ilt-focus-ring">
                <span>Details and shortcuts</span>
                <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-2">
                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Keyboard shortcuts
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span>{" "}
                    live/freeze ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">C</span> copy
                    seconds ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">M</span> copy
                    milliseconds ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">N</span> snap
                    now ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[var(--ilt-text-muted)]">
                    If shortcuts don’t work, click/tap the card once so it has
                    focus.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    What “Live / Frozen / Snap” means
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Live</span>{" "}
                    updates continuously.{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Frozen</span>{" "}
                    keeps the current value stable.{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Snap</span>{" "}
                    updates once while staying frozen.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Seconds vs milliseconds
                  </div>
                  <p className="mt-2">
                    Unix time is commonly represented as seconds since the Unix
                    epoch. Milliseconds is the same value multiplied by 1,000
                    (often used by JavaScript and some telemetry systems).
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Local vs UTC display
                  </div>
                  <p className="mt-2">
                    The epoch timestamp is timezone-independent. Local and UTC
                    rows are provided so you can confirm the human-readable
                    moment in each format.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Some browsers require a user gesture to enter fullscreen. In
                    fullscreen, clicking/tapping the main seconds display
                    toggles Live or Freeze.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> If you’re copying a
            timestamp for a report or debugging, freeze first so the value
            doesn’t change between reading and pasting.
          </div>
        </details>
      </div>
    </section>
  );
}
