import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Millisecond display • Laps + splits • Copy laps as CSV • Fullscreen mode • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">Before you use this stopwatch</h2>
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
              Time anything instantly with a fast stopwatch that supports laps
              and a millisecond display.
            </strong>{" "}
            Start or pause, record lap splits, reset when you’re done, and use
            fullscreen when you need a big, clean display.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Start and pause fast.</strong>{" "}
              Press <strong className="text-[var(--ilt-text-primary)]">Space</strong> to start
              or pause without moving your hands to the mouse. The status label
              shows whether you’re Running, Paused, or Ready.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Record laps (splits).</strong>{" "}
              Use <strong className="text-[var(--ilt-text-primary)]">Lap</strong> (or{" "}
              <strong className="text-[var(--ilt-text-primary)]">L</strong>) to capture the time
              since the previous lap, plus the total time. Great for intervals,
              speedruns, drills, and practice sets.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Copy laps as CSV.</strong> Copy
              your lap list to paste into Notes, Sheets, Excel, or a text file.
              The export includes{" "}
              <strong className="text-[var(--ilt-text-primary)]">Lap #</strong>,{" "}
              <strong className="text-[var(--ilt-text-primary)]">Split</strong>, and{" "}
              <strong className="text-[var(--ilt-text-primary)]">Total</strong>.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen timing.</strong> Go
              fullscreen for a big, readable stopwatch. In fullscreen, you can
              also{" "}
              <strong className="text-[var(--ilt-text-primary)]">tap/click the time</strong> to
              start or pause.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Reset cleanly.</strong> Press{" "}
              <strong className="text-[var(--ilt-text-primary)]">R</strong> (or use Reset) to
              clear elapsed time and laps. Useful between attempts so you don’t
              mix sets.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Keyboard-first flow.</strong>{" "}
              Use Space, L, C, R, and F to do everything quickly. Tip: click the
              stopwatch once so the page captures shortcuts.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Start</strong>: press{" "}
                <strong className="text-[var(--ilt-text-primary)]">Space</strong> (or Start) to
                begin timing.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Add laps</strong>: press{" "}
                <strong className="text-[var(--ilt-text-primary)]">L</strong> to record splits
                while you go.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Copy or reset</strong>:
                press <strong className="text-[var(--ilt-text-primary)]">C</strong> to copy CSV,
                or <strong className="text-[var(--ilt-text-primary)]">R</strong> to start fresh.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Best for
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Intervals</strong>: track
                  sets with consistent lap splits (work/rest, drills, rounds).
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Speedcubing</strong>: time
                  attempts and keep a lap list you can copy.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Practice + rehearsals
                  </strong>
                  : capture segments during music, speaking, or run-throughs.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Any quick timing</strong>:
                  clean fullscreen view when you want a big display.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Need a countdown instead of count-up?{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want structured work/rest rounds?{" "}
                  <Link
                    to="/hiit-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    HIIT Timer
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/tabata-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Tabata Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer a dedicated speed solve layout?{" "}
                  <Link
                    to="/speedcubing-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Speedcubing Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need multiple timers at once for stations?{" "}
                  <Link
                    to="/multiple-timers"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Multiple Timers
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want a clean big-screen timer view?{" "}
                  <Link
                    to="/online-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
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
                <span>How it works, shortcuts, and export notes</span>
                <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-2">
                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Keyboard shortcuts
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">Space</strong>: start /
                      pause
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">L</strong>: lap (split)
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">C</strong>: copy laps
                      (CSV)
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">R</strong>: reset
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">F</strong>: fullscreen
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">Esc</strong>: exit
                      fullscreen
                    </li>
                  </ul>
                  <p className="mt-2">
                    Tip: click the stopwatch once so shortcuts are captured.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Laps and splits
                  </div>
                  <p className="mt-2">
                    <strong className="text-[var(--ilt-text-primary)]">Total</strong> is the
                    elapsed time since the start.{" "}
                    <strong className="text-[var(--ilt-text-primary)]">Split</strong> is the
                    time since your previous lap. The lap list is shown with the
                    most recent lap first.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Copy format
                  </div>
                  <p className="mt-2">
                    Copy uses a CSV header and one row per lap:{" "}
                    <strong className="text-[var(--ilt-text-primary)]">
                      Lap, Split Time, Total Time
                    </strong>
                    . Times include milliseconds and use{" "}
                    <strong className="text-[var(--ilt-text-primary)]">m:ss.mmm</strong> (or{" "}
                    <strong className="text-[var(--ilt-text-primary)]">h:mm:ss.mmm</strong> for
                    long sessions).
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen notes
                  </div>
                  <p className="mt-2">
                    In fullscreen, the top bar provides quick controls, and the
                    lap overlay shows your most recent laps without blocking the
                    time. Press Esc to exit.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> For consistent lap
            splits, press Lap at the same point each rep (for example, end of a
            round or the moment you finish a set). Then copy the CSV to compare
            attempts later.
          </div>
        </details>
      </div>
    </section>
  );
}
