import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Big projector-friendly countdown • Presets + custom time • Tap-to-start in fullscreen • Optional sound • Loop mode • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen Timer at a glance
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
              Use this page when you need a huge, readable countdown on a
              projector, smartboard, or second display.
            </strong>{" "}
            Start with a preset or set an exact time, then go fullscreen for a
            clean big-digit view.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Big digits.</strong> The time
              auto-scales to fill the screen without clipping, so it stays
              readable from across a room.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fast setup.</strong> Pick a
              preset (1m to 60m) or type{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">mm:ss</span>,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">hh:mm:ss</span>, or
              seconds.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Tap-to-control.</strong> In
              fullscreen, click/tap the timer display to start or pause without
              hunting for buttons.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Sound + loop.</strong> Optional
              finish beep, and{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Loop</span> to
              repeat the same countdown for stations, rounds, or classroom
              rotations.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Keyboard shortcuts.</strong>{" "}
              Space start/pause · R reset · F fullscreen · Esc exit fullscreen.
              Click the timer card once if shortcuts do not respond.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Quick reset.</strong> Reset
              returns to your chosen duration. Presets are disabled while
              running to avoid accidental changes mid-countdown.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Set time</strong>: choose
                a preset or type{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">mm:ss</span>.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Start</strong>: press
                Start or hit Space.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Fullscreen</strong>: press
                F (or tap Fullscreen). In fullscreen, click the time to
                start/pause.
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
                  <strong className="text-[var(--ilt-text-primary)]">Classroom timer</strong>:
                  keep students synced during independent work.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Presentation pacing
                  </strong>
                  : visible countdown on a second display for speakers.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Stations / rotations
                  </strong>
                  : enable Loop for repeating intervals.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Exam / quiz countdown
                  </strong>
                  : big digits, minimal distractions.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Need a classroom-focused page?{" "}
                  <Link
                    to="/classroom-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Classroom Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Timing a talk or meeting?{" "}
                  <Link
                    to="/presentation-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Presentation Timer
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/meeting-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Meeting Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want a simple non-fullscreen countdown?{" "}
                  <Link
                    to="/online-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Online Timer
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a completely silent display?{" "}
                  <Link
                    to="/silent-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Multiple timers on one screen?{" "}
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
                <span>Behavior details (fullscreen, sound, shortcuts)</span>
                <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-2">
                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    In fullscreen, a top bar appears with Exit (Esc). You can
                    also click/tap the time to start or pause quickly.
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
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[var(--ilt-text-muted)]">
                    If shortcuts do not work, click/tap the timer card once so
                    it has focus.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Sound notes
                  </div>
                  <p className="mt-2">
                    Sound uses WebAudio. Some browsers require a user action
                    before audio can play, so if you do not hear the finish
                    beep, click Start once and try again.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Loop mode
                  </div>
                  <p className="mt-2">
                    With Loop on, the timer automatically restarts the same
                    duration when it reaches zero. Turn Loop off to stop at
                    Done.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Input formats
                  </div>
                  <p className="mt-2">
                    You can type seconds (e.g.{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">90</span>),
                    minutes:seconds (e.g.{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">5:00</span>),
                    or hours:minutes:seconds (e.g.{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      1:00:00
                    </span>
                    ).
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
