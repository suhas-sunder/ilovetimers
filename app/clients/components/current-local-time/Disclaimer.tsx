export default function Disclaimer() {
  const preview =
    "See your local time instantly • Toggle seconds • 12/24-hour mode • Fullscreen • Copy time (with date + week) • Quick compare time zones";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Current local time tools at a glance
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {preview}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Big readable time.</strong> A
              clean display you can read at a glance from across the room. Use
              it as a simple “what time is it right now?” screen for desks,
              classrooms, and shared screens.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Seconds on/off.</strong> Toggle
              seconds when precision matters (timed drills, cues, streaming
              overlays), or turn seconds off for a calmer display that updates
              on the minute.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">12-hour or 24-hour.</strong>{" "}
              Switch formats instantly. Use 24-hour for schedules and training
              logs, or 12-hour for general day-to-day readability.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fullscreen mode.</strong> Big
              digits for distance viewing (wall display, phone on a stand,
              projected screen). In fullscreen you can{" "}
              <span className="font-semibold text-slate-900">
                tap/click the time
              </span>{" "}
              to copy quickly.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Copy in one click.</strong>{" "}
              Copy includes the current time plus the selected zone label, date,
              and ISO week number so you can paste it into notes, agendas, or
              logs without reformatting.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Quick compare zones.</strong>{" "}
              Instantly switch the main display between Local, Toronto, New
              York, and London, and view additional tiles for fast
              cross-checking.
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Quick ways to use it
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Classroom / coaching
                  </strong>
                  : run fullscreen on a display so everyone can see the time
                  without asking. Toggle seconds for timed starts.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Meetings</strong>: keep the
                  clock visible while presenting, and copy a timestamp into
                  notes when decisions are made.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Streaming / recording
                  </strong>
                  : use seconds for a clean “time now” overlay reference and
                  copy the current time to label takes.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Remote coordination
                  </strong>
                  : switch to another city to sanity-check “what time is it
                  there?” before you send a message or schedule a call.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need multiple cities at once?{" "}
                  <a
                    href="/world-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    World Clock
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want UTC specifically?{" "}
                  <a
                    href="/utc-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    UTC Clock
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Converting between time zones?{" "}
                  <a
                    href="/time-zone-converter"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Zone Converter
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer a clock-only display style?{" "}
                  <a
                    href="/digital-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Digital Clock
                  </a>{" "}
                  or{" "}
                  <a
                    href="/minimalist-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Minimalist Clock
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a timer instead of a clock?{" "}
                  <a
                    href="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </a>{" "}
                  or{" "}
                  <a
                    href="/countdown-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
                <span>Technical details</span>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Keyboard shortcuts
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-900">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-slate-900">C</span> copy
                    · <span className="font-semibold text-slate-900">S</span>{" "}
                    seconds on/off ·{" "}
                    <span className="font-semibold text-slate-900">1</span>{" "}
                    12-hour ·{" "}
                    <span className="font-semibold text-slate-900">2</span>{" "}
                    24-hour ·{" "}
                    <span className="font-semibold text-slate-900">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    Tip: click/tap the card once so it’s focused, then shortcuts
                    work immediately.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Copy format
                  </div>
                  <p className="mt-2">
                    Copy includes the visible time, a zone label (your local
                    timezone name when available, otherwise the selected city),
                    the full date, and the ISO week number.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Timezone source
                  </div>
                  <p className="mt-2">
                    “Local” time and timezone name come from your device/browser
                    settings. If your device timezone is wrong, the displayed
                    local time will be wrong too.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Fullscreen + clipboard permissions
                  </div>
                  <p className="mt-2">
                    Some browsers require a user gesture to enter fullscreen and
                    may restrict clipboard access in certain contexts. If copy
                    fails, try clicking the page once, then press{" "}
                    <span className="font-semibold text-slate-900">C</span>{" "}
                    again.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Practical tip.</strong> For a
            wall/TV display, use fullscreen and turn seconds off for a calmer
            look. For timestamping, keep seconds on and copy whenever you need a
            clean “time + date” paste.
          </div>
        </details>
      </div>
    </section>
  );
}
