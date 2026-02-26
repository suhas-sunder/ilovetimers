import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (MEETING COUNT UP TIMER)
========================================================= */
export default function KeyboardShortcuts() {
  // Meeting Count Up Timer supports:
  // Space (start/pause), T (topic split), R (reset), F (toggle fullscreen), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Start / pause" },
    { key: "T", action: "Record Topic split" },
    { key: "R", action: "Reset (clears time + topics)" },
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
   BEHAVIOR + PRIVACY (fullscreen, splits, timing, local-only)
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
              No sign-in required. Elapsed time, topic splits, and fullscreen
              controls run in your browser.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Timing is based on your device performance clock
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The count up uses your device performance clock to track elapsed
              time. If your device is under heavy load, the display may update
              less smoothly, but the timer still aims to reflect the correct
              elapsed time.
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
              Agenda inputs do not change recorded history
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Changing the Topic button label or agenda cap affects future
              entries. Existing Topic splits remain as they were recorded.
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
              Reset clears elapsed time and Topic splits
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Reset stops the timer, returns elapsed time to 0, and clears all
              Topic splits. Your Topic label and agenda cap settings stay as you
              set them.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (splits, caps, fullscreen, formatting)
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
              <div className="font-semibold text-slate-900">
                Topic split math
              </div>
              <p className="mt-1 leading-relaxed">
                Each Topic records the total elapsed time at the moment you
                press Topic, plus a split time that measures time since the
                previous Topic (or since start for the first Topic).
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Agenda cap rules
              </div>
              <p className="mt-1 leading-relaxed">
                If you set “# of agenda topics”, Topic is disabled once you
                reach that count. The cap will not drop below the number of
                already recorded topics.
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
              <div className="font-semibold text-slate-900">
                Time formatting
              </div>
              <p className="mt-1 leading-relaxed">
                The display shows{" "}
                <span className="font-semibold text-slate-900">m:ss</span> while
                under an hour, and switches to{" "}
                <span className="font-semibold text-slate-900">h:mm:ss</span>{" "}
                after 1 hour. Reset returns the display to{" "}
                <span className="font-semibold text-slate-900">0:00</span>.
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
                starts or topic marks.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Related.</strong> Need a countdown
          meeting timer (time remaining)?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/meeting-timer"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Meeting Timer
            </Link>
          </span>
          . Want a simpler count up tool?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/count-up-timer"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Count Up Timer
            </Link>
          </span>
          . Prefer a lap-style workflow?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/stopwatch"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Stopwatch
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
