export default function Disclaimer() {
  const preview =
    "Big fullscreen clock • Local time • Seconds toggle • 12/24-hour mode • Copy time • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Digital Clock at a glance
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
              Use this page to show the current local time in big, readable
              digits.
            </strong>{" "}
            Toggle seconds and 12/24-hour time, switch to fullscreen for
            distance viewing, and copy the current time when you need an
            accurate timestamp for a room, meeting, class, or workspace.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Big, glanceable time.</strong>{" "}
              Designed to be readable across a room, especially in fullscreen.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Seconds on or off.</strong>{" "}
              Show seconds for precision, or hide them for a calmer display.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">12-hour or 24-hour.</strong>{" "}
              Switch formats instantly depending on your setting or preference.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Copy the time.</strong>{" "}
              One-click copy gives you the current time plus your timezone and
              date for easy pasting into notes, chat, or logs.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fullscreen mode.</strong> Turn
              this page into a clean wall clock. In fullscreen you can{" "}
              <span className="font-semibold text-slate-900">
                tap/click the time
              </span>{" "}
              to copy.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Keyboard shortcuts.</strong>{" "}
              Use the clock without a mouse: fullscreen, copy, and toggles.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Fast setup
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">
                  1) Choose your format
                </strong>
                : turn{" "}
                <span className="font-semibold text-slate-900">Seconds</span>{" "}
                on/off and pick{" "}
                <span className="font-semibold text-slate-900">12/24-hour</span>
                .
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">
                  2) Go fullscreen (optional)
                </strong>{" "}
                for a big wall-clock view.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">3) Copy when needed</strong>{" "}
                with <span className="font-semibold text-slate-900">C</span> (or
                the <span className="font-semibold text-slate-900">Copy</span>{" "}
                button). In fullscreen, click the time to copy.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                When this clock is useful
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Classrooms</strong>: keep a
                  visible time reference for pacing and transitions.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Meetings</strong>: display
                  the time to stay on schedule, especially on a shared screen.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Offices & front desks
                  </strong>
                  : a clean “always visible” clock on a spare monitor.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Timestamping</strong>: copy
                  the time + timezone for notes, handoffs, or quick logs.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need multiple time zones?{" "}
                  <a
                    href="/world-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    World Clock
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Converting time zones for a call?{" "}
                  <a
                    href="/time-zone-converter"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Zone Converter
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a basic “time right now” page?{" "}
                  <a
                    href="/current-local-time"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Current Local Time
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a precise reference time?{" "}
                  <a
                    href="/utc-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    UTC Clock
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
                <span>Details and shortcuts</span>
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
                    toggle seconds ·{" "}
                    <span className="font-semibold text-slate-900">1</span>{" "}
                    12-hour ·{" "}
                    <span className="font-semibold text-slate-900">2</span>{" "}
                    24-hour ·{" "}
                    <span className="font-semibold text-slate-900">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    If shortcuts don’t work, click/tap the clock once so it has
                    focus.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    What “Copy” includes
                  </div>
                  <p className="mt-2">
                    Copy includes your{" "}
                    <span className="font-semibold text-slate-900">
                      displayed time
                    </span>
                    , your{" "}
                    <span className="font-semibold text-slate-900">
                      timezone
                    </span>
                    , the{" "}
                    <span className="font-semibold text-slate-900">date</span>,
                    and an{" "}
                    <span className="font-semibold text-slate-900">
                      ISO timestamp
                    </span>{" "}
                    for unambiguous pasting into logs or notes.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Time source
                  </div>
                  <p className="mt-2">
                    The clock shows your device’s{" "}
                    <span className="font-semibold text-slate-900">
                      local time
                    </span>{" "}
                    and timezone. If your device time is incorrect, the display
                    will be incorrect too.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
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

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Note.</strong> This page shows
            your device’s local time and detected timezone. For a standardized
            reference, use{" "}
            <a
              href="/utc-clock"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              UTC Clock
            </a>{" "}
            or{" "}
            <a
              href="/atomic-clock"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
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
