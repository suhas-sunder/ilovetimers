export default function KeyboardShortcuts() {
  // Water Reminder Timer supports:
  // Space (start/pause), N (remind now), R (reset all), F (fullscreen), S (toggle sound), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Start / pause" },
    { key: "N", action: "Remind now (only while running)" },
    { key: "R", action: "Reset all (clears reminders count)" },
    { key: "F", action: "Toggle fullscreen" },
    { key: "S", action: "Toggle sound on/off" },
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
   BEHAVIOR + PRIVACY (timing, sound, fullscreen, local-only)
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
              No sign-in required. The reminder timer runs on this page while
              it’s open in your browser.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Repeating cycle behavior
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              When the countdown hits zero, a reminder fires and the timer
              automatically restarts a fresh cycle using your selected interval.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Sound is optional
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Sound uses a short WebAudio beep. Some browsers only allow audio
              after you interact with the page (click/tap/press a key), so if
              you don’t hear anything, interact once and try again.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is display-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen makes the timer big and simple. Exit with{" "}
              <span className="font-semibold text-slate-900">Esc</span> or the
              Exit button. In fullscreen, clicking/tapping the display toggles
              start/pause.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No notifications when closed
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This tool does not use system notifications and won’t keep running
              after you close the tab or browser. If you need background
              reminders, use your device’s reminders/clock features.
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
                Technical notes (timing + audio + fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                How countdown timing is computed, why background tabs may drift,
                and browser audio/fullscreen rules
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Countdown timing
              </div>
              <p className="mt-1 leading-relaxed">
                The timer tracks an “end time” using{" "}
                <span className="font-semibold text-slate-900">
                  performance.now()
                </span>{" "}
                and updates the remaining time each animation frame for smooth
                display. When it reaches zero, it immediately schedules the next
                cycle from “now.”
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Background tab behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers can throttle timers and animation frames in background
                tabs or on locked devices. That can delay reminders until the
                page is active again.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Audio rules</div>
              <p className="mt-1 leading-relaxed">
                Beeps use the WebAudio API. If the audio context starts
                suspended, the page attempts to resume it. Many browsers still
                require a user gesture before sound can play.
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
                . Most browsers require a click/tap to enter fullscreen.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Note.</strong> Reminders run in
          your browser while this tab is open. Background tabs may update less
          often, so reminder timing can drift depending on browser power-saving
          behavior.
        </div>
      </div>
    </section>
  );
}
