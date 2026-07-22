import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Instant conversion between two time zones • DST-aware results • Shareable link • Copy-friendly output • Fullscreen + keyboard shortcuts";

  return (
    <section className="space-y-4">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Time Zone Converter
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
              Convert a specific date and time from one time zone to another,
              instantly.
            </strong>{" "}
            Pick your <strong className="text-[var(--ilt-text-primary)]">From</strong> and{" "}
            <strong className="text-[var(--ilt-text-primary)]">To</strong> time zones, enter a
            date and time, and the tool shows both local times plus the matching{" "}
            <strong className="text-[var(--ilt-text-primary)]">ISO instant</strong> you can copy
            or share.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Date + time input you control.
              </strong>{" "}
              Choose the specific day and time you mean (not “right now”) and get
              the corresponding local time in another zone.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">DST-aware conversion.</strong>{" "}
              Results follow each zone’s daylight saving rules for the selected
              date, so you don’t have to manually adjust offsets.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Swap in one tap.</strong> Swap
              From and To to convert back the other way without reselecting time
              zones.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Seconds toggle.</strong> Show
              seconds when precision matters, or hide them for a cleaner
              display.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Copy-ready output.</strong>{" "}
              Copy a clean block of text (From zone, To zone, input, both
              rendered times, and ISO) for chats, tickets, and docs.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Shareable link.</strong> Use
              Share to copy a URL that preserves your From/To/date/time and
              seconds setting.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)] sm:col-span-2">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen mode.</strong> Go
              fullscreen for a clean, big display while scheduling, running a
              call, or presenting times on a second screen.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Pick zones</strong>: set
                your <strong className="text-[var(--ilt-text-primary)]">From</strong> and{" "}
                <strong className="text-[var(--ilt-text-primary)]">To</strong> time zones (use
                quick chips for common pairs).
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Enter date/time</strong>:
                choose the day and type the time (HH:MM or HH:MM:SS).
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Copy or share</strong>:
                use Copy for paste-ready text, or Share to send the same setup.
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
                  <strong className="text-[var(--ilt-text-primary)]">
                    Scheduling meetings
                  </strong>
                  : confirm the local time for both sides before sending
                  an invite.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Deadlines</strong>: convert
                  “due at 5pm” across offices without guessing offsets.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Travel and events</strong>:
                  convert departure/arrival times or event start times correctly
                  for the date.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Support & ops</strong>:
                  paste clean conversion details (including ISO) into tickets
                  and incident notes.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Want to keep multiple cities visible all day?{" "}
                  <Link
                    to="/world-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    World Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a clean reference baseline?{" "}
                  <Link
                    to="/utc-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    UTC Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want a big local-time display?{" "}
                  <Link
                    to="/current-local-time"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Current Local Time
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer a simple always-on clock face?{" "}
                  <Link
                    to="/digital-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Digital Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a large fullscreen display for timing (not conversion)?{" "}
                  <Link
                    to="/online-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Planning a launch, class event, or webinar across zones?{" "}
                  <Link
                    to="/event-countdown"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Event Countdown
                  </Link>{" "}
                  pairs well with a checked conversion.
                </div>

                <div className="ilt-surface-muted p-3">
                  Running the meeting after the time is agreed?{" "}
                  <Link
                    to="/meeting-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Meeting Timer
                  </Link>{" "}
                  keeps the room on the planned block.
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
                      <strong className="text-[var(--ilt-text-primary)]">F</strong>: fullscreen
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">S</strong>: swap zones
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">N</strong>: set to now
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">C</strong>: copy output
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
                    Share links
                  </div>
                  <p className="mt-2">
                    Share copies a URL that includes From zone, To zone, date,
                    time, and whether seconds are enabled. Opening the link
                    restores the same conversion setup.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    DST edge cases
                  </div>
                  <p className="mt-2">
                    Around daylight saving transitions, some local times can be
                    skipped or repeated. If you’re converting a time near a DST
                    change and the result looks surprising, try toggling seconds
                    and re-checking the date and time zone selections.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Copy format
                  </div>
                  <p className="mt-2">
                    Copy includes: From zone, To zone, your input date/time,
                    both rendered local times (with abbreviations when
                    available), and the ISO instant for unambiguous reference.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Saved preferences
                  </div>
                  <p className="mt-2">
                    Your last used zones and settings are saved in your browser
                    on this device, so you can pick up where you left off.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> If you schedule
            often, keep one side anchored to{" "}
            <strong className="text-[var(--ilt-text-primary)]">your local zone</strong> (or{" "}
            <strong className="text-[var(--ilt-text-primary)]">UTC</strong>) and swap as needed.
            You’ll avoid offset mistakes and move faster.
          </div>
        </details>
      </div>
    </section>
  );
}
