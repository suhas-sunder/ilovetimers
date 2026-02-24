export default function KeyboardShortcuts() {
  // Debt Repayment Timer supports: Space (start/pause), R (reset), F (fullscreen), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Start / pause the countdown" },
    { key: "R", action: "Reset to the current end date" },
    { key: "F", action: "Toggle fullscreen" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-slate-700">
          Click the timer card once, then use the keyboard to control it.
          Shortcuts won’t trigger while you’re typing in an input, select,
          textarea, or editable field.
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
          Tip: if shortcuts do nothing, the timer card probably isn’t focused.
          Click the card once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   TRUST + HONESTY (time model, fullscreen behavior, privacy)
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
              No sign-in required. The countdown runs in your browser using the
              dates and balances you choose.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Time-based estimate (not lender math)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Progress and “est. paid/remaining” are based on time elapsed
              between your start and end dates. This tool does not calculate
              interest, fees, minimum payments, or amortization schedules.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Inputs are for pacing, not accounting
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Starting balance and target balance are used only to create a
              simple linear estimate tied to the countdown. If your payments are
              uneven, the estimate will not match your actual payoff trajectory.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is display-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen makes the countdown large and adds top/bottom controls.
              Exit with{" "}
              <span className="font-semibold text-slate-900">Esc</span> or the
              Exit button. In fullscreen, you can tap/click the timer area to
              start or pause.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No GPS, no account
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page does not request your precise location and does not
              require sign-in. Your inputs stay on the page while you’re using
              it.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Keyboard focus rules
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Shortcuts only trigger when the timer card has focus, and they are
              ignored while you’re typing in an input field.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (progress model + date handling + fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                How progress/estimates are computed, what happens on input
                changes, and browser permission notes
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Progress model</div>
              <p className="mt-1 leading-relaxed">
                Progress is computed as elapsed time divided by total time:{" "}
                <span className="font-semibold text-slate-900">
                  (now − start) / (end − start)
                </span>
                , clamped from 0% to 100%.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Est. paid / remaining
              </div>
              <p className="mt-1 leading-relaxed">
                The tool uses{" "}
                <span className="font-semibold text-slate-900">
                  starting balance − target balance
                </span>{" "}
                as “principal to pay,” then applies the same time progress to
                estimate paid and remaining amounts.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Date handling</div>
              <p className="mt-1 leading-relaxed">
                Dates are interpreted as local midnight for the selected day. If
                the end date is not after the start date, the timer is blocked
                until you fix the inputs.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API and updates state on{" "}
                <span className="font-semibold text-slate-900">
                  fullscreenchange
                </span>
                . Most browsers require a user gesture (click/tap) to enter
                fullscreen.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Disclosure.</strong> This is a
          countdown + pacing estimate. It does not replace lender statements or
          a payoff calculator that models interest and payment schedules.
        </div>
      </div>
    </section>
  );
}
