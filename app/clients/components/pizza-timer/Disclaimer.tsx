import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Frozen pizza presets • Custom minutes/seconds • Fullscreen big display • Check reminder • Final beeps • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Pizza timer
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
              Use fast presets for frozen pizza or set your own time, then run a
              big, readable countdown.
            </strong>{" "}
            Turn on a “check” reminder before it finishes, optional final beeps
            in the last seconds, and use fullscreen when you want a
            distance-safe display.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Quick presets.</strong> Tap a
              preset for common scenarios like{" "}
              <strong className="text-[var(--ilt-text-primary)]">Frozen (Oven)</strong>,{" "}
              <strong className="text-[var(--ilt-text-primary)]">Frozen (Air fryer)</strong>,
              reheating a slice, or skillet.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Custom time.</strong> Set your
              own minutes and seconds any time. Switching values sets Method to{" "}
              <strong className="text-[var(--ilt-text-primary)]">Custom</strong> without
              changing anything else.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Check reminder.</strong> Choose
              how many minutes before the end you want a reminder (for example:{" "}
              <strong className="text-[var(--ilt-text-primary)]">2 minutes left</strong>) so you
              can check browning and decide if it needs a little more time.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Sound + final beeps.</strong>{" "}
              Toggle sound, enable optional final beeps, and test the reminder
              sound without starting the timer.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen focus.</strong> Go
              fullscreen for a clean, large countdown. In fullscreen you can{" "}
              <strong className="text-[var(--ilt-text-primary)]">tap/click the time</strong> to
              start or pause.
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
                  1) Pick a preset or set time
                </strong>
                : tap a frozen pizza preset, or enter your own minutes and
                seconds.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">
                  2) Choose reminders (optional)
                </strong>
                : set “Check with X min left” and enable final beeps if you want
                a last-second cue.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Start</strong>: press{" "}
                <strong className="text-[var(--ilt-text-primary)]">Start</strong> (or{" "}
                <strong className="text-[var(--ilt-text-primary)]">Space</strong>). Use{" "}
                <strong className="text-[var(--ilt-text-primary)]">Fullscreen</strong> if you
                want the biggest display.
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
                  <strong className="text-[var(--ilt-text-primary)]">Frozen pizza</strong>: pick
                  a preset and get a big countdown you can glance at.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Reheating slices</strong>:
                  quick short timers with a clear stop alert.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Air fryer timing</strong>:
                  set a reminder to check early so you don’t over-brown.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Big display cooking
                  </strong>
                  : fullscreen when your hands are messy or you’re across the
                  kitchen.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Want a general kitchen timer for anything?{" "}
                  <Link
                    to="/cooking-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Cooking Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a simple, clean countdown (no presets)?{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer zero audio?{" "}
                  <Link
                    to="/silent-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want an even bigger display?{" "}
                  <Link
                    to="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Timing multiple dishes at once?{" "}
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
                    Tip: click the card once so shortcuts are captured.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen controls
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      Tap/click the time display to{" "}
                      <strong className="text-[var(--ilt-text-primary)]">start/pause</strong>.
                    </li>
                    <li>Use the top bar buttons for Start/Pause and Reset.</li>
                  </ul>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Reminders
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      “Check with X min left” triggers once when the timer
                      reaches that remaining time.
                    </li>
                    <li>
                      Reminder style can be{" "}
                      <strong className="text-[var(--ilt-text-primary)]">Repeating</strong>{" "}
                      (about 10 seconds) or{" "}
                      <strong className="text-[var(--ilt-text-primary)]">Triple beep</strong>.
                    </li>
                    <li>
                      “Final beeps” plays short beeps in the last 5 seconds (if
                      Sound is on).
                    </li>
                    <li>
                      Use <strong className="text-[var(--ilt-text-primary)]">Stop sound</strong>{" "}
                      to end a repeating reminder early.
                    </li>
                  </ul>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Audio note
                  </div>
                  <p className="mt-2">
                    Some browsers require a user interaction before audio can
                    play. If you don’t hear anything, press Start once with
                    Sound on, then try Test reminder.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> If you want a quick
            “check it” moment, set the check reminder to{" "}
            <strong className="text-[var(--ilt-text-primary)]">2 minutes</strong> for oven or{" "}
            <strong className="text-[var(--ilt-text-primary)]">1 minute</strong> for skillet,
            then decide whether to keep cooking or pull it early.
          </div>
        </details>
      </div>
    </section>
  );
}
