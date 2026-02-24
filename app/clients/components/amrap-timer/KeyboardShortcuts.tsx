export default function KeyboardShortcuts() {
  // Site-wide list, but phrased so it’s useful on any page.
  // Includes AMRAP-specific scoring keys too.
  const rows = [
    { key: "Space", action: "Start or pause the focused timer card" },
    {
      key: "R",
      action: "Reset the focused timer (or reset all on some tools)",
    },
    { key: "F", action: "Toggle fullscreen on the focused display" },

    // AMRAP / score-style controls
    { key: "+", action: "Increase reps (AMRAP Timer)" },
    { key: "−", action: "Decrease reps (AMRAP Timer)" },
    { key: "↑", action: "Increase rounds (AMRAP Timer)" },
    { key: "↓", action: "Decrease rounds (AMRAP Timer)" },

    // Other tool-specific controls (only apply on their pages)
    { key: "S", action: "Toggle sound (timers with sound)" },
    { key: "X", action: "Stop a ringing alarm (Alarm Timer)" },
    { key: "L", action: "Record a lap (Stopwatch)" },
    { key: "N", action: "Next/skip phase (Pomodoro, HIIT, Tabata)" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-slate-700 leading-relaxed">
          Click any timer card once to focus it, then use the keyboard to
          control it. Shortcuts only work for the tool that supports them.
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
          Tip: if shortcuts do nothing, your cursor is probably inside an input.
          Click outside the input (or press Escape), then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   4) ACCURACY, BACKGROUND, OFFLINE, PRIVACY (trust + honesty)
   Schema: none required
========================================================= */
export function AccuracyAndPrivacySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Accuracy, reliability, and privacy
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Background tabs and lock screens
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Browsers may throttle animation updates when a tab is in the
              background or a device is locked. The timer uses a target end time
              while it’s running, so it stays aligned while the page remains
              open, but the display can update less often and “jump” when you
              return. For workouts, keep it visible or use fullscreen.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No system alarms or notifications
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              These timers run inside your browser. If you close the tab/app or
              the browser session ends, they can’t ring like a phone alarm or
              send push notifications. If you need a guaranteed alarm, use your
              device’s alarm app.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Sound</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Audio is controlled by your browser and device settings. Some
              browsers block audio until you click/tap the page. If you want
              beeps, tap Start once with Sound enabled before the workout. For a
              silent run, turn off Sound.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Privacy</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Timers run locally in your tab. No account required. The tool
              doesn’t need personal information to function.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <div className="text-sm font-semibold text-slate-900">
              Best setup for reliability
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              For workouts or coaching: use fullscreen, keep the device awake,
              and confirm audio output before you start (especially if you’re on
              Bluetooth or casting). If you’re using a TV/projector, test Start/
              Pause and the beeps once, then reset and run the session.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (for reliability)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Why the display can jump, and why sound may be blocked
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Background throttling
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers reduce timer and animation frequency in background
                tabs. A timer can still remain accurate by comparing “now” to a
                stored end time, but the UI won’t repaint every frame while
                throttled, so it may jump when the tab becomes active again.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Audio gesture requirements
              </div>
              <p className="mt-1 leading-relaxed">
                Many browsers require a user gesture before audio playback.
                That’s why you may need to click/tap the page (or Start) once
                before beeps will play reliably.
              </p>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
