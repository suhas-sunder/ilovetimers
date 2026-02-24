export default function Disclaimer() {
  const preview =
    "Sound can be blocked • Background tabs can throttle updates • No notifications • Fullscreen restrictions";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Limits & notes
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {preview}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <ul className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Sound depends on a user gesture.
              </strong>{" "}
              Many browsers block audio until you click/tap the page. If you
              want beeps, press Start once while sound is enabled. Also check
              system mute, volume, and Bluetooth output (your sound may be going
              to earbuds or another device).
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Background tabs are throttled.
              </strong>{" "}
              Browsers reduce updates in background tabs or with the screen
              locked. The countdown stays aligned while running, but the display
              may “jump” when you return. For best results, keep this tab
              visible during the workout.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                No notifications or system alarms.
              </strong>{" "}
              This timer runs only while this page is open. It cannot send push
              notifications or trigger a phone/OS alarm if you close the tab or
              lose the browser session.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Fullscreen has browser limits.
              </strong>{" "}
              Fullscreen must be initiated by user interaction and may be
              restricted by browser/device policies (especially on mobile). Use
              Esc to exit fullscreen.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                “Final beeps” are only the last 5 seconds.
              </strong>{" "}
              If enabled, you’ll hear one short beep per second in the last 5
              seconds of the AMRAP. Turn it off if you prefer a silent finish.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Keyboard focus matters.
              </strong>{" "}
              Click the timer card once so shortcuts work: Space start/pause • R
              reset all • F fullscreen • S sound • +/− reps • ↑/↓ rounds.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Score is manual (it won’t auto-detect rounds).
              </strong>{" "}
              The rep/round counters only change when you tap +/− or use the
              shortcuts. That’s intentional so you can score any workout format.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Prep countdown behavior.
              </strong>{" "}
              Prep runs first (if set), then the AMRAP starts automatically. If
              you pause during prep, resuming continues prep where you left off.
            </li>
          </ul>
        </details>
      </div>
    </section>
  );
}
