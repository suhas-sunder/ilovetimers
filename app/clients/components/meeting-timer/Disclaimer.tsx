import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Presets + custom minutes • Fullscreen big countdown • Optional sound + final beeps • Clear status • Keyboard shortcuts";

  return (
    <section className="space-y-4">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Meeting Timer at a glance
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
              Use this page to run a clear countdown for each agenda item or
              timebox.
            </strong>{" "}
            Pick a preset or set custom minutes, press{" "}
            <strong className="text-[var(--ilt-text-primary)]">Start</strong>, and switch to{" "}
            <strong className="text-[var(--ilt-text-primary)]">Fullscreen</strong> when you want
            a big display everyone can read. Optional sound and a final
            countdown beep are available if you want audible cues.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Presets plus custom minutes.
              </strong>{" "}
              Choose common timeboxes fast, or type a custom value{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">1 to 180</span>{" "}
              minutes for unusual agenda items.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Fullscreen meeting view.
              </strong>{" "}
              Go fullscreen for a large, readable countdown. While fullscreen,
              you can{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                tap or click the time
              </span>{" "}
              to start or pause. Exit with{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Clear status cues.</strong> The
              timer shows{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Ready</span>,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Running</span>, or{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Paused</span>, and
              highlights the final seconds so it is obvious when time is nearly
              up.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Optional sound.</strong> Enable{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Sound</span> for a
              completion beep. Turn on{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Final beeps</span>{" "}
              to hear quick beeps in the last 5 seconds.
              <div className="mt-2 text-xs font-semibold text-[var(--ilt-text-muted)]">
                Final beeps require Sound.
              </div>
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Keyboard shortcuts.</strong>{" "}
              Use quick controls without hunting for buttons: Space to start or
              pause, R to reset, and F for fullscreen.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Click-to-toggle.</strong> In
              fullscreen, clicking the time toggles start or pause, so you can
              run the room without needing precise button clicks.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Choose a timebox</strong>:
                pick a preset or enter custom minutes.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Start the timer</strong>:
                press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Start</span> (or
                Space). Pause if discussion needs a quick stop.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Go fullscreen</strong>:
                press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Fullscreen</span>{" "}
                (or F) for a large display. Tap the time to start or pause while
                fullscreen.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Example agenda timeboxes
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Daily standup</strong>: 10m
                  total, or timebox each segment (updates, blockers, wrap-up)
                  with 2 to 3 minute timers.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Client call</strong>: 5m
                  intro, 15m requirements, 10m demo, 10m Q&amp;A, 5m next steps.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Design review</strong>: 2m
                  context, 8m discussion, 3m decision, 2m action items.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Break handling</strong>:
                  Pause during interruptions and resume when you are back on the
                  topic, without redoing mental math.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Want to track elapsed time instead of time remaining?{" "}
                  <Link
                    to="/meeting-count-up-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Meeting Count Up Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a presenter-friendly view for talks or demos?{" "}
                  <Link
                    to="/presentation-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Presentation Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer no audio cues at all?{" "}
                  <Link
                    to="/silent-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want a simple general countdown?{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Running a class or training session?{" "}
                  <Link
                    to="/classroom-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Classroom Timer
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
                <span>Controls + behavior details</span>
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
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2">
                    Shortcuts are ignored while typing in inputs.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Countdown behavior
                  </div>
                  <p className="mt-2">
                    The timer counts down to{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">0:00</span>{" "}
                    and stops automatically. Reset returns to your currently
                    selected minutes.
                  </p>
                  <p className="mt-2">
                    The display shows{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">m:ss</span>{" "}
                    for most timeboxes, and switches to{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      h:mm:ss
                    </span>{" "}
                    when over an hour.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Fullscreen expands the time display to fit your screen and
                    keeps lightweight controls at the top. Clicking the time
                    toggles start or pause.
                  </p>
                  <p className="mt-2">
                    If fullscreen is blocked, try again after an explicit click
                    on the Fullscreen button (some browsers require a user
                    gesture).
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Sound notes
                  </div>
                  <p className="mt-2">
                    If you do not hear beeps, check your device volume and make
                    sure your browser tab is not muted. Some browsers delay
                    audio until after a user gesture.
                  </p>
                  <p className="mt-2">
                    Final beeps trigger only in the last{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">5</span>{" "}
                    seconds when enabled.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> If you are running
            a room, go fullscreen and use{" "}
            <strong className="text-[var(--ilt-text-primary)]">Space</strong> to start or pause
            without moving your mouse. If you want clear wrap-up pressure, turn
            on <strong className="text-[var(--ilt-text-primary)]">Final beeps</strong> for the
            last 5 seconds.
          </div>
        </details>
      </div>
    </section>
  );
}
