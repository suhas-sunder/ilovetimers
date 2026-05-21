export default function Disclaimer() {
  const preview =
    "See your local time instantly • Toggle seconds • 12/24-hour mode • Fullscreen • Copy time (with date + week) • Quick compare time zones";

  return (
    <section className="space-y-4">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Current local time tools at a glance
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
              <strong className="text-[var(--ilt-text-primary)]">Big readable time.</strong> A
              clean display you can read at a glance from across the room. Use
              it as a simple “what time is it right now?” screen for desks,
              classrooms, and shared screens.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Seconds on/off.</strong> Toggle
              seconds when precision matters (timed drills, cues, streaming
              overlays), or turn seconds off for a calmer display that updates
              on the minute.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">12-hour or 24-hour.</strong>{" "}
              Switch formats instantly. Use 24-hour for schedules and training
              logs, or 12-hour for general day-to-day readability.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen mode.</strong> Big
              digits for distance viewing (wall display, phone on a stand,
              projected screen). In fullscreen you can{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                tap/click the time
              </span>{" "}
              to copy quickly.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Copy in one click.</strong>{" "}
              Copy includes the current time plus the selected zone label, date,
              and ISO week number so you can paste it into notes, agendas, or
              logs without reformatting.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Quick compare zones.</strong>{" "}
              Instantly switch the main display between Local, Toronto, New
              York, and London, and view additional tiles for fast
              cross-checking.
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Quick ways to use it
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Classroom / coaching
                  </strong>
                  : run fullscreen on a display so everyone can see the time
                  without asking. Toggle seconds for timed starts.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Meetings</strong>: keep the
                  clock visible while presenting, and copy a timestamp into
                  notes when decisions are made.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Streaming / recording
                  </strong>
                  : use seconds for a clean “time now” overlay reference and
                  copy the current time to label takes.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Remote coordination
                  </strong>
                  : switch to another city to sanity-check “what time is it
                  there?” before you send a message or schedule a call.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Need multiple cities at once?{" "}
                  <a
                    href="/world-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    World Clock
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want UTC specifically?{" "}
                  <a
                    href="/utc-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    UTC Clock
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Converting between time zones?{" "}
                  <a
                    href="/time-zone-converter"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Zone Converter
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer a clock-only display style?{" "}
                  <a
                    href="/digital-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Digital Clock
                  </a>{" "}
                  or{" "}
                  <a
                    href="/minimalist-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Minimalist Clock
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a timer instead of a clock?{" "}
                  <a
                    href="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </a>{" "}
                  or{" "}
                  <a
                    href="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
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
                    <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">C</span> copy
                    · <span className="font-semibold text-[var(--ilt-text-primary)]">S</span>{" "}
                    seconds on/off ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">1</span>{" "}
                    12-hour ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">2</span>{" "}
                    24-hour ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[var(--ilt-text-muted)]">
                    Tip: click/tap the card once so it’s focused, then shortcuts
                    work immediately.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Copy format
                  </div>
                  <p className="mt-2">
                    Copy includes the visible time, a zone label (your local
                    timezone name when available, otherwise the selected city),
                    the full date, and the ISO week number.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Timezone source
                  </div>
                  <p className="mt-2">
                    “Local” time and timezone name come from your device/browser
                    settings. If your device timezone is wrong, the displayed
                    local time will be wrong too.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen + clipboard permissions
                  </div>
                  <p className="mt-2">
                    Some browsers require a user gesture to enter fullscreen and
                    may restrict clipboard access in certain contexts. If copy
                    fails, try clicking the page once, then press{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">C</span>{" "}
                    again.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Practical tip.</strong> For a
            wall/TV display, use fullscreen and turn seconds off for a calmer
            look. For timestamping, keep seconds on and copy whenever you need a
            clean “time + date” paste.
          </div>
        </details>
      </div>
    </section>
  );
}
