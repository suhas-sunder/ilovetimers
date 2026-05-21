export default function Disclaimer() {
  const preview =
    "Start/end times + breaks • Optional rounding up • Total pay by hourly rate • Copy + print friendly";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Limits & notes
              </h2>
              <p className="mt-1 text-sm font-medium text-[var(--ilt-text-muted)]">
                {preview}
              </p>
            </div>

            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <ul className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Overnight is supported.
              </strong>{" "}
              If your end time is earlier than your start time, this calculator
              treats it as crossing midnight (for example, 10:00 PM → 2:00 AM).
              If you need a general time math tool, use{" "}
              <a
                href="/time-calculator"
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
              >
                Time Calculator
              </a>
              .
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Break minutes are deducted first.
              </strong>{" "}
              Break time reduces the shift total before rounding is applied. If
              your break is longer than the shift, you’ll get an error so you
              can fix inputs.
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Rounding is “up.”</strong> When
              a rounding increment is selected, billable minutes are rounded up
              to the next increment (for example, 1:01 at 6-minute rounding
              becomes 1:06). Select{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">None</span> if you
              don’t want rounding.
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Decimal places are display-only.
              </strong>{" "}
              The billable hours number can be shown with 0–4 decimals, but the{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">total amount</span>{" "}
              is always computed from billable minutes (after rounding).
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Copy and print match what you see.
              </strong>{" "}
              Copy includes billable time (HH:MM and decimal hours), rate, and
              total. Print is designed to be “Save as PDF” friendly for sending
              to a client or attaching to an invoice.
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Your device clock matters.
              </strong>{" "}
              Start/end “Now” uses your device time. If your system clock is
              off, the chosen times will be off too. For tracking time live
              while you work, use{" "}
              <a
                href="/stopwatch"
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
              >
                Stopwatch
              </a>{" "}
              or{" "}
              <a
                href="/count-up-timer"
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
              >
                Count Up Timer
              </a>
              .
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                One time range at a time.
              </strong>{" "}
              This calculator is for a single shift/session. If you need
              multiple segments (split shifts, multiple clients), use{" "}
              <a
                href="/work-hours-calculator"
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
              >
                Work Hours Calculator
              </a>{" "}
              for broader hour math, then apply your billing rules per segment.
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Not accounting or tax advice.
              </strong>{" "}
              This page computes time and an hourly total. It doesn’t apply
              taxes, fees, retainers, trust accounting rules, or invoice
              formatting.
            </li>
          </ul>

          <div className="mt-4 ilt-surface-card p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-[var(--ilt-text-primary)] ilt-focus-ring">
                <span>Technical details</span>
                <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-2">
                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Calculation order
                  </div>
                  <p className="mt-2">
                    Shift minutes are computed from start → end. Break minutes
                    are subtracted. If rounding is enabled, remaining billable
                    minutes are rounded up to the next increment.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Overnight rule
                  </div>
                  <p className="mt-2">
                    If end is earlier than start, the tool assumes the range
                    crosses midnight and adds 24 hours to the end time before
                    subtracting.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Total pay
                  </div>
                  <p className="mt-2">
                    Total = (billable minutes ÷ 60) × hourly rate. The displayed
                    decimal hours can be formatted separately without changing
                    the total.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Currency display
                  </div>
                  <p className="mt-2">
                    Currency only affects formatting of totals and rate display.
                    No FX conversion is performed.
                  </p>
                </div>
              </div>
            </details>
          </div>
        </details>
      </div>
    </section>
  );
}
