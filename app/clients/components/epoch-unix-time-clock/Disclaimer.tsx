import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Live epoch in seconds and milliseconds • Copy buttons • Local + UTC time • Freeze/snap • Fullscreen view • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Unix Time Clock at a glance
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
              Use this page to grab the current Unix epoch timestamp instantly,
              in both seconds and milliseconds, with fast copy and a clean
              fullscreen display.
            </strong>{" "}
            It’s built for quick “what time is it in epoch?” checks, copying a
            value into logs/tools, and freezing a moment in time when you need a
            stable timestamp.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Seconds and milliseconds.
              </strong>{" "}
              See both formats side by side: seconds is common in APIs and logs,
              milliseconds is common in JavaScript tooling and some event data.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Copy fast.</strong> Copy
              seconds or milliseconds with one click (or keyboard shortcuts). A
              quick toast confirms what you copied.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Local + UTC time.</strong>{" "}
              Confirm the human-readable time in your local timezone and in UTC
              right under the timestamp.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Live or Frozen.</strong> Leave
              it live to keep updating, or freeze to keep one value steady while
              you copy or compare.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Snap now.</strong> When frozen,{" "}
              <span className="font-semibold text-slate-900">Snap</span> grabs a
              fresh “now” value once without going back to live mode.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fullscreen.</strong> Big, clean
              seconds display for screen-sharing, demos, or “read it from across
              the room” use. In fullscreen, clicking/tapping the main display
              toggles Live or Freeze.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Read it</strong>: seconds
                is the big number. Milliseconds is shown below for exactness.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Freeze if needed</strong>:
                stop the clock so the value doesn’t change while you work.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">3) Copy</strong>: use Copy s
                / Copy ms (or shortcuts) and paste into your tool or log.
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
                    Logging and debugging
                  </strong>
                  : copy a timestamp for test data, bug reports, or event
                  traces.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">API checks</strong>: verify
                  “now” in epoch when working with endpoints that expect Unix
                  time.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Timezone sanity check
                  </strong>
                  : compare local vs UTC display to avoid off-by-timezone
                  mistakes.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Freeze a moment</strong>:
                  capture a stable value, then copy seconds or ms without it
                  changing mid-click.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a pure UTC display for quick comparisons?{" "}
                  <Link
                    to="/utc-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    UTC Clock
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Converting between time zones?{" "}
                  <Link
                    to="/time-zone-converter"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Zone Converter
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Working in milliseconds a lot?{" "}
                  <Link
                    to="/milliseconds-converter"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Milliseconds Converter
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a live local clock instead?{" "}
                  <Link
                    to="/current-local-time"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Current Local Time
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer a minimal, clean clock view?{" "}
                  <Link
                    to="/minimalist-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Minimalist Clock
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need to time something right now?{" "}
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
                    <span className="font-semibold text-slate-900">Space</span>{" "}
                    live/freeze ·{" "}
                    <span className="font-semibold text-slate-900">C</span> copy
                    seconds ·{" "}
                    <span className="font-semibold text-slate-900">M</span> copy
                    milliseconds ·{" "}
                    <span className="font-semibold text-slate-900">N</span> snap
                    now ·{" "}
                    <span className="font-semibold text-slate-900">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-slate-900">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    If shortcuts don’t work, click/tap the card once so it has
                    focus.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    What “Live / Frozen / Snap” means
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-900">Live</span>{" "}
                    updates continuously.{" "}
                    <span className="font-semibold text-slate-900">Frozen</span>{" "}
                    keeps the current value stable.{" "}
                    <span className="font-semibold text-slate-900">Snap</span>{" "}
                    updates once while staying frozen.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Seconds vs milliseconds
                  </div>
                  <p className="mt-2">
                    Unix time is commonly represented as seconds since the Unix
                    epoch. Milliseconds is the same value multiplied by 1,000
                    (often used by JavaScript and some telemetry systems).
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Local vs UTC display
                  </div>
                  <p className="mt-2">
                    The epoch timestamp is timezone-independent. Local and UTC
                    rows are provided so you can confirm the human-readable
                    moment in each format.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Some browsers require a user gesture to enter fullscreen. In
                    fullscreen, clicking/tapping the main seconds display
                    toggles Live or Freeze.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> If you’re copying a
            timestamp for a report or debugging, freeze first so the value
            doesn’t change between reading and pasting.
          </div>
        </details>
      </div>
    </section>
  );
}
