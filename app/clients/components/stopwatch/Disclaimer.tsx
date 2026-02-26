import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Millisecond stopwatch • Laps + splits • Copy laps as CSV • Fullscreen mode • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">Stopwatch</h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {preview}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          {/* What this page is for (tight, user-first) */}
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">
              Time anything instantly with a fast stopwatch that supports laps
              and millisecond precision.
            </strong>{" "}
            Start or pause, record lap splits, reset when you’re done, and use
            fullscreen when you need a big, clean display.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Start and pause fast.</strong>{" "}
              Press <strong className="text-slate-900">Space</strong> to start
              or pause without moving your hands to the mouse. The status label
              shows whether you’re Running, Paused, or Ready.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Record laps (splits).</strong>{" "}
              Use <strong className="text-slate-900">Lap</strong> (or{" "}
              <strong className="text-slate-900">L</strong>) to capture the time
              since the previous lap, plus the total time. Great for intervals,
              speedruns, drills, and practice sets.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Copy laps as CSV.</strong> Copy
              your lap list to paste into Notes, Sheets, Excel, or a text file.
              The export includes{" "}
              <strong className="text-slate-900">Lap #</strong>,{" "}
              <strong className="text-slate-900">Split</strong>, and{" "}
              <strong className="text-slate-900">Total</strong>.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fullscreen timing.</strong> Go
              fullscreen for a big, readable stopwatch. In fullscreen, you can
              also{" "}
              <strong className="text-slate-900">tap/click the time</strong> to
              start or pause.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Reset cleanly.</strong> Press{" "}
              <strong className="text-slate-900">R</strong> (or use Reset) to
              clear elapsed time and laps. Useful between attempts so you don’t
              mix sets.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Keyboard-first flow.</strong>{" "}
              Use Space, L, C, R, and F to do everything quickly. Tip: click the
              stopwatch once so the page captures shortcuts.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Start</strong>: press{" "}
                <strong className="text-slate-900">Space</strong> (or Start) to
                begin timing.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Add laps</strong>: press{" "}
                <strong className="text-slate-900">L</strong> to record splits
                while you go.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">3) Copy or reset</strong>:
                press <strong className="text-slate-900">C</strong> to copy CSV,
                or <strong className="text-slate-900">R</strong> to start fresh.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Best for
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Intervals</strong>: track
                  sets with consistent lap splits (work/rest, drills, rounds).
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Speedcubing</strong>: time
                  attempts and keep a lap list you can copy.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Practice + rehearsals
                  </strong>
                  : capture segments during music, speaking, or run-throughs.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Any quick timing</strong>:
                  clean fullscreen view when you want a big display.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a countdown instead of count-up?{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want structured work/rest rounds?{" "}
                  <Link
                    to="/hiit-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    HIIT Timer
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/tabata-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Tabata Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer a dedicated speed solve layout?{" "}
                  <Link
                    to="/speedcubing-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Speedcubing Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need multiple timers at once for stations?{" "}
                  <Link
                    to="/multiple-timers"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Multiple Timers
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a clean big-screen timer view?{" "}
                  <Link
                    to="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </Link>
                  .
                </div>
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
                <span>How it works, shortcuts, and export notes</span>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Keyboard shortcuts
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      <strong className="text-slate-900">Space</strong>: start /
                      pause
                    </li>
                    <li>
                      <strong className="text-slate-900">L</strong>: lap (split)
                    </li>
                    <li>
                      <strong className="text-slate-900">C</strong>: copy laps
                      (CSV)
                    </li>
                    <li>
                      <strong className="text-slate-900">R</strong>: reset
                    </li>
                    <li>
                      <strong className="text-slate-900">F</strong>: fullscreen
                    </li>
                    <li>
                      <strong className="text-slate-900">Esc</strong>: exit
                      fullscreen
                    </li>
                  </ul>
                  <p className="mt-2">
                    Tip: click the stopwatch once so shortcuts are captured.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Laps and splits
                  </div>
                  <p className="mt-2">
                    <strong className="text-slate-900">Total</strong> is the
                    elapsed time since the start.{" "}
                    <strong className="text-slate-900">Split</strong> is the
                    time since your previous lap. The lap list is shown with the
                    most recent lap first.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Copy format
                  </div>
                  <p className="mt-2">
                    Copy uses a CSV header and one row per lap:{" "}
                    <strong className="text-slate-900">
                      Lap, Split Time, Total Time
                    </strong>
                    . Times include milliseconds and use{" "}
                    <strong className="text-slate-900">m:ss.mmm</strong> (or{" "}
                    <strong className="text-slate-900">h:mm:ss.mmm</strong> for
                    long sessions).
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
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

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> For consistent lap
            splits, press Lap at the same point each rep (for example, end of a
            round or the moment you finish a set). Then copy the CSV to compare
            attempts later.
          </div>
        </details>
      </div>
    </section>
  );
}
