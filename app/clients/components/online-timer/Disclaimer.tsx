import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Presets + custom time • Sound + loop options • Fullscreen big display • Keyboard shortcuts • Tap-to-start in fullscreen";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Online countdown timer
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
              Start a simple countdown fast, then switch to a big fullscreen
              view when you need distance readability.
            </strong>{" "}
            Use presets for quick setup or type an exact time, then start/pause,
            reset, loop, and control sound without leaving the page.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Presets + exact time.</strong>{" "}
              Pick a quick preset (1–60 minutes) or enter{" "}
              <strong className="text-[var(--ilt-text-primary)]">ss</strong>,{" "}
              <strong className="text-[var(--ilt-text-primary)]">mm:ss</strong>, or{" "}
              <strong className="text-[var(--ilt-text-primary)]">h:mm:ss</strong>.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Start, pause, reset.</strong>{" "}
              One-tap controls for normal use, plus a clean restart flow when a
              timer finishes.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen display.</strong>{" "}
              Big digits with a minimal top bar and a bottom status strip for
              presentations, classrooms, and distance viewing.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Sound + loop.</strong> Enable a
              beep when the timer hits{" "}
              <strong className="text-[var(--ilt-text-primary)]">0</strong>, or loop to repeat
              the same countdown continuously.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Tap-to-control in fullscreen.
              </strong>{" "}
              Click or tap the time area to start or pause quickly while staying
              on the big display.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Keyboard shortcuts.</strong>{" "}
              Space start/pause · R reset · F fullscreen · Esc exit fullscreen.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Set a time</strong>:
                choose a preset or type{" "}
                <strong className="text-[var(--ilt-text-primary)]">mm:ss</strong> (or{" "}
                <strong className="text-[var(--ilt-text-primary)]">ss</strong> /{" "}
                <strong className="text-[var(--ilt-text-primary)]">h:mm:ss</strong>), then hit{" "}
                <strong className="text-[var(--ilt-text-primary)]">Set</strong>.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Start</strong>: press{" "}
                <strong className="text-[var(--ilt-text-primary)]">Start</strong> (or{" "}
                <strong className="text-[var(--ilt-text-primary)]">Space</strong>).
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Go fullscreen</strong>:
                hit <strong className="text-[var(--ilt-text-primary)]">Fullscreen</strong> (or{" "}
                <strong className="text-[var(--ilt-text-primary)]">F</strong>) for a big
                display, then tap/click the timer to start/pause without leaving
                fullscreen.
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
                  <strong className="text-[var(--ilt-text-primary)]">Presentations</strong>:
                  fullscreen timing you can glance at from across the room.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Classrooms</strong>: quick
                  presets and simple controls for transitions.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Work & study</strong>:
                  focus blocks with a clean, readable countdown.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Workouts</strong>: repeat a
                  fixed interval using Loop.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Need a dedicated big display page?{" "}
                  <Link
                    to="/online-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want something tuned for talks?{" "}
                  <Link
                    to="/presentation-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Presentation Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Running a room?{" "}
                  <Link
                    to="/classroom-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Classroom Timer
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
                  Need a completely quiet timer?{" "}
                  <Link
                    to="/silent-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want more structure (rounds/intervals)?{" "}
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
                  Need multiple countdowns side by side?{" "}
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
                    Time entry formats
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">ss</strong> (example{" "}
                      <strong className="text-[var(--ilt-text-primary)]">45</strong>) = 45
                      seconds
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">mm:ss</strong> (example{" "}
                      <strong className="text-[var(--ilt-text-primary)]">05:00</strong>) = 5
                      minutes
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">h:mm:ss</strong>{" "}
                      (example{" "}
                      <strong className="text-[var(--ilt-text-primary)]">1:02:30</strong>) = 1
                      hour, 2 minutes, 30 seconds
                    </li>
                  </ul>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Behavior notes
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      Editing the time while running will{" "}
                      <strong className="text-[var(--ilt-text-primary)]">pause cleanly</strong>{" "}
                      so you can adjust without losing control.
                    </li>
                    <li>
                      When the timer hits{" "}
                      <strong className="text-[var(--ilt-text-primary)]">0</strong>, it will
                      beep if Sound is on. If Loop is enabled, it restarts the
                      same duration automatically.
                    </li>
                    <li>
                      In fullscreen, you can{" "}
                      <strong className="text-[var(--ilt-text-primary)]">
                        tap/click the timer
                      </strong>{" "}
                      to start/pause quickly.
                    </li>
                  </ul>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Audio note
                  </div>
                  <p className="mt-2">
                    Some browsers require a user interaction before audio can
                    play. If you don’t hear the beep, click Start once and try
                    again with Sound enabled.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> For a shared
            screen, go fullscreen first, then hit Start so the timer is easy to
            see from a distance. For repeating intervals, enable Loop and set a
            simple preset (like 1m or 5m).
          </div>
        </details>
      </div>
    </section>
  );
}
