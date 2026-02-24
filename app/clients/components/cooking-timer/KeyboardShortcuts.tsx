export default function KeyboardShortcuts() {
  // Cooking Timer supports: Space (start/pause), R (reset), F (fullscreen),
  // S (sound), L (loop), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Start / pause" },
    { key: "R", action: "Reset to the current set time" },
    { key: "F", action: "Toggle fullscreen" },
    { key: "S", action: "Toggle sound" },
    { key: "L", action: "Toggle loop mode" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-slate-700 leading-relaxed">
          Click the timer card once, then use the keyboard to control the
          cooking timer. Shortcuts won’t trigger when your cursor is inside an
          input.
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
   4) TRUST + HONESTY (timing, fullscreen, sound, focus)
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
              The cooking timer runs on your device and doesn’t require sign-in.
              Core timing happens locally in the browser.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Countdown timing is end-time based
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The timer targets an end moment and updates remaining time from
              that target. This keeps the countdown consistent even if the UI
              frame rate varies.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is display-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen makes the countdown large and adds top and bottom
              controls. Exit with Esc or the Exit button. In fullscreen, you can
              also tap/click the time display area to start or pause.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Sound is optional
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              With Sound enabled, the timer can play a short end beep. If{" "}
              <span className="font-semibold text-slate-900">Final beeps</span>{" "}
              is enabled, it will also beep during the last 5 seconds as a
              heads-up. If Sound is off, it stays silent.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Loop repeats the same duration
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              When Loop is enabled, the timer automatically restarts with the
              current set time when it reaches zero. This is meant for repeated
              cycles without re-setting the duration each time.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Focus affects shortcuts
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Keyboard shortcuts work when the timer card is focused. If keys
              don’t respond, click the timer card once, then use Space/R/F/S/L.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (timing + sound + fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                End-time tracking, last-seconds beeps, audio restrictions, and
                fullscreen handling
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
                Remaining time is computed from a target end timestamp and the
                browser’s high-resolution clock. The display updates with
                requestAnimationFrame for smooth rendering.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Sound behavior</div>
              <p className="mt-1 leading-relaxed">
                Beeps use the Web Audio API. Some browsers require a user
                interaction (click or keypress) before sound can play, so start
                the timer once if audio seems blocked.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Final beeps + end beep
              </div>
              <p className="mt-1 leading-relaxed">
                Final beeps can play during the last 5 seconds of the countdown.
                An end beep plays when the timer hits zero (if Sound is
                enabled). If Sound is off, no audio will play.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen handling
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API on the card
                container. The UI adds top and bottom control bars in fullscreen
                mode. Exit with Esc or the Exit button.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Note.</strong> This timer does not
          request a wake lock. If your device sleeps or the tab is heavily
          throttled, the countdown may appear to pause, then catch up when the
          browser resumes.
        </div>
      </div>
    </section>
  );
}
