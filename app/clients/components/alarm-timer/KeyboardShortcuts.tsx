export default function KeyboardShortcuts() {
  const rows = [
    { key: "Space", action: "Start or pause the focused timer card" },
    { key: "R", action: "Reset the focused timer" },
    { key: "F", action: "Toggle fullscreen on the focused display" },
    { key: "S", action: "Toggle sound (Alarm Timer)" },
    { key: "X", action: "Stop the ringing alarm (Alarm Timer)" },
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
              Browsers may throttle animations and timers when a tab is in the
              background or a device is locked. The countdown stays aligned
              while the page remains open, but the visual display may update
              less often and “jump” forward when you return. For presentations,
              keep it visible or use fullscreen.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No system alarms or notifications
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              These timers run inside your browser. If you close the tab/app or
              the browser suspends, they can’t ring like a phone alarm or send
              push notifications. If you need a guaranteed wake-up alarm, use
              your device’s alarm app.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Sound</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Audio is controlled by your browser and device settings. Some
              browsers block audio until you click/tap the page. If you need a
              silent timer, turn off Sound or mute your device.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Privacy</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Timers run locally in your tab. No account required. The tool
              doesn’t need personal information to run.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <div className="text-sm font-semibold text-slate-900">
              Best setup for reliability
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              For workouts, cooking, classrooms, or presentations: enable
              fullscreen, keep the device awake, and make sure audio is allowed
              (tap once before you start). If you’re casting to a TV, confirm
              the audio output device before starting.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
