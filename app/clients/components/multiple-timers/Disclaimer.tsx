import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Run 2+ countdowns side by side • Presets + custom minutes/seconds • Start/Pause/Reset per timer or all at once • Optional sound + final beeps • Fullscreen + keyboard shortcuts • Remembers your setup";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Multiple timers at a glance
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
              Run multiple countdown timers at the same time with big, readable
              digits and independent controls.
            </strong>{" "}
            Start two or more timers side by side, set each one with quick
            presets or exact minutes and seconds, and manage everything without
            juggling tabs.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Per-timer control.</strong>{" "}
              Start, pause, reset, and silence alarms for each timer
              independently.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">All-timers control.</strong>{" "}
              Start all, pause all, reset all, or stop all alarms in one click.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Presets + custom time.</strong>{" "}
              Use quick minute presets or set exact{" "}
              <strong className="text-[var(--ilt-text-primary)]">minutes</strong> and{" "}
              <strong className="text-[var(--ilt-text-primary)]">seconds</strong>.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Sound options.</strong> Toggle
              sound on/off, and optionally enable final countdown beeps (last 5
              seconds).
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen mode.</strong> Clean
              layout with top controls and a bottom status strip for distance
              viewing.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Remembers your setup.</strong>{" "}
              Your timers, labels, and sound settings are saved on this device.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Set each timer</strong>:
                pick a preset or type minutes and seconds (it resets that timer
                to the new duration).
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Start</strong>: use{" "}
                <strong className="text-[var(--ilt-text-primary)]">Start</strong> on a timer, or{" "}
                <strong className="text-[var(--ilt-text-primary)]">Start all</strong> for the
                whole grid.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Finish cleanly</strong>:
                stop alarms when they ring, or hit{" "}
                <strong className="text-[var(--ilt-text-primary)]">X</strong> to stop all alarms
                fast.
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
                  <strong className="text-[var(--ilt-text-primary)]">Cooking</strong>: main +
                  side dish timers without switching apps.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Workouts</strong>:
                  intervals + rest running in parallel.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Classes & labs</strong>:
                  multiple stations or groups sharing one screen.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Study blocks</strong>:
                  different tasks with separate countdowns.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Want one simple countdown?{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Training formats built-in?{" "}
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
                  Need focused work blocks?{" "}
                  <Link
                    to="/pomodoro-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Pomodoro Timer
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/focus-session-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Focus Session Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer no sound at all?{" "}
                  <Link
                    to="/silent-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </Link>{" "}
                  or a big display?{" "}
                  <Link
                    to="/fullscreen-timer"
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
                      start/pause all
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">R</strong>: reset all
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">A</strong>: add timer
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">X</strong>: stop all
                      alarms
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
                    Tip: click the timer card once so shortcuts are captured.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Timer behavior notes
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      Changing presets or minutes/seconds{" "}
                      <strong className="text-[var(--ilt-text-primary)]">resets</strong> that
                      timer to the new duration.
                    </li>
                    <li>
                      When a timer hits{" "}
                      <strong className="text-[var(--ilt-text-primary)]">0</strong>, it switches
                      into an <strong className="text-[var(--ilt-text-primary)]">alarm</strong>{" "}
                      state. Use{" "}
                      <strong className="text-[var(--ilt-text-primary)]">Stop alarm</strong> (on
                      the tile) or{" "}
                      <strong className="text-[var(--ilt-text-primary)]">Stop alarms</strong>{" "}
                      (global) to silence it.
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">Final beeps</strong>{" "}
                      (if enabled) play during the last 5 seconds before 0.
                    </li>
                  </ul>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Saved on this device
                  </div>
                  <p className="mt-2">
                    Timer labels, durations, remaining time, and sound settings
                    are saved in your browser on this device. If you clear site
                    data or use a private window, the saved setup may not
                    persist.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> For a shared
            screen, go fullscreen and use presets for quick setup. For quiet
            spaces, turn Sound off, or keep Sound on and enable Final beeps for
            a clear last-seconds cue.
          </div>
        </details>
      </div>
    </section>
  );
}
