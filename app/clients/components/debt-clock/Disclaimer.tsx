export default function Disclaimer() {
  const preview =
    "Pick a preset or enter your own starting debt + yearly change • Estimated counter updates locally • Fullscreen display • Keyboard shortcuts • Copy a clean snapshot";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="space-y-4">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Debt Clock tools at a glance
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
              Use this page to visualize debt growth (or decline) as a live
              counter.
            </strong>{" "}
            Choose a preset or enter a starting amount and an average yearly
            change rate. The counter updates continuously, and fullscreen turns
            it into a clean big-number display you can show on a TV, projector,
            or second monitor.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Live counter.</strong> A
              running total that updates locally based on your starting
              value and yearly change rate.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Presets or custom.</strong> Use
              a preset as a quick starting point, or switch to{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Custom</span> to
              enter your own numbers.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Supports decreases.</strong>{" "}
              Yearly change can be negative, so the counter can run downward if
              debt is shrinking.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen mode.</strong> Big
              digits for distance viewing. In fullscreen, you can{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                tap/click the number
              </span>{" "}
              to start or pause.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Copy a snapshot.</strong> Copy
              includes the preset name, your “as of” label, the current
              estimate, and the rate (year + per-second) so you can paste it
              into notes or slides.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Keyboard shortcuts.</strong>{" "}
              Start/pause, reset, fullscreen, and copy without touching the
              mouse.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Fast setup
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Choose a preset</strong>{" "}
                or select <strong className="text-[var(--ilt-text-primary)]">Custom</strong>.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Set your inputs</strong>:
                starting debt, yearly change (can be negative), and an “as of”
                label.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Go fullscreen</strong> and
                press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span> to
                start/pause. Press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">C</span> to copy.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Practical ways to use it
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Presentations</strong>: run
                  fullscreen as a “big number” visual, then copy a snapshot for
                  slides or notes.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Dashboards</strong>: keep a
                  tab open on a second monitor to show an always-updating
                  estimate.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">What-if checks</strong>:
                  adjust yearly change to see how the trajectory looks under
                  different assumptions.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Debt payoff framing
                  </strong>
                  : if you have a reduction rate, use a negative yearly change
                  to visualize a shrinking balance over time.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Want to time a payoff session or “debt-free countdown”?{" "}
                  <a
                    href="/debt-repayment-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Debt Repayment Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a clean big display for a room?{" "}
                  <a
                    href="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Tracking time during a talk?{" "}
                  <a
                    href="/presentation-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Presentation Timer
                  </a>{" "}
                  or{" "}
                  <a
                    href="/meeting-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Meeting Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want a running “time spent” counter instead?{" "}
                  <a
                    href="/count-up-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Count Up Timer
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 ilt-surface-card p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-[var(--ilt-text-primary)] ilt-focus-ring">
                <span>Technical details</span>
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
                    start/pause ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">R</span>{" "}
                    reset ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">C</span> copy
                    · <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[var(--ilt-text-muted)]">
                    If shortcuts do not work, click or tap the display once so it has
                    focus.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    How the counter is calculated
                  </div>
                  <p className="mt-2">
                    The tool converts your yearly change into a per-second rate,
                    then adds that amount continuously from your starting debt.
                    It’s an estimate, not a live feed from an official source.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    What “As of” means
                  </div>
                  <p className="mt-2">
                    The “as of” label is purely informational. Use it to record
                    the date and source behind your starting value or rate (for
                    example: “Budget update, 2026-01-15”).
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen + clipboard behavior
                  </div>
                  <p className="mt-2">
                    Some browsers require a user gesture to enter fullscreen and
                    may restrict clipboard access in certain contexts. If copy
                    fails, click the page once and try{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">C</span>{" "}
                    again.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Disclosure.</strong> This page
            shows an estimated counter based on the starting value and average
            rate you provide (or the selected preset). It is not an official
            reporting source.
          </div>
        </details>
      </div>
    </section>
  );
}
