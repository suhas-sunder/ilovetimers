export default function KeyboardShortcuts() {
  // Exam Timer supports:
  // Space (start/pause), R (reset), F (fullscreen), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Start / Pause the timer" },
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
   BEHAVIOR + PRIVACY (audio, fullscreen, local-only)
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
              No sign-in required. The timer runs on this page in your browser
              and counts down from the duration you select.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No saved sessions
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page doesn’t store exam sessions, history, or “saved tests.”
              If you refresh the page, the timer resets. Use presets or custom
              minutes to set it up again quickly.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Sound is optional (and browser-limited)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              If Sound is enabled, you can enable warning beeps (5 minutes
              and/or 1 minute remaining) and a finish beep at zero. Final beeps
              can add short beeps during the last 5 seconds. Some browsers
              require a click/tap before audio is allowed.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is display-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen maximizes readability and keeps controls out of the
              way. Exit with{" "}
              <span className="font-semibold text-slate-900">Esc</span> or the
              Exit button. Clicking/tapping the main display starts or pauses.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Background tab behavior
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Browsers may throttle background tabs to save power. The countdown
              will catch up when you return, but the visual updates can look
              less smooth while hidden. For the cleanest display, keep it
              foreground or fullscreen.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Duration lock while running
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              While the timer is running, duration controls are disabled to
              avoid accidental mid-section edits. Pause or reset before changing
              the minutes.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (timing + audio + fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                A few browser-related behaviors
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                How remaining time is calculated
              </div>
              <p className="mt-1 leading-relaxed">
                When you press Start, the timer targets an internal “end time”
                based on elapsed time. This keeps the countdown steady even if a
                frame is delayed.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Background throttling
              </div>
              <p className="mt-1 leading-relaxed">
                Background tabs can get fewer animation updates. The UI may look
                choppy while hidden, but it will catch up when active again.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Audio permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Many browsers block audio until the user interacts with the
                page. If beeps do not play, click Start once and test again.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen rules
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen typically requires a user gesture (click/tap). Some
                embedded views or strict privacy settings may restrict
                fullscreen and/or audio playback.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Note.</strong> This timer is
          designed for quick, reliable practice timing. For the cleanest
          experience, keep the page active or use fullscreen.
        </div>
      </div>
    </section>
  );
}
