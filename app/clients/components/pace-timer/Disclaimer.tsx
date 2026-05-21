import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Running + rowing modes • Pace or finish-time input • Interval beeps • Fullscreen big display • Keyboard shortcuts • “Should be at” live guidance";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">Pace timer</h2>
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
              Set a target pace (or a finish time) and follow a clear countdown
              built for steady efforts.
            </strong>{" "}
            Switch between running and rowing, keep your split consistent with
            interval beeps, and use fullscreen when you need a big,
            distance-based display.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Running + rowing.</strong>{" "}
              Choose running (min/km or min/mi) or rowing (split per{" "}
              <strong className="text-[var(--ilt-text-primary)]">500m</strong>), then set your
              distance.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Two ways to set the goal.
              </strong>{" "}
              Enter a <strong className="text-[var(--ilt-text-primary)]">target pace</strong> or
              switch to <strong className="text-[var(--ilt-text-primary)]">finish time</strong>{" "}
              to have the tool compute the pace for you.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Interval beeps.</strong> Beep
              every X units to stay on track (running: per X{" "}
              <strong className="text-[var(--ilt-text-primary)]">km/mi</strong>, rowing: per X ×{" "}
              <strong className="text-[var(--ilt-text-primary)]">500m</strong>). Adjust volume
              and test the beep.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen focus.</strong> Big
              time display with a simple subtitle showing your target pace and
              total distance.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                “Should be at” guidance.
              </strong>{" "}
              While running, see where you should be at this moment based on
              your target pace and elapsed time.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Keyboard shortcuts.</strong>{" "}
              Space start/pause · R reset · F fullscreen.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">
                  1) Pick mode + distance
                </strong>
                : choose Running or Rowing, then set your distance (km/mi or
                meters).
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">
                  2) Set pace or finish time
                </strong>
                : enter your target pace (like{" "}
                <strong className="text-[var(--ilt-text-primary)]">5:00</strong> /km or{" "}
                <strong className="text-[var(--ilt-text-primary)]">2:10</strong> /500m), or
                enter a finish time to calculate the pace.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">
                  3) Start + optional beeps
                </strong>
                : press <strong className="text-[var(--ilt-text-primary)]">Start</strong> (or{" "}
                <strong className="text-[var(--ilt-text-primary)]">Space</strong>), then set
                “Beep every” if you want steady split reminders.
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
                  <strong className="text-[var(--ilt-text-primary)]">Steady runs</strong>: lock
                  in min/km or min/mi and follow the countdown without doing
                  math mid-workout.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Rowing pieces</strong>: set
                  a /500m split for 2k, 5k, or custom distances.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Pacing discipline</strong>:
                  interval beeps and “should be at” help you hold a consistent
                  effort.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Big display timing
                  </strong>
                  : go fullscreen for a clean clock you can glance at quickly.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Want structured intervals (rounds/work-rest)?{" "}
                  <Link
                    to="/hiit-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    HIIT Timer
                  </Link>
                  ,{" "}
                  <Link
                    to="/tabata-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Tabata Timer
                  </Link>
                  , or{" "}
                  <Link
                    to="/round-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Round Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer a simple workout countdown?{" "}
                  <Link
                    to="/workout-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Workout Timer
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/rest-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Rest Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a pure big-screen clock?{" "}
                  <Link
                    to="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want multiple timers at once?{" "}
                  <Link
                    to="/multiple-timers"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Multiple Timers
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
                <span>How it works, shortcuts, and notes</span>
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
                      <strong className="text-[var(--ilt-text-primary)]">Space</strong>:
                      start/pause
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">R</strong>: reset
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">F</strong>: fullscreen
                    </li>
                  </ul>
                  <p className="mt-2">
                    Tip: click the card once so shortcuts are captured.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Entry formats
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      Pace examples:{" "}
                      <strong className="text-[var(--ilt-text-primary)]">5:00</strong> (run
                      pace) or <strong className="text-[var(--ilt-text-primary)]">2:10</strong>{" "}
                      (rowing split).
                    </li>
                    <li>
                      Finish time accepts{" "}
                      <strong className="text-[var(--ilt-text-primary)]">mm:ss</strong> or{" "}
                      <strong className="text-[var(--ilt-text-primary)]">hh:mm:ss</strong>.
                    </li>
                  </ul>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Interval beeps
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      Running: “Beep every” is in{" "}
                      <strong className="text-[var(--ilt-text-primary)]">km</strong> or{" "}
                      <strong className="text-[var(--ilt-text-primary)]">mi</strong>.
                    </li>
                    <li>
                      Rowing: “Beep every” is in multiples of{" "}
                      <strong className="text-[var(--ilt-text-primary)]">500m</strong> (example:
                      2 = every 1000m).
                    </li>
                    <li>If Sound is off, interval controls are disabled.</li>
                  </ul>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Audio note
                  </div>
                  <p className="mt-2">
                    Some browsers require a user interaction before audio can
                    play. If you don’t hear beeps, press Start once with Sound
                    on, then try Test beep.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> If you’re using
            fullscreen, enter your settings first, then go fullscreen and start.
            For steady pacing, set “Beep every” to{" "}
            <strong className="text-[var(--ilt-text-primary)]">1</strong> unit (1 km/mi or 500m)
            to get consistent reminders.
          </div>
        </details>
      </div>
    </section>
  );
}
