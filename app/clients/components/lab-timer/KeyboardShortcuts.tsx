import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (LAB TIMER)
========================================================= */
export default function KeyboardShortcuts() {
  // Lab Timer supports:
  // Space (stopwatch start/pause), L (lap), C (countdown start/pause),
  // T (toggle repeat), R (reset both), F (toggle fullscreen countdown), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Stopwatch start / pause" },
    { key: "L", action: "Record lap (stopwatch)" },
    { key: "C", action: "Countdown start / pause" },
    { key: "T", action: "Toggle Repeat step (countdown)" },
    { key: "R", action: "Reset stopwatch + countdown" },
    { key: "F", action: "Toggle fullscreen (countdown box)" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-slate-700">
          Click the Lab Timer card once, then use the shortcuts below. Shortcuts
          won’t trigger while you’re typing in an input, select, textarea, or
          editable field.
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
          Tip: if shortcuts do nothing, the card probably isn’t focused. Click
          once on the Lab Timer card, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (sound, fullscreen, timing, local-only)
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
              No sign-in required. The stopwatch, laps, countdown, fullscreen,
              and sound controls run in your browser.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Timing is based on your device performance clock
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The timers use your device performance clock to stay stable even
              if the page is busy. If your device is under heavy load, visuals
              may update less smoothly, but start/stop points still target the
              intended durations.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Sound may require a tap/click first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Some browsers block audio until you interact with the page. If
              cues are silent, press Start once, then keep Sound enabled.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is for the step countdown
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen maximizes readability for the step timer and keeps
              controls minimal. Exit with{" "}
              <span className="font-semibold text-slate-900">Esc</span> or the
              Exit button.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Changing the step time resets the countdown
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Updating the Custom step (seconds) or picking a Common step time
              resets the countdown so your next run matches the new value.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No account, no uploads
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page does not require an account and does not ask you to
              upload experiment notes or personal data to use the timers.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (laps, repeat, beeps, fullscreen, focus)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional details about how the Lab Timer behaves
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Stopwatch laps</div>
              <p className="mt-1 leading-relaxed">
                Lap records a split (time since the previous lap) and the total
                elapsed time at the moment you pressed it. Laps are listed
                newest-first, and the shortest split is labeled as the best lap.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Max laps</div>
              <p className="mt-1 leading-relaxed">
                Max laps limits how many lap entries are stored and displayed.
                When the cap is reached, additional laps are ignored until you
                reset.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Repeat step behavior
              </div>
              <p className="mt-1 leading-relaxed">
                With Repeat on, the countdown plays the completion cue (if Sound
                is enabled) then immediately reloads the current step duration
                and starts the next cycle.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Final beeps behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Final beeps trigger once per second during the last 5 seconds
                before the countdown reaches zero. They only run when Sound is
                enabled.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen scope
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen applies to the step countdown box. In fullscreen, the
                top bar provides Start/Pause, Reset, and Repeat On/Off, and the
                timer area is clickable to start/pause.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Focus + keyboard handling
              </div>
              <p className="mt-1 leading-relaxed">
                Shortcuts are captured on the Lab Timer card. If shortcuts do
                not fire, click the card once to focus it. While you’re typing
                in an input, shortcuts are ignored to prevent accidental starts
                and resets.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Related.</strong> Need a dedicated
          stopwatch view?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/stopwatch"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Stopwatch
            </Link>
          </span>
          . Want a simple countdown?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/countdown-timer"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Countdown Timer
            </Link>
          </span>
          . Need parallel timers?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/multiple-timers"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Multiple Timers
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
