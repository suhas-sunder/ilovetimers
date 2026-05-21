import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Big fullscreen digits • Zen auto-hide • 12/24-hour • Seconds & date toggles • Keyboard shortcuts • Copy timestamp";

  return (
    <section className="space-y-4">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Minimalist clock at a glance
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
              A clean, distraction-free clock with big readable digits.
            </strong>{" "}
            Use it as a desk clock, wall display, or fullscreen “screensaver”
            clock. Toggle seconds, switch 12/24-hour time, show or hide the
            date, and enable Zen mode to auto-hide controls while you display
            the time.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen display.</strong>{" "}
              One-click fullscreen with a high-contrast big-digit view designed
              to be read from across the room.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">12/24-hour toggle.</strong>{" "}
              Switch formats instantly, including AM/PM in 12-hour mode.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Seconds on/off.</strong> Show
              seconds for precision, or hide them for a calmer, cleaner display.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Date line.</strong> Optionally
              show today’s date under the time (weekday + full date).
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Zen mode.</strong> In
              fullscreen, controls fade away after a moment of inactivity. Move
              the mouse or tap to bring them back.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Copy timestamp.</strong> Copy a
              clean text block that includes the current time, your local time
              zone label, and ISO timestamp for notes or logs.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Set your display</strong>:
                choose 12/24-hour, seconds, and date.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Go fullscreen</strong>:
                click Fullscreen or press{" "}
                <strong className="text-[var(--ilt-text-primary)]">F</strong>.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Keep it clean</strong>:
                turn on Zen, then move/tap to reveal controls when needed.
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
                  <strong className="text-[var(--ilt-text-primary)]">Desk clock</strong>: keep a
                  large readable clock open while you work.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Wall display</strong>: run
                  fullscreen on a spare monitor or TV.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Meetings/classes</strong>:
                  glanceable time with optional seconds.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Focus sessions</strong>:
                  Zen mode keeps the UI out of the way.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Need a simple time view with a classic style?{" "}
                  <Link
                    to="/digital-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Digital Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want multiple time zones side-by-side?{" "}
                  <Link
                    to="/world-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    World Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need UTC specifically?{" "}
                  <Link
                    to="/utc-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    UTC Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer a timer instead of a clock?{" "}
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
                <span>Shortcuts & display behavior</span>
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
                      <strong className="text-[var(--ilt-text-primary)]">F</strong>: fullscreen
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">S</strong>: toggle
                      seconds
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">T</strong>: toggle
                      12/24-hour
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">D</strong>: toggle date
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">Z</strong>: toggle Zen
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">C</strong>: copy
                      timestamp
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">Esc</strong>: exit
                      fullscreen
                    </li>
                  </ul>
                  <p className="mt-2">
                    Tip: click the clock card once so shortcuts are captured.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Zen mode behavior
                  </div>
                  <p className="mt-2">
                    When Zen is on, UI elements fade after a short idle period
                    during fullscreen. Move the mouse, tap, or press a key to
                    show controls again.
                  </p>
                  <p className="mt-2">
                    The time display keeps updating continuously, whether
                    seconds are shown or not.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> If you’re using
            this on a second monitor, enable fullscreen + Zen and leave seconds
            off for the cleanest “always-on” display.
          </div>
        </details>
      </div>
    </section>
  );
}
