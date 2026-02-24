export default function KeyboardShortcuts() {
  // Billable Hours Clock supports: Space (start/pause), R (reset), C (copy), A (add timer), F (fullscreen), P (print active)
  const rows = [
    { key: "Space", action: "Start/pause the active timer" },
    { key: "R", action: "Reset the active timer" },
    { key: "C", action: "Copy the active timer summary" },
    { key: "A", action: "Add a new timer" },
    { key: "F", action: "Toggle fullscreen display" },
    { key: "P", action: "Print the active timer (Save as PDF)" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-slate-700 leading-relaxed">
          Click the tool card once, then use the keyboard to speed up common
          actions. Shortcuts only work when your cursor isn’t inside an input.
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
          Tip: if shortcuts do nothing, the tool card probably isn’t focused (or
          your cursor is inside an input). Click the card, then try again.
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
              Live tracking is deterministic
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Each timer adds elapsed time while it’s running. Pausing stops the
              clock. If you duplicate or reset a timer, totals update
              immediately so you don’t end up with hidden state.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Rounding is always “up”
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              If a rounding increment is enabled, billable time is rounded up to
              the next increment based on the timer’s elapsed time. Use “None”
              for exact elapsed time without rounding.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Totals are per timer and per currency
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The total for a timer is computed from that timer’s billable time
              and hourly rate. If you use multiple currencies, totals are shown
              separately by currency and no conversion is performed.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Currency is formatting, not conversion
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Choosing a currency formats the rate and totals. The tool does not
              convert between currencies or use exchange rates.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <div className="text-sm font-semibold text-slate-900">
              Privacy: runs in your browser
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Timers are stored locally in your browser so they can persist if
              you refresh. Copy and print actions are initiated by you. This
              page does not require location access.
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
                Rounding behavior, totals, saving, and tab visibility behavior
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Rounding rule</div>
              <p className="mt-1 leading-relaxed">
                Billable time is computed by rounding up elapsed time to the
                selected increment (6, 10, or 15 minutes). If rounding is set to
                None, billable time equals elapsed time.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Total pay</div>
              <p className="mt-1 leading-relaxed">
                Total = (billable milliseconds ÷ 3,600,000) × hourly rate. Hours
                and totals update live as the timer runs.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Totals by currency
              </div>
              <p className="mt-1 leading-relaxed">
                Totals are grouped by the selected currency for each timer. This
                tool does not convert or combine monetary totals across
                different currencies.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Saving + background behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Timers are saved to local storage on this device. If the tab
                becomes hidden, running timers are paused to avoid drift; you
                can resume when you return.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">
            Not accounting or tax advice.
          </strong>{" "}
          This page tracks time and computes an hourly total. It doesn’t apply
          taxes or fees, manage retainers, enforce trust accounting rules, or
          generate invoices.
        </div>
      </div>
    </section>
  );
}
