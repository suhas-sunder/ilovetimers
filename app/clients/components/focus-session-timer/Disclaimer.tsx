import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Pick a session length • Start/pause • Fullscreen mode • Optional sound • Final beeps • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Focus Session Timer at a glance
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
              Use this page for a single work countdown with a clean display.
            </strong>{" "}
            Choose one session length, start the timer, and keep the display
            clean. When you finish, you will get a short break suggestion.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">One session, one goal.</strong>{" "}
              Set a single focus length and run it start to finish. No
              multi-phase cycles, no extra steps.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Quick presets.</strong> Tap a
              preset (25m, 45m, 60m, 90m, etc.) or type an exact minute value.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Start/pause anytime.</strong>{" "}
              Space toggles start and pause. Reset returns to your chosen
              session length.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen display.</strong> Go
              fullscreen for a big, readable countdown. In fullscreen, you can
              click/tap the timer to start or pause.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Optional sound.</strong> Enable
              a finish beep. You can also enable final beeps for the last few
              seconds.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Keyboard shortcuts.</strong>{" "}
              Space start/pause, R reset, F fullscreen, S sound. Click the timer
              card once if shortcuts do not respond.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Set a length</strong>:
                choose a preset or type minutes (1 to 240).
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Start</strong>: press
                Start or hit Space. Use Pause if you need to stop briefly.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">
                  3) Go fullscreen if needed
                </strong>
                : press F (or tap Fullscreen) for a clean display.
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
                  <strong className="text-[var(--ilt-text-primary)]">Focused work block</strong>:
                  45 to 90 minutes on one task with a visible finish time.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Study sprint</strong>: set
                  25 to 60 minutes, then take a short reset break after.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Meeting prep</strong>: run
                  a focused prep window before a call, then stop when done.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Second-screen timer
                  </strong>
                  : fullscreen on another display so you do not keep checking a
                  phone.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Want a structured cycle with breaks built in?{" "}
                  <Link
                    to="/pomodoro-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Pomodoro Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a simple all-purpose countdown?{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer no audio at all?{" "}
                  <Link
                    to="/silent-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want a dedicated big-display mode?{" "}
                  <Link
                    to="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a short reset after focus?{" "}
                  <Link
                    to="/break-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Break Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Tracking time upward instead?{" "}
                  <Link
                    to="/count-up-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Count Up Timer
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
                <span>
                  How it behaves (timing, sound, fullscreen, shortcuts)
                </span>
                <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-2">
                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Countdown timing
                  </div>
                  <p className="mt-2">
                    The timer anchors to a target end time, then computes the
                    remaining time from your device clock. Browser scheduling,
                    sleeping devices, and power-saving modes can still affect
                    animation smoothness and sound timing.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Sound behavior
                  </div>
                  <p className="mt-2">
                    Sound uses WebAudio. Some browsers require a user action
                    before audio can play, so if you do not hear beeps, click
                    Start once and try again.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[var(--ilt-text-muted)]">
                    “Final beeps” only runs for the last few seconds and is
                    disabled when Sound is off.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen notes
                  </div>
                  <p className="mt-2">
                    In fullscreen, a top bar appears with Exit (Esc). You can
                    also click/tap the timer display to start or pause quickly.
                  </p>
                </div>

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
                    <span className="font-semibold text-[var(--ilt-text-primary)]">S</span>{" "}
                    sound ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[var(--ilt-text-muted)]">
                    If shortcuts do not work, click/tap the timer card once so
                    it has focus.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    If you need multi-timer workflows
                  </div>
                  <p className="mt-2">
                    This page is intentionally single-session. If you want
                    several timers running at once, use{" "}
                    <Link
                      to="/multiple-timers"
                      className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                    >
                      Multiple Timers
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> If you are using
            sound, keep the tab unmuted and start the timer with a click/tap at
            least once so your browser allows audio.
          </div>
        </details>
      </div>
    </section>
  );
}
