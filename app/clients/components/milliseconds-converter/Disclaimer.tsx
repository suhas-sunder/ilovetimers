import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Two-way conversion • Exact decimals (no float rounding) • Accepts .5 and 12. • Copy result • Quick examples";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Milliseconds converter at a glance
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
              Convert milliseconds (ms) to seconds (s) or seconds to
              milliseconds instantly.
            </strong>{" "}
            Pick a direction, paste a value, and get an exact result right away.
            Use <strong className="text-[var(--ilt-text-primary)]">Copy</strong> to grab a clean
            conversion string for a ticket, note, code comment, or spreadsheet.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Two-way converter.</strong>{" "}
              Switch between{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">ms → seconds</span>{" "}
              and{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">seconds → ms</span>{" "}
              with one tap.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Exact decimals.</strong> No
              floating-point rounding surprises.{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">16.67</span> ms
              becomes{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">0.01667</span> s,
              and <span className="font-semibold text-[var(--ilt-text-primary)]">0.01667</span>{" "}
              s becomes{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">16.67</span> ms.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Flexible input.</strong> Paste{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">1000</span>,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">12.</span>,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">.5</span>,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">-250</span>, or{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">1,500</span>. The
              tool cleans and normalizes your value automatically.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Copy in one click.</strong>{" "}
              Copy a full conversion line (for example{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                1500 ms = 1.5 seconds
              </span>
              ) without selecting text.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Quick examples.</strong> Tap a
              preset to populate the converter instantly, including a common
              frame-time example around{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">16.67 ms</span>.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Clean output.</strong> Results
              keep meaningful decimals (no forced rounding) and remove
              unnecessary trailing zeros.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Choose direction</strong>:
                ms → seconds or seconds → ms.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Paste a value</strong>:
                the result updates when the input is valid.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Copy</strong>: click Copy
                to grab the formatted conversion line.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Common references
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">1 second</strong>:{" "}
                  <span className="font-semibold text-[var(--ilt-text-primary)]">1000</span> ms
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">1 minute</strong>:{" "}
                  <span className="font-semibold text-[var(--ilt-text-primary)]">60000</span> ms
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">1 hour</strong>:{" "}
                  <span className="font-semibold text-[var(--ilt-text-primary)]">3600000</span> ms
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">1 day</strong>:{" "}
                  <span className="font-semibold text-[var(--ilt-text-primary)]">86400000</span> ms
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Half a second</strong>:{" "}
                  <span className="font-semibold text-[var(--ilt-text-primary)]">500</span> ms
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">0.1 seconds</strong>:{" "}
                  <span className="font-semibold text-[var(--ilt-text-primary)]">100</span> ms
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">~60 fps frame</strong>:{" "}
                  <span className="font-semibold text-[var(--ilt-text-primary)]">16.67</span> ms
                  ≈{" "}
                  <span className="font-semibold text-[var(--ilt-text-primary)]">0.01667</span>{" "}
                  s
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Need to add/subtract durations or convert between time units?{" "}
                  <Link
                    to="/time-calculator"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Calculator
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Timing something precisely?{" "}
                  <Link
                    to="/stopwatch"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Stopwatch
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need multiple timers side-by-side?{" "}
                  <Link
                    to="/multiple-timers"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Multiple Timers
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Working with Unix timestamps?{" "}
                  <Link
                    to="/epoch-unix-time-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Epoch Unix Time Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a live clock display?{" "}
                  <Link
                    to="/digital-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Digital Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Converting across time zones too?{" "}
                  <Link
                    to="/time-zone-converter"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Zone Converter
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
                <span>Input rules (exact decimal behavior)</span>
                <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-2">
                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Accepted formats
                  </div>
                  <p className="mt-2">
                    The converter accepts signed decimals such as{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">-12</span>,{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">12.</span>,{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">.5</span>,{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      0.01667
                    </span>
                    , and{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">+10.2</span>.
                    Commas are allowed in pasted values (for example{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">1,500</span>
                    ).
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    How conversion is done
                  </div>
                  <p className="mt-2">
                    Conversions are performed by shifting the decimal point:
                    divide by{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">1000</span>{" "}
                    (ms → seconds) or multiply by{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">1000</span>{" "}
                    (seconds → ms). This avoids floating-point rounding and
                    preserves exact decimal text where possible.
                  </p>
                  <p className="mt-2">
                    Output is normalized by trimming unnecessary trailing zeros
                    (for example{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">1.500</span>{" "}
                    → <span className="font-semibold text-[var(--ilt-text-primary)]">1.5</span>
                    ).
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> If you are moving
            values between code and spreadsheets, keep the converter in{" "}
            <strong className="text-[var(--ilt-text-primary)]">Copy</strong>-mode: paste a new
            number, then copy the conversion line without reformatting anything
            manually.
          </div>
        </details>
      </div>
    </section>
  );
}
