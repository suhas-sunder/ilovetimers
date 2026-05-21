export default function Disclaimer() {
  const preview =
    "Track elapsed time with start/pause • Record laps (splits) • Reset anytime • Fullscreen big digits • Keyboard shortcuts";

  return (
    <section className="space-y-4">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                How this count up timer helps
              </h2>
              <p className="mt-1 text-sm font-medium text-[var(--ilt-text-muted)]">
                {preview}
              </p>
            </div>

            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Simple elapsed time.</strong>{" "}
              Start and pause as needed to track time spent on a task, workout,
              meeting, experiment, or practice session.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Laps and splits.</strong>{" "}
              Record laps while running to capture checkpoints. Each lap shows{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Total</span>{" "}
              elapsed time and{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Split</span> time
              since the previous lap.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Big readable display.</strong>{" "}
              Digits auto-size to stay clear at a distance. Use fullscreen for a
              wall display, classroom screen, or a phone on a stand.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fast control.</strong>{" "}
              Start/pause, record laps, and reset without hunting for controls.
              In fullscreen, you can also{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                tap/click the time
              </span>{" "}
              to start or pause.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Fullscreen focused mode.
              </strong>{" "}
              Go fullscreen to remove distractions and keep the timer readable.
              Exit anytime with{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Keyboard shortcuts.</strong> If
              you’re at a laptop, use shortcuts for quick control without losing
              focus.
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Quick ways to use it
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Meetings</strong> by
                  starting when the meeting begins, then tapping{" "}
                  <strong className="text-[var(--ilt-text-primary)]">Lap</strong> for agenda
                  transitions or speaker changes.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Work sessions</strong> by
                  tracking focused time spent on a single task (pause when
                  interrupted, resume when you’re back).
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Workouts</strong> by using
                  laps for sets/rounds so you can review splits afterward.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Lab / experiments</strong>{" "}
                  by recording lap checkpoints (mixing, heating, incubation
                  starts) while keeping a clean fullscreen display.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Need a classic stopwatch feel?{" "}
                  <a
                    href="/stopwatch"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Stopwatch
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Using this specifically for meetings?{" "}
                  <a
                    href="/meeting-count-up-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Meeting Count Up Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want a countdown instead of elapsed time?{" "}
                  <a
                    href="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </a>{" "}
                  or{" "}
                  <a
                    href="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need structured intervals?{" "}
                  <a
                    href="/hiit-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    HIIT Timer
                  </a>
                  ,{" "}
                  <a
                    href="/tabata-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Tabata Timer
                  </a>
                  , or{" "}
                  <a
                    href="/round-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Round Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need several timers running side-by-side?{" "}
                  <a
                    href="/multiple-timers"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Multiple Timers
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>

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
                    <span className="font-semibold text-[var(--ilt-text-primary)]">L</span> lap
                    · <span className="font-semibold text-[var(--ilt-text-primary)]">R</span>{" "}
                    reset ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Fullscreen uses the browser Fullscreen API on the timer
                    card. In fullscreen you can tap/click the time readout to
                    start or pause.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Lap calculations
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Total</span>{" "}
                    is elapsed time since start.{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Split</span>{" "}
                    is time since the previous lap (or since start for Lap 1).
                    Laps are shown most recent first.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Display rounding
                  </div>
                  <p className="mt-2">
                    The display is shown in whole seconds (rounded up) for a
                    steady readout, while internal timing continues in
                    milliseconds for smooth updates.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> If you’re using a
            shared screen (meeting/classroom), go fullscreen and use{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">Lap</span> to mark
            transitions. For personal tracking, keep it windowed and record laps
            for checkpoints you want to review later.
          </div>
        </details>
      </div>
    </section>
  );
}
