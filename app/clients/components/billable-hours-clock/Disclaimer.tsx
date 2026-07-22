export default function Disclaimer() {
  const preview =
    "Multiple timers • Optional rounding up • Total pay by hourly rate • Copy + print friendly • Local save";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                How this page helps
              </h2>
              <p className="mt-1 text-sm font-medium text-[var(--ilt-text-muted)]">
                {preview}
              </p>
            </div>

            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Track billable time live.
              </strong>{" "}
              Start, pause, and resume while you work. Each timer keeps its own
              rate, rounding, currency, and note so you can switch clients or
              matters without losing context.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Rounding is always “up.”
              </strong>{" "}
              Choose None, 6 min (0.1 hr), 10 min, or 15 min (0.25 hr). The
              billable time for each timer rounds up to the next increment so
              your total reflects your billing rule.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Totals stay clean across currencies.
              </strong>{" "}
              If you bill in more than one currency, this tool keeps totals
              separated by currency (no conversion). You’ll also see total
              billable hours summed across timers.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Copy + print for invoicing.
              </strong>{" "}
              Copy a single timer or all timers in a compact text format. Print
              is designed to be “Save as PDF” friendly for attaching to an
              invoice or sending to a client.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Keyboard shortcuts.</strong>{" "}
              Click anywhere on the card once, then use{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span> to
              start/pause,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">R</span> to reset,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">C</span> to copy,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">A</span> to add a
              timer, <span className="font-semibold text-[var(--ilt-text-primary)]">F</span> for
              fullscreen, and{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">P</span> to print.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Saved on this device.</strong>{" "}
              Timers persist in your browser (local storage). If you clear site
              data or use a different device/browser profile, your saved timers
              won’t be there.
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Best-fit workflows
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    One client, one task:
                  </strong>{" "}
                  Use a single timer, set rounding and rate, then Copy or Print.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Multiple matters/clients:
                  </strong>{" "}
                  Add a timer per matter and use totals-by-currency + Copy all.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Visible wall display:
                  </strong>{" "}
                  Use Fullscreen so billable time + total are readable at a
                  distance.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Need non-live time math?{" "}
                  <a
                    href="/billable-hours-calculator"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Billable Hours Calculator
                  </a>{" "}
                  and{" "}
                  <a
                    href="/time-calculator"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Calculator
                  </a>
                  , or{" "}
                  <a
                    href="/work-hours-calculator"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Work Hours Calculator
                  </a>
                  .
                </div>
                <div className="ilt-surface-muted p-3">
                  Prefer a simple single timer?{" "}
                  <a
                    href="/stopwatch"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Stopwatch
                  </a>{" "}
                  or{" "}
                  <a
                    href="/stopwatch"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Count Up Timer
                  </a>
                  . For open-ended discussion timing, use{" "}
                  <a
                    href="/meeting-count-up-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Meeting Count Up Timer
                  </a>
                  .
                </div>
                <div className="ilt-surface-muted p-3">
                  Need many generic timers (not billing-focused)?{" "}
                  <a
                    href="/multiple-timers"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Multiple Timers
                  </a>
                  .
                </div>
                <div className="ilt-surface-muted p-3">
                  Want a dedicated fullscreen page?{" "}
                  <a
                    href="/online-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>

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
                    Calculation basis
                  </div>
                  <p className="mt-2">
                    Each timer tracks elapsed time in milliseconds. “Billable”
                    time is the rounded-up value based on the selected
                    increment.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Rounding rule
                  </div>
                  <p className="mt-2">
                    Rounding applies to the elapsed time per timer and always
                    rounds up to the next increment (None disables rounding).
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Total pay
                  </div>
                  <p className="mt-2">
                    Total = (billable time ÷ 3600 seconds) × hourly rate. The UI
                    shows billable hours with two decimals by default.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Saving + session behavior
                  </div>
                  <p className="mt-2">
                    Timers are saved to local storage on this device. If the tab
                    becomes hidden, running timers are paused to avoid drift.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Currency formatting
                  </div>
                  <p className="mt-2">
                    Currency only affects display formatting of the rate and
                    totals. No FX conversion is performed.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Copy + print output
                  </div>
                  <p className="mt-2">
                    Copy includes elapsed time, billable time, hours, rate, and
                    total. Print uses a simplified layout designed for “Save as
                    PDF”.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Not accounting or tax advice.
            </strong>{" "}
            This page computes time and an hourly total. It doesn’t apply taxes,
            fees, retainers, trust accounting rules, or invoice formatting.
          </div>
        </details>
      </div>
    </section>
  );
}
