export default function KeyboardShortcuts() {
  // Event Countdown supports:
  // Space (start/pause), R (reset), F (fullscreen), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Start / Pause the countdown" },
    {
      key: "R",
      action: "Reset (recalculate remaining time for the current target)",
    },
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
          Click the countdown card once, then use the keyboard to control it.
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
          Tip: if shortcuts do nothing, the countdown card probably isn’t
          focused. Click the card once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (saved events, audio, fullscreen, local-only)
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
              No sign-in required. The countdown runs on this page in your
              browser and uses your device clock to calculate time remaining.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Saved events are stored on this device
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Your saved events live in your browser storage. Creating,
              duplicating, and deleting events only affects this browser on this
              device. Clearing site data removes them.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Date & time uses your local timezone
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The date/time picker is local to your device. If your timezone
              changes, the displayed target can change because it’s interpreted
              in local time.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Sound is optional (and browser-limited)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              If Sound is enabled, you’ll hear a finish beep at zero. If Final
              beeps is enabled, it also beeps during the last 5 seconds. Some
              browsers require interaction before audio is allowed, so if you
              don’t hear anything, click Start once and try again.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is display-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen gives you a large countdown display with quick Start
              and Reset controls. Exit with{" "}
              <span className="font-semibold text-slate-900">Esc</span> or the
              Exit button. Clicking/tapping the main display starts or pauses.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Background tab behavior
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Some browsers throttle background tabs to save power. The display
              can look less smooth when the tab is in the background. For the
              most reliable visual countdown, keep it in the foreground or use
              fullscreen.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (time math, timezone, audio)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                A few definitions and browser-related behaviors
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
                Remaining time is computed from your chosen local target time
                minus your current device time. If your device clock is wrong,
                the countdown will be wrong.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Why timezone changes can affect targets
              </div>
              <p className="mt-1 leading-relaxed">
                The input uses a local date/time value. If your device timezone
                changes, that same local value may represent a different moment,
                which can change the effective target.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Background throttling
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers can reduce timer frequency in background tabs. The app
                still recalculates from real time, but the visual updates may
                appear choppy until the tab is active again.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen and audio rules
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen and audio usually require a user gesture (click/tap).
                Some environments (embedded views, strict privacy settings) may
                restrict audio playback.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Note.</strong> This tool uses your
          device clock and your local timezone settings. If either is incorrect,
          the countdown will be incorrect too.
        </div>
      </div>
    </section>
  );
}
