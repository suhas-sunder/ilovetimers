import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Live times across cities • Search + quick add/remove • 12/24-hour + seconds toggle • Copy list • Fullscreen + keyboard shortcuts";

  return (
    <section className="space-y-4">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                World clock
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
              See the current time in multiple cities at a glance, updated live.
            </strong>{" "}
            Pick the cities you care about, toggle seconds or 24-hour time, copy
            the list for messages or notes, and go fullscreen for a clean
            always-on display.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Choose cities fast.</strong>{" "}
              Use the <strong className="text-[var(--ilt-text-primary)]">Popular</strong> chips
              to add or remove cities instantly. Your selected cities appear as
              cards with large, readable times.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Search by name or zone.
              </strong>{" "}
              Type “London”, “Tokyo”, “America”, or “Europe” to filter the list.
              This makes it quick to find a city when the chip list is long.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">12/24-hour + seconds.</strong>{" "}
              Switch between 24-hour and 12-hour time, and show or hide seconds
              depending on how precise you need the display to be.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Copy a shareable list.</strong>{" "}
              Copy your selected cities as text (city, current time, and time
              zone) to paste into chats, emails, or meeting notes.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen display.</strong> Go
              fullscreen for a clean wall-board view. It’s useful for scheduling
              across time zones or keeping a set of offices visible on a second
              screen.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Reset or clear quickly.
              </strong>{" "}
              Use <strong className="text-[var(--ilt-text-primary)]">Reset</strong> to return to
              the default set of cities, or{" "}
              <strong className="text-[var(--ilt-text-primary)]">Clear</strong> to start from
              nothing.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Add cities</strong>: click
                Popular chips to build your list. Use Search if you’re looking
                for a specific region or time zone.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Set the display</strong>:
                toggle 24-hour time and seconds based on your preference.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Share or present</strong>:
                hit Copy to paste your list anywhere, or press Fullscreen for a
                big, readable view.
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
                  <strong className="text-[var(--ilt-text-primary)]">Remote teams</strong>:
                  quickly see local times for teammates and offices.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Meeting scheduling</strong>
                  : compare multiple cities at once before proposing a time.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Travel planning</strong>:
                  keep home and destination times visible while you pack or
                  adjust sleep.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Always-on displays</strong>
                  : fullscreen mode on a spare monitor for a simple world clock
                  dashboard.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Converting a specific time between zones?{" "}
                  <Link
                    to="/time-zone-converter"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Zone Converter
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a clean UTC reference?{" "}
                  <Link
                    to="/utc-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    UTC Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want just your device’s local time in a big display?{" "}
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
                  Need a large fullscreen clock-style display?{" "}
                  <Link
                    to="/online-timer"
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
                      <strong className="text-[var(--ilt-text-primary)]">T</strong>: toggle
                      24-hour time
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">S</strong>: toggle
                      seconds
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">C</strong>: copy list
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">R</strong>: reset to
                      default cities
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">X</strong>: clear all
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
                    Live updating
                  </div>
                  <p className="mt-2">
                    When seconds are shown, the display updates on the next
                    second boundary. When seconds are hidden, it updates on the
                    next minute boundary.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Time zone labels
                  </div>
                  <p className="mt-2">
                    Each city shows its IANA time zone (for example
                    America/Toronto). The “Zone label” is a simplified version
                    to make the zone easier to scan.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Copy format
                  </div>
                  <p className="mt-2">
                    Copy outputs one line per selected city:{" "}
                    <strong className="text-[var(--ilt-text-primary)]">
                      City: time (timeZone)
                    </strong>
                    . If you need conversions (for example “3pm Toronto to
                    London”), use the Time Zone Converter.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> Keep one city as
            your anchor (your local time or UTC), then add the cities you
            schedule with most. You’ll scan faster and make fewer mistakes.
          </div>
        </details>
      </div>
    </section>
  );
}
