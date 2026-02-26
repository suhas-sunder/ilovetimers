import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (MULTIPLE TIMERS)
========================================================= */
export default function KeyboardShortcuts() {
  // Multiple Timers supports:
  // Space (start/pause all), R (reset all), A (add timer), X (stop alarms), F (fullscreen), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Start / pause all timers" },
    { key: "R", action: "Reset all timers" },
    { key: "A", action: "Add a new timer" },
    { key: "X", action: "Stop all alarms" },
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
          won’t trigger while you’re typing in an input field (like a timer
          label or time entry).
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
                <tr
                  key={`${r.key}-${r.action}`}
                  className="border-b border-slate-100"
                >
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
          inside the tool area once (not inside an input), then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (multiple timers + sound + persistence + fullscreen)
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
              Timers run locally in your browser
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Countdown timing, alarms, and controls run on your device. No
              account is needed to use the tool.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Each timer has an alarm state at zero
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              When a timer reaches 0 it switches into an alarm state. You can
              stop an individual alarm from the timer tile or stop all alarms at
              once.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Sound and final beeps are optional
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Sound controls whether alarms can play. Final beeps (if enabled)
              provide a short cue during the last 5 seconds before a timer hits
              0.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Your setup can be saved on this device
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Timer labels, durations, remaining time, and sound settings are
              saved in your browser on this device. Clearing site data or using
              a private window may prevent saving.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No uploads required
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page does not ask you to upload files or personal data to run
              timers.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is a browser feature
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen uses your browser’s permission. Press{" "}
              <span className="font-semibold text-slate-900">Esc</span> to exit
              at any time.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (timing, sound, saving, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional details about timing behavior, audio requirements, and
                saved state
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Countdown timing behavior
              </div>
              <p className="mt-1 leading-relaxed">
                When you start a timer, it counts down from its remaining time.
                Pause preserves the remaining time, and resume continues from
                that point.
              </p>
              <p className="mt-2 leading-relaxed">
                Changing presets or minutes/seconds resets that timer’s duration
                and pauses it to avoid accidental mid-run edits.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Sound requirements
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers may require a user interaction before audio can play.
                If you don’t hear alarms or final beeps, click anywhere on the
                page and try again, and verify the tab isn’t muted.
              </p>
              <p className="mt-2 leading-relaxed">
                Final beeps only play when Sound is enabled.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Saved state</div>
              <p className="mt-1 leading-relaxed">
                The tool can store your timers and settings in browser local
                storage on this device so your layout survives reloads.
              </p>
              <p className="mt-2 leading-relaxed">
                Private browsing or strict privacy settings may block storage.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Fullscreen</div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser fullscreen API. Some browsers
                require a click gesture to enter fullscreen; Esc always exits.
              </p>
              <p className="mt-2 leading-relaxed">
                In fullscreen, top controls and a bottom status strip stay
                accessible for quick control.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Related.</strong> Need a single
          countdown?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/countdown-timer"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Countdown Timer
            </Link>
          </span>
          . Want structured intervals?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/hiit-timer"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              HIIT Timer
            </Link>
          </span>
          . Prefer no sound?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/silent-timer"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Silent Timer
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
