import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Hex HH:MM:SS • Optional seconds + ms • 12/24-hour toggle • Copy block • Fullscreen • Hex color mode (#RRGGBB)";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Hexadecimal Clock at a glance
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
              Use this page to view the current local time rendered as
              hexadecimal values (HH:MM:SS), optionally including milliseconds,
              and copy the exact output in one tap.
            </strong>{" "}
            Switch between standard hex time and a{" "}
            <span className="font-semibold text-slate-900">
              hex color clock
            </span>{" "}
            that maps time to{" "}
            <span className="font-semibold text-slate-900">#RRGGBB</span>.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Hex time display.</strong>{" "}
              Shows hours, minutes, and seconds as{" "}
              <span className="font-semibold text-slate-900">
                two-digit hex
              </span>{" "}
              values (00–17 for hours in 24h mode).
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Optional milliseconds.</strong>{" "}
              Turn on <span className="font-semibold text-slate-900">ms</span>{" "}
              to see milliseconds in hex (3 digits) alongside the decimal ms.
              Milliseconds only show in Hex HH:MM:SS mode.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">12-hour or 24-hour.</strong>{" "}
              Toggle 24h on/off. In 12h mode, the hours are hex-encoded after
              conversion to 1–12 and an AM/PM suffix is shown.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Copy in one click.</strong>{" "}
              Copy includes hex output, decimal time with your time zone, date,
              and ISO timestamp so you can paste a complete snapshot anywhere.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fullscreen mode.</strong>{" "}
              Fullscreen gives you a clean display. In fullscreen you can click
              the time display to copy quickly. Exit with{" "}
              <span className="font-semibold text-slate-900">Esc</span>.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Hex color mode.</strong> Switch
              to color mode to view the current time as{" "}
              <span className="font-semibold text-slate-900">#RRGGBB</span>{" "}
              (RR=hours, GG=minutes, BB=seconds). Useful for quick “time →
              color” snapshots and visual references.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Pick a mode</strong>:{" "}
                <span className="font-semibold text-slate-900">
                  Hex HH:MM:SS
                </span>{" "}
                for time, or{" "}
                <span className="font-semibold text-slate-900">Hex color</span>{" "}
                for #RRGGBB.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Set precision</strong>:{" "}
                toggle seconds, and optionally{" "}
                <span className="font-semibold text-slate-900">ms</span> (time
                mode only).
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">
                  3) Copy or fullscreen
                </strong>
                : click{" "}
                <span className="font-semibold text-slate-900">Copy</span> (or
                click the display in fullscreen).
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
                  <strong className="text-slate-900">Dev + debugging</strong>:
                  copy a time snapshot (hex + ISO) for logs, tests, or issue
                  reports.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Hex practice</strong>: read
                  time values in base-16 at a glance and build intuition.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Visual time cue</strong>:
                  use hex color mode as a lightweight “time as color” reference
                  for creative work.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Sharing</strong>: paste a
                  complete timestamp set (hex, decimal, date, ISO) into chat or
                  notes with no extra steps.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer binary time?{" "}
                  <Link
                    to="/binary-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Binary Clock
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a different encoding?{" "}
                  <Link
                    to="/morse-code-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Morse Code Clock
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need UTC right now?{" "}
                  <Link
                    to="/utc-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    UTC Clock
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want local time for a place or multiple zones?{" "}
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
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
                <span>Format + behavior details</span>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Hex time format
                  </div>
                  <p className="mt-2">
                    In <span className="font-semibold text-slate-900">24h</span>
                    , hours are{" "}
                    <span className="font-semibold text-slate-900">00–17</span>{" "}
                    (0–23 decimal). Minutes and seconds are{" "}
                    <span className="font-semibold text-slate-900">00–3B</span>{" "}
                    (0–59 decimal).
                  </p>
                  <p className="mt-2">
                    In <span className="font-semibold text-slate-900">12h</span>
                    , hours are 1–12 first, then rendered as hex (
                    <span className="font-semibold text-slate-900">01–0C</span>)
                    with AM/PM appended.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Milliseconds
                  </div>
                  <p className="mt-2">
                    Milliseconds are shown as{" "}
                    <span className="font-semibold text-slate-900">
                      3-digit hex
                    </span>{" "}
                    (000–3E7) plus the decimal ms (000–999). If seconds are off,
                    ms is disabled to avoid misleading precision.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Hex color mapping
                  </div>
                  <p className="mt-2">
                    Color mode displays{" "}
                    <span className="font-semibold text-slate-900">
                      #RRGGBB
                    </span>{" "}
                    where{" "}
                    <span className="font-semibold text-slate-900">RR</span> is
                    the hour (24h),{" "}
                    <span className="font-semibold text-slate-900">GG</span> is
                    minutes, and{" "}
                    <span className="font-semibold text-slate-900">BB</span> is
                    seconds. If seconds are hidden, BB is set to{" "}
                    <span className="font-semibold text-slate-900">00</span>.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Time zone + timestamps
                  </div>
                  <p className="mt-2">
                    Decimal time is shown in your device time zone. The copy
                    block also includes an{" "}
                    <span className="font-semibold text-slate-900">
                      ISO timestamp
                    </span>{" "}
                    (UTC) so there is no ambiguity when sharing.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Keyboard shortcuts
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-900">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-slate-900">C</span> copy
                    · <span className="font-semibold text-slate-900">S</span>{" "}
                    toggle seconds ·{" "}
                    <span className="font-semibold text-slate-900">M</span>{" "}
                    toggle ms (time mode only) ·{" "}
                    <span className="font-semibold text-slate-900">X</span>{" "}
                    toggle mode ·{" "}
                    <span className="font-semibold text-slate-900">1</span>{" "}
                    12-hour ·{" "}
                    <span className="font-semibold text-slate-900">2</span>{" "}
                    24-hour.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> If you are demoing
            this on a big screen: press{" "}
            <strong className="text-slate-900">F</strong> for fullscreen, then
            press <strong className="text-slate-900">C</strong> to copy a clean
            timestamp block whenever you need it.
          </div>
        </details>
      </div>
    </section>
  );
}
