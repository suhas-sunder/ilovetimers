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
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
          Click the Work Hours Calculator card once, then use the shortcuts
          below. Shortcuts won’t trigger while you’re typing in an input field.
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
                <tr
                  key={`${r.key}-${r.action}`}
                  className="border-b border-[var(--ilt-border-subtle)]"
                >
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
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Behavior and privacy
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Runs locally in your browser
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Your start/end times, break minutes, rounding, and decimal place
              settings run on your device. No account is needed.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Clear overnight behavior
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              If End is earlier than Start, the calculator treats it as a shift
              into the next day and labels the result as Overnight.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Break deduction is validated
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Break minutes can’t exceed the total shift length. If they do, the
              tool shows an error so you can correct inputs immediately.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Copy stays simple
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Copy outputs plain text designed to paste cleanly into a
              timesheet, message, or note: paid time in HH:MM and decimal hours,
              plus an optional summary line.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Rounding is optional and transparent
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              When enabled, rounding applies to paid time after breaks (nearest
              5/10/15 minutes). The displayed HH:MM and decimal hours reflect
              that rounded paid time.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              No uploads required
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This page does not ask you to upload files or personal data to
              calculate work hours.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (overnight, rounding, copy formats)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional details about how calculations behave and what copy
                outputs include
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Shift calculation
              </div>
              <p className="mt-1 leading-relaxed">
                Total shift is calculated from Start to End. If End is earlier
                than Start, End is treated as the next day (overnight shift).
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Break validation
              </div>
              <p className="mt-1 leading-relaxed">
                Break minutes are clamped to a safe range and cannot exceed the
                total shift. Paid time is Total shift minus Break.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Rounding behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Rounding applies to paid minutes after breaks using nearest
                rounding to 5/10/15 minutes. When rounding is on, all paid
                outputs reflect the rounded paid time.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Copy output</div>
              <p className="mt-1 leading-relaxed">
                Copy paid time outputs{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  HH:MM (X.XX hrs)
                </span>
                . Copy summary includes paid time, total shift, break minutes,
                and an Overnight note when applicable.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Related.</strong> Adding multiple
          time entries?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/time-calculator"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Time Calculator
            </Link>
          </span>
          . Tracking billable totals?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/billable-hours-calculator"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Billable Hours Calculator
            </Link>
          </span>
          . Need a live clock while you log time?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/current-local-time"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
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
