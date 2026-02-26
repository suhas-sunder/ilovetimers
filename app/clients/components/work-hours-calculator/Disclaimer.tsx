import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Start/end time • Breaks subtracted • Overnight shifts • Decimal hours + rounding • Copy for payroll";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Work hours calculator
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
              Calculate your paid work time from start and end times, with
              breaks subtracted.
            </strong>{" "}
            Enter your shift, subtract a break, and get paid time as{" "}
            <strong className="text-slate-900">HH:MM</strong> and{" "}
            <strong className="text-slate-900">decimal hours</strong>. If your
            end time is earlier than your start time, the tool treats it as an{" "}
            <strong className="text-slate-900">overnight shift</strong>.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Start + end time in, totals out.
              </strong>{" "}
              The result shows your{" "}
              <strong className="text-slate-900">paid time</strong> (after
              break), plus the{" "}
              <strong className="text-slate-900">total shift</strong> length and
              the <strong className="text-slate-900">break</strong> used.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Overnight shifts supported.
              </strong>{" "}
              If your end time is earlier than your start time, it assumes the
              shift continues into the next day and marks the result as{" "}
              <strong className="text-slate-900">Overnight</strong>.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Breaks subtracted safely.
              </strong>{" "}
              Break time can’t exceed the total shift. If it does, you’ll get a
              clear error so you can fix inputs quickly.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Decimal hours and rounding.
              </strong>{" "}
              Choose decimal places (0–4). Optional rounding adjusts{" "}
              <strong className="text-slate-900">paid time only</strong> to the
              nearest 5, 10, or 15 minutes.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Copy for payroll or timesheets.
              </strong>{" "}
              Copy a compact string like{" "}
              <strong className="text-slate-900">7:30 (7.50 hrs)</strong>, or
              copy a full summary including shift length, break, and overnight
              status.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">“Now” helpers.</strong> Use the{" "}
              <strong className="text-slate-900">Now</strong> buttons to set
              start or end to your current device time (useful when you’re
              clocking in/out).
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Enter your shift</strong>:
                set <strong className="text-slate-900">Start</strong> and{" "}
                <strong className="text-slate-900">End</strong> (use{" "}
                <strong className="text-slate-900">Now</strong> if needed).
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Subtract breaks</strong>:
                enter break minutes or tap a quick chip (15m, 30m, 45m, 60m).
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">3) Copy the result</strong>:
                copy paid time (HH:MM + decimal hours) or copy the full summary
                for a timesheet.
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
                  <strong className="text-slate-900">Timesheets</strong>: get
                  paid hours in a format you can paste into a sheet.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Shift work</strong>: handle
                  overnight shifts without manual math.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Hourly payroll</strong>:
                  quickly convert minutes worked into decimal hours.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Break compliance</strong>:
                  confirm break deductions don’t exceed your shift length.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Summing multiple time blocks (not just start/end)?{" "}
                  <Link
                    to="/time-calculator"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Calculator
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Tracking billable time formatting and totals?{" "}
                  <Link
                    to="/billable-hours-calculator"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Billable Hours Calculator
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a live clock while you’re logging time?{" "}
                  <Link
                    to="/current-local-time"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Current Local Time
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Timing a focused session while you work?{" "}
                  <Link
                    to="/pomodoro-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Pomodoro Timer
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
                      <strong className="text-slate-900">S</strong>: set Start
                      to now
                    </li>
                    <li>
                      <strong className="text-slate-900">E</strong>: set End to
                      now
                    </li>
                    <li>
                      <strong className="text-slate-900">C</strong>: copy paid
                      time (HH:MM + decimal)
                    </li>
                    <li>
                      <strong className="text-slate-900">R</strong>: reset
                      inputs/options
                    </li>
                  </ul>
                  <p className="mt-2">
                    Tip: click the calculator card once so shortcuts are
                    captured.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Overnight logic
                  </div>
                  <p className="mt-2">
                    If <strong className="text-slate-900">End</strong> is
                    earlier than{" "}
                    <strong className="text-slate-900">Start</strong>, the tool
                    treats End as the next day. The summary shows an{" "}
                    <strong className="text-slate-900">Overnight</strong>{" "}
                    indicator.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Rounding note
                  </div>
                  <p className="mt-2">
                    Rounding applies to{" "}
                    <strong className="text-slate-900">paid time</strong> after
                    breaks. The displayed HH:MM and decimal hours reflect the
                    rounded paid minutes when enabled.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Copy formats
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      <strong className="text-slate-900">Copy paid time</strong>
                      :{" "}
                      <span className="font-semibold text-slate-900">
                        HH:MM (X.XX hrs)
                      </span>
                    </li>
                    <li>
                      <strong className="text-slate-900">Copy summary</strong>:
                      paid time + shift + break, plus an overnight note when
                      applicable.
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Input limits
                  </div>
                  <p className="mt-2">
                    Break minutes are clamped between{" "}
                    <strong className="text-slate-900">0</strong> and{" "}
                    <strong className="text-slate-900">1440</strong>, and cannot
                    exceed the total shift.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> If your workplace
            rounds to the nearest 5, 10, or 15 minutes, enable rounding so your
            copied result matches how time is recorded.
          </div>
        </details>
      </div>
    </section>
  );
}
