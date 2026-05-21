export default function Disclaimer() {
  const preview =
    "Repeating reminders • Interval presets • Optional sound • Fullscreen mode • Tap-to-start • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Water Reminder Timer at a glance
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
              Use this page to set a repeating “drink water” reminder that keeps
              cycling while the tab is open.
            </strong>{" "}
            Pick an interval, press Start, and the timer automatically resets
            after each reminder. Turn sound on/off, use fullscreen for a clean
            display, and fire a reminder instantly when you want it.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Repeating reminders.</strong>{" "}
              The countdown loops automatically after each reminder.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Quick intervals.</strong>{" "}
              Choose a preset (15–120m) or type a custom interval (5–360m).
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Optional sound.</strong> Use a
              gentle beep for each reminder, or keep it silent.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Remind now.</strong> Fire an
              immediate reminder and restart the cycle from that moment.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen mode.</strong> In
              fullscreen, the display is extra readable and you can{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                tap/click the time
              </span>{" "}
              to start or pause.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Keyboard shortcuts.</strong>{" "}
              Start/pause, fullscreen, sound toggle, reset, and “remind now”
              without using the mouse.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Fast setup
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">
                  1) Pick your interval
                </strong>
                : select a preset or enter minutes.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Press Start</strong>: the
                countdown runs and auto-restarts after each reminder.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Stay flexible</strong>:
                use{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Remind now</span>{" "}
                when you want an immediate ping, or pause/resume anytime.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Helpful ways to use it
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Desk work</strong>: set 45m
                  or 60m reminders while you’re focused.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Deep work sessions</strong>
                  : keep sound off and rely on visual checking.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Shared spaces</strong>: run
                  fullscreen on a spare monitor for an always-visible reminder.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Routine building</strong>:
                  hit Start once and let the loop carry you through the day.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Want this without audio?{" "}
                  <a
                    href="/silent-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer a simple one-off countdown?{" "}
                  <a
                    href="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want multiple reminders at once?{" "}
                  <a
                    href="/multiple-timers"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Multiple Timers
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a big clean display?{" "}
                  <a
                    href="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 ilt-surface-card p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-[var(--ilt-text-primary)] ilt-focus-ring">
                <span>Details and shortcuts</span>
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
                    <span className="font-semibold text-[var(--ilt-text-primary)]">N</span>{" "}
                    remind now ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">R</span>{" "}
                    reset all ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">S</span>{" "}
                    sound ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[var(--ilt-text-muted)]">
                    If shortcuts don’t work, click/tap the card once so it has
                    focus.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    What “Reset” does
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      Reset cycle
                    </span>{" "}
                    restarts the countdown for the current interval without
                    changing your reminder count.{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      Reset all
                    </span>{" "}
                    restarts the countdown and clears the reminders count back
                    to 0.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Sound behavior
                  </div>
                  <p className="mt-2">
                    Sound is a short WebAudio beep. Some browsers only allow
                    audio after you interact with the page (click/tap/press a
                    key).
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Timing notes
                  </div>
                  <p className="mt-2">
                    This runs while the page is open. Background tabs may update
                    less often, so reminders can be delayed depending on browser
                    power-saving behavior.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Some browsers require a user gesture to enter fullscreen. In
                    fullscreen, clicking/tapping the timer display toggles
                    start/pause.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Note.</strong> Reminders run in
            your browser while this tab is open. If you need a reminder that
            keeps working after you close the page, you’ll want device or app
            notifications instead.
          </div>
        </details>
      </div>
    </section>
  );
}
