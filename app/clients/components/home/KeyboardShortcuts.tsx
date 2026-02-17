export default function KeyboardShortcuts() {
  const rows = [
    { key: "Space", action: "Start or pause the focused timer card" },
    { key: "R", action: "Reset the focused timer" },
    { key: "F", action: "Toggle fullscreen on the focused display" },
    { key: "L", action: "Record a lap (Stopwatch)" },
    { key: "N", action: "Next or skip phase (Pomodoro and HIIT)" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-slate-700 leading-relaxed">
          Click any timer card once to focus it, then use the keyboard to
          control it.
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
          Click outside the input or press Escape, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   4) ACCURACY, BACKGROUND, OFFLINE, PRIVACY (trust + honesty)
   Schema: none required, but can add WebPageElement if you want
========================================================= */
export function AccuracyAndPrivacySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Accuracy and reliability
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Background tabs and lock screens
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Browsers may throttle animations when a tab is in the background
              or a device is locked. The timers keep tracking time and update
              when the browser resumes. For presentations, fullscreen is the
              most reliable setup.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Offline after first load
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Once the page is loaded, your device can usually keep running the
              timers even with poor connectivity. Keep the tab open if you are
              relying on it during an event.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Sound</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Audio is controlled by your browser and device settings. If you
              need a silent timer, turn off Sound or mute your device.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Privacy</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Timers run locally in your tab. No account required. Use the tools
              without sharing personal data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
