export default function KeyboardShortcuts() {
  // Billable Hours Calculator supports: R (reset), C (copy), S (start now), E (end now), P (print)
  const rows = [
    { key: "R", action: "Reset all inputs to defaults" },
    { key: "C", action: "Copy a one-line billable summary (when ready)" },
    { key: "S", action: "Set Start time to now" },
    { key: "E", action: "Set End time to now" },
    { key: "P", action: "Print / Save as PDF (when ready)" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-slate-700 leading-relaxed">
          Click the calculator card once, then use the keyboard to speed up
          common actions. Shortcuts only work when your cursor isn’t inside an
          input.
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
                <tr key={r.key} className="border-b border-slate-100">
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
          Tip: if shortcuts do nothing, the calculator card probably isn’t
          focused (or your cursor is inside an input). Click the card, then try
          again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   4) TRUST + HONESTY (billable-time rules, rounding, totals, privacy)
   Schema: none required
========================================================= */
export function AccuracyAndPrivacySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Accuracy, rules, and privacy
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Time math is deterministic
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The calculator uses your entered start and end times, subtracts
              break minutes, then applies optional rounding. If an input is
              missing or inconsistent, you’ll see a clear error instead of a
              misleading total.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Overnight shifts are handled
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              If your end time is earlier than your start time, the calculator
              assumes the shift crossed midnight and computes the duration
              accordingly.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Rounding is always “up”
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              If a rounding increment is enabled, billable minutes are rounded
              up to the next increment after breaks are deducted. Use “None” for
              exact billable minutes without rounding.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Currency is formatting, not conversion
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Choosing a currency formats the rate and total amount. The tool
              does not convert between currencies or use exchange rates.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <div className="text-sm font-semibold text-slate-900">
              Privacy: runs in your browser
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page doesn’t need location access. Your inputs are used to
              compute results on the page, and the copy/print actions are
              initiated by you.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (calculation details)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Order of operations, rounding behavior, and what “decimal hours”
                means
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Order of operations
              </div>
              <p className="mt-1 leading-relaxed">
                Shift minutes are computed from start → end. Break minutes are
                deducted. If rounding is enabled, the remaining billable minutes
                are rounded up to the next increment. Total pay is calculated
                from the final billable minutes.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Overnight rule</div>
              <p className="mt-1 leading-relaxed">
                If end is earlier than start, the tool assumes the range crosses
                midnight and adds 24 hours to the end time before subtracting.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Rounding increment
              </div>
              <p className="mt-1 leading-relaxed">
                Rounding uses a “ceiling” rule: billable minutes are rounded up
                to the next increment. If you need rounding down or nearest,
                this tool does not do that.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Decimal hours</div>
              <p className="mt-1 leading-relaxed">
                Decimal hours are a display format for billable minutes (minutes
                ÷ 60). Changing decimal places only changes the displayed
                precision, not the computed total.
              </p>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
