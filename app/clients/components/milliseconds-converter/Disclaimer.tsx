import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Two-way conversion • Exact decimals (no float rounding) • Accepts .5 and 12. • Copy result • Quick examples";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Milliseconds converter at a glance
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
              Convert milliseconds (ms) to seconds (s) or seconds to
              milliseconds instantly.
            </strong>{" "}
            Pick a direction, paste a value, and get an exact result right away.
            Use <strong className="text-slate-900">Copy</strong> to grab a clean
            conversion string for a ticket, note, code comment, or spreadsheet.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Two-way converter.</strong>{" "}
              Switch between{" "}
              <span className="font-semibold text-slate-900">ms → seconds</span>{" "}
              and{" "}
              <span className="font-semibold text-slate-900">seconds → ms</span>{" "}
              with one tap.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Exact decimals.</strong> No
              floating-point rounding surprises.{" "}
              <span className="font-semibold text-slate-900">16.67</span> ms
              becomes{" "}
              <span className="font-semibold text-slate-900">0.01667</span> s,
              and <span className="font-semibold text-slate-900">0.01667</span>{" "}
              s becomes{" "}
              <span className="font-semibold text-slate-900">16.67</span> ms.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Flexible input.</strong> Paste{" "}
              <span className="font-semibold text-slate-900">1000</span>,{" "}
              <span className="font-semibold text-slate-900">12.</span>,{" "}
              <span className="font-semibold text-slate-900">.5</span>,{" "}
              <span className="font-semibold text-slate-900">-250</span>, or{" "}
              <span className="font-semibold text-slate-900">1,500</span>. The
              tool cleans and normalizes your value automatically.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Copy in one click.</strong>{" "}
              Copy a full conversion line (for example{" "}
              <span className="font-semibold text-slate-900">
                1500 ms = 1.5 seconds
              </span>
              ) without selecting text.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Quick examples.</strong> Tap a
              preset to populate the converter instantly, including a common
              frame-time example around{" "}
              <span className="font-semibold text-slate-900">16.67 ms</span>.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Clean output.</strong> Results
              keep meaningful decimals (no forced rounding) and remove
              unnecessary trailing zeros.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Choose direction</strong>:
                ms → seconds or seconds → ms.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Paste a value</strong>:
                the result updates when the input is valid.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">3) Copy</strong>: click Copy
                to grab the formatted conversion line.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Common references
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">1 second</strong>:{" "}
                  <span className="font-semibold text-slate-900">1000</span> ms
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Half a second</strong>:{" "}
                  <span className="font-semibold text-slate-900">500</span> ms
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">0.1 seconds</strong>:{" "}
                  <span className="font-semibold text-slate-900">100</span> ms
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">~60 fps frame</strong>:{" "}
                  <span className="font-semibold text-slate-900">16.67</span> ms
                  ≈{" "}
                  <span className="font-semibold text-slate-900">0.01667</span>{" "}
                  s
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need to add/subtract durations or convert between time units?{" "}
                  <Link
                    to="/time-calculator"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Calculator
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Timing something precisely?{" "}
                  <Link
                    to="/stopwatch"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Stopwatch
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need multiple timers side-by-side?{" "}
                  <Link
                    to="/multiple-timers"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Multiple Timers
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Converting across time zones too?{" "}
                  <Link
                    to="/time-zone-converter"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Zone Converter
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
                <span>Input rules (exact decimal behavior)</span>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Accepted formats
                  </div>
                  <p className="mt-2">
                    The converter accepts signed decimals such as{" "}
                    <span className="font-semibold text-slate-900">-12</span>,{" "}
                    <span className="font-semibold text-slate-900">12.</span>,{" "}
                    <span className="font-semibold text-slate-900">.5</span>,{" "}
                    <span className="font-semibold text-slate-900">
                      0.01667
                    </span>
                    , and{" "}
                    <span className="font-semibold text-slate-900">+10.2</span>.
                    Commas are allowed in pasted values (for example{" "}
                    <span className="font-semibold text-slate-900">1,500</span>
                    ).
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    How conversion is done
                  </div>
                  <p className="mt-2">
                    Conversions are performed by shifting the decimal point:
                    divide by{" "}
                    <span className="font-semibold text-slate-900">1000</span>{" "}
                    (ms → seconds) or multiply by{" "}
                    <span className="font-semibold text-slate-900">1000</span>{" "}
                    (seconds → ms). This avoids floating-point rounding and
                    preserves exact decimal text where possible.
                  </p>
                  <p className="mt-2">
                    Output is normalized by trimming unnecessary trailing zeros
                    (for example{" "}
                    <span className="font-semibold text-slate-900">1.500</span>{" "}
                    → <span className="font-semibold text-slate-900">1.5</span>
                    ).
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> If you are moving
            values between code and spreadsheets, keep the converter in{" "}
            <strong className="text-slate-900">Copy</strong>-mode: paste a new
            number, then copy the conversion line without reformatting anything
            manually.
          </div>
        </details>
      </div>
    </section>
  );
}
