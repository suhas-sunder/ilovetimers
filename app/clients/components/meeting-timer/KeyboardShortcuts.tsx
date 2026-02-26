import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (MEETING TIMER)
========================================================= */
export default function KeyboardShortcuts() {
  // Meeting Timer supports:
  // Space (start/pause), R (reset), F (toggle fullscreen), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Start / pause" },
    { key: "R", action: "Reset (back to selected minutes)" },
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
   BEHAVIOR + PRIVACY (fullscreen, timing, audio, local-only)
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
              No sign-in required. The countdown, presets, fullscreen controls,
              and sound settings run in your browser.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Countdown stays accurate while running
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The timer uses your device performance clock to keep the countdown
              aligned with real time. If your device is under heavy load, the
              display may update less smoothly, but it still aims to reflect the
              correct remaining time.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is display-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen maximizes readability and keeps controls minimal. In
              fullscreen, you can tap or click the time display to start or
              pause.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Changing minutes resets the timer
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Switching presets or editing Custom minutes stops the timer and
              resets the countdown to the new duration. This makes it easy to
              move to the next agenda timebox.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No account, no uploads
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page does not require an account and does not ask you to
              upload meeting notes or personal data to use the timer.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Reset returns to the selected duration
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Reset stops the countdown and returns the time to your currently
              selected minutes (preset or custom).
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (countdown, fullscreen, audio, formatting)
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
              <div className="font-semibold text-slate-900">Countdown math</div>
              <p className="mt-1 leading-relaxed">
                When you press Start, the timer sets a target end time based on
                the current remaining time. Each frame, it recomputes remaining
                time from that target so the countdown does not drift.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Minute changes</div>
              <p className="mt-1 leading-relaxed">
                Changing presets or Custom minutes fully resets the timer state:
                it stops running, clears any pending end time, and sets the new
                duration as the remaining time.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen notes
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen targets the timer card element. Some browsers require
                a direct user gesture to enter fullscreen, so use the Fullscreen
                button or press F while the card is focused.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Audio notes</div>
              <p className="mt-1 leading-relaxed">
                Beeps are generated with WebAudio. If audio is blocked, interact
                with the page (click Start) and try again. Final beeps trigger
                only in the last 5 seconds when enabled.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Time formatting
              </div>
              <p className="mt-1 leading-relaxed">
                The display uses{" "}
                <span className="font-semibold text-slate-900">m:ss</span> while
                under an hour, and switches to{" "}
                <span className="font-semibold text-slate-900">h:mm:ss</span>{" "}
                after 1 hour. The UI rounds to whole seconds for a stable,
                readable countdown.
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
                starts or resets.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Related.</strong> Need elapsed time
          tracking with agenda splits?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/meeting-count-up-timer"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Meeting Count Up Timer
            </Link>
          </span>
          . Want a general countdown tool?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/countdown-timer"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Countdown Timer
            </Link>
          </span>
          . Presenting and want a stage-friendly display?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/presentation-timer"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Presentation Timer
            </Link>
          </span>
          . Prefer a no-audio option?{" "}
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
