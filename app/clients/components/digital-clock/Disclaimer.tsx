export default function Disclaimer() {
  const preview =
    "Big fullscreen clock • Local time • Seconds toggle • 12/24-hour mode • Copy time • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Digital Clock at a glance
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
              Use this page to show the current local time in big, readable
              digits.
            </strong>{" "}
            Toggle seconds and 12/24-hour time, switch to fullscreen for
            distance viewing, and copy the current time when you need an
            accurate timestamp for a room, meeting, class, or workspace.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Big, glanceable time.</strong>{" "}
              Designed to be readable across a room, especially in fullscreen.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Seconds on or off.</strong>{" "}
              Show seconds for precision, or hide them for a calmer display.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">12-hour or 24-hour.</strong>{" "}
              Switch formats instantly depending on your setting or preference.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Copy the time.</strong>{" "}
              One-click copy gives you the current time plus your timezone and
              date for easy pasting into notes, chat, or logs.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen mode.</strong> Turn
              this page into a clean wall clock. In fullscreen you can{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                tap/click the time
              </span>{" "}
              to copy.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Keyboard shortcuts.</strong>{" "}
              Use the clock without a mouse: fullscreen, copy, and toggles.
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
                  1) Choose your format
                </strong>
                : turn{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Seconds</span>{" "}
                on/off and pick{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">12/24-hour</span>
                .
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">
                  2) Go fullscreen (optional)
                </strong>{" "}
                for a big wall-clock view.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Copy when needed</strong>{" "}
                with <span className="font-semibold text-[var(--ilt-text-primary)]">C</span> (or
                the <span className="font-semibold text-[var(--ilt-text-primary)]">Copy</span>{" "}
                button). In fullscreen, click the time to copy.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                When this clock is useful
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Classrooms</strong>: keep a
                  visible time reference for pacing and transitions.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Meetings</strong>: display
                  the time to stay on schedule, especially on a shared screen.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Offices & front desks
                  </strong>
                  : a clean “always visible” clock on a spare monitor.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Timestamping</strong>: copy
                  the time + timezone for notes, handoffs, or quick logs.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Need multiple time zones?{" "}
                  <a
                    href="/world-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    World Clock
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Converting time zones for a call?{" "}
                  <a
                    href="/time-zone-converter"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Zone Converter
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want a basic “time right now” page?{" "}
                  <a
                    href="/current-local-time"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Current Local Time
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a precise reference time?{" "}
                  <a
                    href="/utc-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    UTC Clock
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
                    <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">C</span> copy
                    · <span className="font-semibold text-[var(--ilt-text-primary)]">S</span>{" "}
                    toggle seconds ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">1</span>{" "}
                    12-hour ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">2</span>{" "}
                    24-hour ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[var(--ilt-text-muted)]">
                    If shortcuts don’t work, click/tap the clock once so it has
                    focus.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    What “Copy” includes
                  </div>
                  <p className="mt-2">
                    Copy includes your{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      displayed time
                    </span>
                    , your{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      timezone
                    </span>
                    , the{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">date</span>,
                    and an{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      ISO timestamp
                    </span>{" "}
                    for unambiguous pasting into logs or notes.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Time source
                  </div>
                  <p className="mt-2">
                    The clock shows your device’s{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      local time
                    </span>{" "}
                    and timezone. If your device time is incorrect, the display
                    will be incorrect too.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Some browsers require a user gesture to enter fullscreen. In
                    fullscreen, clicking/tapping the time copies it.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Note.</strong> This page shows
            your device’s local time and detected timezone. For a standardized
            reference, use{" "}
            <a
              href="/utc-clock"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              UTC Clock
            </a>{" "}
            or{" "}
            <a
              href="/atomic-clock"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Atomic Clock
            </a>
            .
          </div>
        </details>
      </div>
    </section>
  );
}
