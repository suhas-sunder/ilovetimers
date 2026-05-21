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
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
          Click the tool card once, then use the keyboard to speed up common
          actions. Shortcuts only work when your cursor isn’t inside an input.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--ilt-border-subtle)] text-left">
                <th className="py-2 pr-4 font-semibold text-[var(--ilt-text-primary)]">Key</th>
                <th className="py-2 font-semibold text-[var(--ilt-text-primary)]">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-[var(--ilt-border-subtle)]">
                  <td className="py-2 pr-4">
                    <kbd className="ilt-keycap px-2 py-1 font-mono text-xs text-[var(--ilt-text-primary)]">
                      {r.key}
                    </kbd>
                  </td>
                  <td className="py-2 text-[var(--ilt-text-secondary)]">{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
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
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Accuracy, rules, and privacy
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Live tracking is deterministic
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Each timer adds elapsed time while it’s running. Pausing stops the
              clock. If you duplicate or reset a timer, totals update
              immediately so you don’t end up with hidden state.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Rounding is always “up”
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              If a rounding increment is enabled, billable time is rounded up to
              the next increment based on the timer’s elapsed time. Use “None”
              for exact elapsed time without rounding.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Totals are per timer and per currency
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The total for a timer is computed from that timer’s billable time
              and hourly rate. If you use multiple currencies, totals are shown
              separately by currency and no conversion is performed.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Currency is formatting, not conversion
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Choosing a currency formats the rate and totals. The tool does not
              convert between currencies or use exchange rates.
            </p>
          </div>

          <div className="ilt-surface-muted p-4 md:col-span-2">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Privacy: runs in your browser
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Timers are stored locally in your browser so they can persist if
              you refresh. Copy and print actions are initiated by you. This
              page does not require location access.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (calculation details)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Rounding behavior, totals, saving, and tab visibility behavior
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Rounding rule</div>
              <p className="mt-1 leading-relaxed">
                Billable time is computed by rounding up elapsed time to the
                selected increment (6, 10, or 15 minutes). If rounding is set to
                None, billable time equals elapsed time.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Total pay</div>
              <p className="mt-1 leading-relaxed">
                Total = (billable milliseconds ÷ 3,600,000) × hourly rate. Hours
                and totals update live as the timer runs.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Totals by currency
              </div>
              <p className="mt-1 leading-relaxed">
                Totals are grouped by the selected currency for each timer. This
                tool does not convert or combine monetary totals across
                different currencies.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
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

        <div className="mt-4 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">
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
