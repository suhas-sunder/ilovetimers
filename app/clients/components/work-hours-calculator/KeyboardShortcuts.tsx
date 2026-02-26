import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (WORK HOURS CALCULATOR)
========================================================= */
export default function KeyboardShortcuts() {
  // Work Hours Calculator supports:
  // S (start now), E (end now), C (copy paid time), R (reset)
  const rows = [
    { key: "S", action: "Set Start time to now" },
    { key: "E", action: "Set End time to now" },
    { key: "C", action: "Copy paid time (HH:MM + decimal hours)" },
    { key: "R", action: "Reset inputs and options" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-slate-700">
          Click the Work Hours Calculator card once, then use the shortcuts
          below. Shortcuts won’t trigger while you’re typing in an input field.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-4 font-semibold text-slate-900">Key</th>
                <th className="py-2 font-semibold text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={`${r.key}-${r.action}`}
                  className="border-b border-slate-100"
                >
                  <td className="py-2 pr-4">
                    <kbd className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-900">
                      {r.key}
                    </kbd>
                  </td>
                  <td className="py-2 text-slate-700">{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          Tip: if shortcuts do nothing, the card probably isn’t focused. Click
          inside the tool area once (not inside an input), then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (work hours + rounding + copy)
   Schema: none required
========================================================= */
export function AccuracyAndPrivacySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Behavior and privacy
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Runs locally in your browser
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Your start/end times, break minutes, rounding, and decimal place
              settings run on your device. No account is needed.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Clear overnight behavior
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              If End is earlier than Start, the calculator treats it as a shift
              into the next day and labels the result as Overnight.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Break deduction is validated
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Break minutes can’t exceed the total shift length. If they do, the
              tool shows an error so you can correct inputs immediately.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Copy stays simple
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Copy outputs plain text designed to paste cleanly into a
              timesheet, message, or note: paid time in HH:MM and decimal hours,
              plus an optional summary line.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Rounding is optional and transparent
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              When enabled, rounding applies to paid time after breaks (nearest
              5/10/15 minutes). The displayed HH:MM and decimal hours reflect
              that rounded paid time.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No uploads required
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page does not ask you to upload files or personal data to
              calculate work hours.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (overnight, rounding, copy formats)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional details about how calculations behave and what copy
                outputs include
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Shift calculation
              </div>
              <p className="mt-1 leading-relaxed">
                Total shift is calculated from Start to End. If End is earlier
                than Start, End is treated as the next day (overnight shift).
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Break validation
              </div>
              <p className="mt-1 leading-relaxed">
                Break minutes are clamped to a safe range and cannot exceed the
                total shift. Paid time is Total shift minus Break.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Rounding behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Rounding applies to paid minutes after breaks using nearest
                rounding to 5/10/15 minutes. When rounding is on, all paid
                outputs reflect the rounded paid time.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">Copy output</div>
              <p className="mt-1 leading-relaxed">
                Copy paid time outputs{" "}
                <span className="font-semibold text-slate-900">
                  HH:MM (X.XX hrs)
                </span>
                . Copy summary includes paid time, total shift, break minutes,
                and an Overnight note when applicable.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Related.</strong> Adding multiple
          time entries?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/time-calculator"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Time Calculator
            </Link>
          </span>
          . Tracking billable totals?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/billable-hours-calculator"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Billable Hours Calculator
            </Link>
          </span>
          . Need a live clock while you log time?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/current-local-time"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Current Local Time
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
