import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Today’s golden hour • Sunrise + sunset • Morning + evening windows • Live countdown • Fullscreen • GPS";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="space-y-4">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Golden Hour Clock at a glance
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
              Use this page to get golden hour start and end times for a
              specific date and location, plus a live countdown to the next
              change.
            </strong>{" "}
            Pick a date, set a location (GPS or coordinates), then use
            fullscreen for a clean, distraction-free view when you are on-site.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Golden hour windows.</strong>{" "}
              Shows both{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">morning</span> and{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">evening</span>{" "}
              golden hour ranges in local time.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Sunrise + sunset.</strong>{" "}
              Includes today’s sunrise and sunset for the same date/location so
              you can anchor your plan quickly.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Live countdown.</strong> A big,
              auto-scaling countdown targets the{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">next change</span>{" "}
              (golden hour start/end, sunrise, or sunset).
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen mode.</strong> Go
              fullscreen for a clean on-location display. In fullscreen, you can
              tap Exit (Esc) to leave.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Use GPS.</strong> Pull your
              current coordinates so the times match where you are standing
              (great for travel, hiking, or scouting).
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Two definitions.</strong>{" "}
              Choose a definition that matches your workflow: classic fixed
              duration, or solar-angle based on sun height.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Set location</strong>: use{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">GPS</span> or
                type latitude/longitude.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Pick date</strong>: choose
                the day you are shooting (or press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Today</span>).
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">
                  3) Watch the countdown
                </strong>
                : use fullscreen when you are waiting on the next transition.
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
                  <strong className="text-[var(--ilt-text-primary)]">
                    Photography planning
                  </strong>
                  : estimate when light shifts so you can arrive early and
                  set up.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Travel + scouting</strong>:
                  use GPS to set coordinates for a viewpoint, trail, or
                  neighborhood.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Golden hour reminders
                  </strong>
                  : keep the countdown visible while you prep gear or move
                  between spots.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Coordination</strong>:
                  share a location’s sunrise/sunset context when planning
                  meetups.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Want just sunrise and sunset?{" "}
                  <Link
                    to="/sunrise-sunset-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Sunrise &amp; Sunset Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Coordinating across time zones?{" "}
                  <Link
                    to="/time-zone-converter"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Zone Converter
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need the current local time for a place?{" "}
                  <Link
                    to="/current-local-time"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Current Local Time
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/world-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    World Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Timing a shoot segment or setup window?{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
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
                <span>Method + behavior details</span>
                <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-2">
                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Golden hour definitions
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      Classic: 60 minutes
                    </span>{" "}
                    shows the first 60 minutes after sunrise and the last 60
                    minutes before sunset.
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      Solar-angle: 0° to 6°
                    </span>{" "}
                    uses the sun’s height above the horizon. This can produce
                    longer or shorter windows depending on latitude, season, and
                    date.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Time zone behavior
                  </div>
                  <p className="mt-2">
                    Times are shown in{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      your device time zone
                    </span>
                    . If you are planning for a different time zone, convert the
                    time afterward.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    GPS + permissions
                  </div>
                  <p className="mt-2">
                    GPS depends on your browser and OS permission. If you deny
                    location access, you can still enter coordinates manually.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[var(--ilt-text-muted)]">
                    Tip: if GPS seems off indoors, step outside or disable VPN
                    location overrides.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    High latitudes
                  </div>
                  <p className="mt-2">
                    Near the poles, some dates have{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      no sunrise or no sunset
                    </span>
                    . In those cases this page will show a note and the golden
                    windows may be unavailable.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Sound + alerts
                  </div>
                  <p className="mt-2">
                    Sound uses WebAudio. Browsers often require a user action
                    before audio can play. If you do not hear beeps, toggle
                    sound on and interact with the page once (tap/click), then
                    try again.
                  </p>
                  <p className="mt-2">
                    With{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      Final beeps
                    </span>{" "}
                    enabled, you will hear short beeps in the last 5 seconds
                    before a golden hour boundary (start or end).
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> For the cleanest
            on-site use: hit <strong className="text-[var(--ilt-text-primary)]">G</strong> for
            GPS, then go fullscreen with{" "}
            <strong className="text-[var(--ilt-text-primary)]">F</strong> and keep the countdown
            visible while you set up.
          </div>
        </details>
      </div>
    </section>
  );
}
