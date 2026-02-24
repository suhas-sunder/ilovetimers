import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Today’s golden hour • Sunrise + sunset • Morning + evening windows • Live countdown • Fullscreen • GPS";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Golden Hour Clock at a glance
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {preview}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          {/* What this page is for (tight, user-first) */}
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">
              Use this page to get golden hour start and end times for a
              specific date and location, plus a live countdown to the next
              change.
            </strong>{" "}
            Pick a date, set a location (GPS or coordinates), then use
            fullscreen for a clean, distraction-free view when you are on-site.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Golden hour windows.</strong>{" "}
              Shows both{" "}
              <span className="font-semibold text-slate-900">morning</span> and{" "}
              <span className="font-semibold text-slate-900">evening</span>{" "}
              golden hour ranges in local time.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Sunrise + sunset.</strong>{" "}
              Includes today’s sunrise and sunset for the same date/location so
              you can anchor your plan quickly.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Live countdown.</strong> A big,
              auto-scaling countdown targets the{" "}
              <span className="font-semibold text-slate-900">next change</span>{" "}
              (golden hour start/end, sunrise, or sunset).
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fullscreen mode.</strong> Go
              fullscreen for a clean on-location display. In fullscreen, you can
              tap Exit (Esc) to leave.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Use GPS.</strong> Pull your
              current coordinates so the times match where you are standing
              (great for travel, hiking, or scouting).
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Two definitions.</strong>{" "}
              Choose a definition that matches your workflow: classic fixed
              duration, or solar-angle based on sun height.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Set location</strong>: use{" "}
                <span className="font-semibold text-slate-900">GPS</span> or
                type latitude/longitude.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Pick date</strong>: choose
                the day you are shooting (or press{" "}
                <span className="font-semibold text-slate-900">Today</span>).
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">
                  3) Watch the countdown
                </strong>
                : use fullscreen when you are waiting on the next transition.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Common uses
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Photography planning
                  </strong>
                  : know exactly when light shifts so you can arrive early and
                  set up.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Travel + scouting</strong>:
                  use GPS to get accurate times for a viewpoint, trail, or
                  neighborhood.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Golden hour reminders
                  </strong>
                  : keep the countdown visible while you prep gear or move
                  between spots.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Coordination</strong>:
                  share a location’s sunrise/sunset context when planning
                  meetups.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want just sunrise and sunset?{" "}
                  <Link
                    to="/sunrise-sunset-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Sunrise &amp; Sunset Clock
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Coordinating across time zones?{" "}
                  <Link
                    to="/time-zone-converter"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Zone Converter
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need the current local time for a place?{" "}
                  <Link
                    to="/current-local-time"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Current Local Time
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/world-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    World Clock
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Timing a shoot segment or setup window?{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </Link>
                  .
                </div>
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
                <span>Method + behavior details</span>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Golden hour definitions
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-900">
                      Classic: 60 minutes
                    </span>{" "}
                    shows the first 60 minutes after sunrise and the last 60
                    minutes before sunset.
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-900">
                      Solar-angle: 0° to 6°
                    </span>{" "}
                    uses the sun’s height above the horizon. This can produce
                    longer or shorter windows depending on latitude, season, and
                    date.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Time zone behavior
                  </div>
                  <p className="mt-2">
                    Times are shown in{" "}
                    <span className="font-semibold text-slate-900">
                      your device time zone
                    </span>
                    . If you are planning for a different time zone, convert the
                    time afterward.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    GPS + permissions
                  </div>
                  <p className="mt-2">
                    GPS depends on your browser and OS permission. If you deny
                    location access, you can still enter coordinates manually.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    Tip: if GPS seems off indoors, step outside or disable VPN
                    location overrides.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    High latitudes
                  </div>
                  <p className="mt-2">
                    Near the poles, some dates have{" "}
                    <span className="font-semibold text-slate-900">
                      no sunrise or no sunset
                    </span>
                    . In those cases this page will show a note and the golden
                    windows may be unavailable.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
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
                    <span className="font-semibold text-slate-900">
                      Final beeps
                    </span>{" "}
                    enabled, you will hear short beeps in the last 5 seconds
                    before a golden hour boundary (start or end).
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> For the cleanest
            on-site use: hit <strong className="text-slate-900">G</strong> for
            GPS, then go fullscreen with{" "}
            <strong className="text-slate-900">F</strong> and keep the countdown
            visible while you set up.
          </div>
        </details>
      </div>
    </section>
  );
}
