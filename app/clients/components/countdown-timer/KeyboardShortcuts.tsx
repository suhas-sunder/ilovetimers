export default function KeyboardShortcuts() {
  // Count Up Timer supports: Space (start/pause), L (lap), R (reset),
  // F (fullscreen), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Start / pause" },
    { key: "L", action: "Record a lap (split)" },
    { key: "R", action: "Reset to 0 and clear laps" },
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
          Click the timer card once, then use the keyboard to control the count
          up timer. Shortcuts won’t trigger while you’re typing in an input,
          select, textarea, or editable field.
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
          Click the timer once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   4) TRUST + HONESTY (timing, fullscreen, focus)
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
              No sign-in required. The timer runs on your device and timing is
              computed locally in the browser.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Elapsed time is measured from a high-resolution clock
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              While running, elapsed time is computed using a monotonic,
              high-resolution performance clock and the UI updates with{" "}
              <span className="font-semibold text-slate-900">
                requestAnimationFrame
              </span>{" "}
              for smooth repaints.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is display-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen makes the digits large and adds top/bottom controls.
              Exit with{" "}
              <span className="font-semibold text-slate-900">Esc</span> or the
              Exit button. In fullscreen, you can also tap/click the time area
              to start or pause.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Laps store totals and splits
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Each lap saves the current{" "}
              <span className="font-semibold text-slate-900">Total</span>{" "}
              elapsed time plus a{" "}
              <span className="font-semibold text-slate-900">Split</span> (time
              since the previous lap). The newest lap stays at the top.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Focus affects shortcuts
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Keyboard shortcuts work when the timer card is focused. If keys
              don’t respond, click the timer card once, then use Space/L/R/F.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Background tabs can look less smooth
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Browsers often throttle animations in background tabs or when a
              device is locked. When you return, the timer should continue from
              the correct elapsed time, but updates may appear less smooth while
              inactive.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (timing + laps + fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Timing model, lap math, display rounding, and fullscreen
                handling
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Timer model</div>
              <p className="mt-1 leading-relaxed">
                While running, elapsed time is computed from a stored base value
                plus the delta from{" "}
                <span className="font-semibold text-slate-900">
                  performance.now()
                </span>
                . The UI repaints using{" "}
                <span className="font-semibold text-slate-900">
                  requestAnimationFrame
                </span>
                .
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Lap math</div>
              <p className="mt-1 leading-relaxed">
                A lap stores the current total elapsed time plus a split that
                equals (current elapsed) minus (previous lap elapsed). Lap 1’s
                split is time since start.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Display rounding
              </div>
              <p className="mt-1 leading-relaxed">
                The readout is displayed in whole seconds (rounded up) so it’s
                stable at a glance, while internal timing continues in
                milliseconds.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen handling
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API on the card container
                and updates UI state based on fullscreenchange events. Exit with
                Esc or the Exit button.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Note.</strong> This page does not
          request a wake lock. If your device sleeps or the browser heavily
          throttles background activity, the UI may update less smoothly until
          you return.
        </div>
      </div>
    </section>
  );
}
