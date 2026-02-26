import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Instant conversion between two time zones • DST-aware results • Shareable link • Copy-friendly output • Fullscreen + keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Time Zone Converter
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
              Convert a specific date and time from one time zone to another,
              instantly.
            </strong>{" "}
            Pick your <strong className="text-slate-900">From</strong> and{" "}
            <strong className="text-slate-900">To</strong> time zones, enter a
            date and time, and the tool shows both local times plus the exact{" "}
            <strong className="text-slate-900">ISO instant</strong> you can copy
            or share.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Date + time input you control.
              </strong>{" "}
              Choose the exact day and time you mean (not “right now”) and get
              the corresponding local time in another zone.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">DST-aware conversion.</strong>{" "}
              Results follow each zone’s daylight saving rules for the selected
              date, so you don’t have to manually adjust offsets.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Swap in one tap.</strong> Swap
              From and To to convert back the other way without reselecting time
              zones.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Seconds toggle.</strong> Show
              seconds when precision matters, or hide them for a cleaner
              display.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Copy-ready output.</strong>{" "}
              Copy a clean block of text (From zone, To zone, input, both
              rendered times, and ISO) for chats, tickets, and docs.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Shareable link.</strong> Use
              Share to copy a URL that preserves your From/To/date/time and
              seconds setting.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:col-span-2">
              <strong className="text-slate-900">Fullscreen mode.</strong> Go
              fullscreen for a clean, big display while scheduling, running a
              call, or presenting times on a second screen.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Pick zones</strong>: set
                your <strong className="text-slate-900">From</strong> and{" "}
                <strong className="text-slate-900">To</strong> time zones (use
                quick chips for common pairs).
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Enter date/time</strong>:
                choose the day and type the time (HH:MM or HH:MM:SS).
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">3) Copy or share</strong>:
                use Copy for paste-ready text, or Share to send the exact setup.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Best for
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Scheduling meetings
                  </strong>
                  : confirm the exact local time for both sides before sending
                  an invite.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Deadlines</strong>: convert
                  “due at 5pm” across offices without guessing offsets.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Travel and events</strong>:
                  convert departure/arrival times or event start times correctly
                  for the date.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Support & ops</strong>:
                  paste clean conversion details (including ISO) into tickets
                  and incident notes.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want to keep multiple cities visible all day?{" "}
                  <Link
                    to="/world-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    World Clock
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a clean reference baseline?{" "}
                  <Link
                    to="/utc-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    UTC Clock
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a big local-time display?{" "}
                  <Link
                    to="/current-local-time"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Current Local Time
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer a simple always-on clock face?{" "}
                  <Link
                    to="/digital-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Digital Clock
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a large fullscreen display for timing (not conversion)?{" "}
                  <Link
                    to="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
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
                <span>How it works, shortcuts, and notes</span>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Keyboard shortcuts
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      <strong className="text-slate-900">F</strong>: fullscreen
                    </li>
                    <li>
                      <strong className="text-slate-900">S</strong>: swap zones
                    </li>
                    <li>
                      <strong className="text-slate-900">N</strong>: set to now
                    </li>
                    <li>
                      <strong className="text-slate-900">C</strong>: copy output
                    </li>
                    <li>
                      <strong className="text-slate-900">Esc</strong>: exit
                      fullscreen
                    </li>
                  </ul>
                  <p className="mt-2">
                    Tip: click the card once so shortcuts are captured.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Share links
                  </div>
                  <p className="mt-2">
                    Share copies a URL that includes From zone, To zone, date,
                    time, and whether seconds are enabled. Opening the link
                    restores the same conversion setup.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    DST edge cases
                  </div>
                  <p className="mt-2">
                    Around daylight saving transitions, some local times can be
                    skipped or repeated. If you’re converting a time near a DST
                    change and the result looks surprising, try toggling seconds
                    and re-checking the date and time zone selections.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Copy format
                  </div>
                  <p className="mt-2">
                    Copy includes: From zone, To zone, your input date/time,
                    both rendered local times (with abbreviations when
                    available), and the ISO instant for unambiguous reference.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
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

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> If you schedule
            often, keep one side anchored to{" "}
            <strong className="text-slate-900">your local zone</strong> (or{" "}
            <strong className="text-slate-900">UTC</strong>) and swap as needed.
            You’ll avoid offset mistakes and move faster.
          </div>
        </details>
      </div>
    </section>
  );
}
