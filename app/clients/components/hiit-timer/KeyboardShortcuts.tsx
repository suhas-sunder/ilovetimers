import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (HIIT TIMER)
========================================================= */
export default function KeyboardShortcuts() {
  // HIIT Timer supports:
  // Space (start/pause), N (next), R (reset), F (toggle fullscreen), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Start / pause" },
    { key: "N", action: "Next phase" },
    { key: "R", action: "Reset to start" },
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
          Click the timer card once, then use the shortcuts below. Shortcuts
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
          Tip: if shortcuts do nothing, the timer card probably isn’t focused.
          Click the timer once, then try again.
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
              No sign-in required. Your interval settings, fullscreen mode, and
              controls run in your browser.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Timing is based on your device clock
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The timer counts down using your device performance clock to stay
              stable even if the page is busy. If your device is under heavy
              load, visuals may update less smoothly, but phase transitions
              still target the intended durations.
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
              Settings reset the session
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Changing warm-up, work, rest, rounds, or cool-down resets the
              timer back to Warm-up so your next run matches the updated values.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No account, no uploads
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page does not require an account and does not ask you to
              upload workouts or personal data to use the timer.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (phases, Next behavior, sound, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional details about how the timer behaves
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Phase flow</div>
              <p className="mt-1 leading-relaxed">
                The sequence is Warm-up → Work/Rest rounds → Cool-down → Done.
                Warm-up and Cool-down run once each. Rounds count increments
                after each Work (and optional Rest) pair.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Rest = 0</div>
              <p className="mt-1 leading-relaxed">
                When Rest is set to 0 seconds, Rest phases are skipped and the
                timer transitions Work → Work between rounds.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                “Next” behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Next stops the current phase and advances immediately. It does
                not “bank” remaining time. Use it to skip warm-up, skip a rest,
                or jump into cool-down.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Sound cues</div>
              <p className="mt-1 leading-relaxed">
                With Sound enabled, the page plays a short cue when a phase
                ends. Final 3-2-1 beeps trigger only in the last 3 seconds of
                Work, and only when Sound is on.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Focus + keyboard handling
              </div>
              <p className="mt-1 leading-relaxed">
                Keyboard shortcuts are captured on the timer card. If shortcuts
                do not fire, click the card once to focus it. While you’re
                typing in an input, shortcuts are ignored to prevent accidental
                starts and skips.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Related.</strong> Want a dedicated
          workout format?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/tabata-timer"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Tabata Timer
            </Link>
          </span>
          ,{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/emom-timer"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              EMOM Timer
            </Link>
          </span>
          , or{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/round-timer"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Round Timer
            </Link>
          </span>
          . Need a big on-screen countdown?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/fullscreen-timer"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Fullscreen Timer
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
