export default function KeyboardShortcuts() {
  // Fullscreen Timer supports:
  // Space (start/pause), R (reset), F (toggle fullscreen), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Start / pause the countdown" },
    { key: "R", action: "Reset back to the selected duration" },
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
   BEHAVIOR + PRIVACY (countdown accuracy, fullscreen, audio, local-only)
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
              No sign-in required. The countdown and fullscreen behavior run
              entirely in your browser.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No saved timer history
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page doesn’t store a history of completed timers. If you
              refresh, the timer resets.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Countdown accuracy
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The timer anchors to an absolute end time and recalculates
              remaining time from your device clock. This helps keep the
              countdown steady across typical browser scheduling delays.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is display-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen maximizes readability and keeps controls minimal. Exit
              with <span className="font-semibold text-slate-900">Esc</span> or
              the Exit button.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Sound behavior
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Sound uses WebAudio. Some browsers block audio until you interact
              with the page. If you don’t hear the finish beep, click Start once
              and make sure the tab and device aren’t muted.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Loop repeats the same interval
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              When Loop is enabled, the countdown restarts automatically when it
              reaches zero. Turn Loop off to stop at Done.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (timing, audio, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Browser-related details, kept optional
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Timing model</div>
              <p className="mt-1 leading-relaxed">
                When you press Start, the page sets an absolute end timestamp.
                Each animation frame recalculates remaining time as (end - now)
                and clamps at zero.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Why it may “jump” occasionally
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers can throttle timers in background tabs or under heavy
                load. When the tab resumes, the timer catches up to the true
                remaining time based on your device clock.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Audio restrictions
              </div>
              <p className="mt-1 leading-relaxed">
                Many browsers require a user gesture to start audio playback. If
                sound is enabled but you hear nothing, click Start once and try
                again.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen rules
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen typically requires a click/tap. Some embedded
                browsers or strict settings may restrict fullscreen.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Note.</strong> If you need several
          timers running at once, use{" "}
          <span className="whitespace-nowrap">
            <a
              href="/multiple-timers"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Multiple Timers
            </a>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
