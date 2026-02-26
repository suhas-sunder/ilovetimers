import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (STOPWATCH)
========================================================= */
export default function KeyboardShortcuts() {
  // Stopwatch supports:
  // Space (start/pause), L (lap), C (copy laps), R (reset), F (fullscreen), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Start / pause" },
    { key: "L", action: "Record lap (split + total)" },
    { key: "C", action: "Copy laps as CSV" },
    { key: "R", action: "Reset (clear time + laps)" },
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
          Click the stopwatch card once, then use the shortcuts below. Shortcuts
          won’t trigger while you’re typing in an input.
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
   BEHAVIOR + PRIVACY (stopwatch + laps + copy + fullscreen)
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
              Timing, laps, copy, and fullscreen run on your device. No account
              is needed.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Millisecond display
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The stopwatch shows milliseconds so you can time short attempts
              and compare splits precisely.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Clear lap behavior
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Each lap records{" "}
              <span className="font-semibold text-slate-900">Total</span> (since
              start) and{" "}
              <span className="font-semibold text-slate-900">Split</span> (since
              the previous lap). Laps are listed most recent first.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Copy stays structured
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Copy exports a CSV with a header and one row per lap. It’s
              designed to paste cleanly into spreadsheets and notes.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No uploads required
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page does not ask you to upload files or personal data to use
              the stopwatch.
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
                Technical notes (timing, laps, fullscreen, copy)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional details about how timing updates, lap math, and export
                formatting work
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Timing updates</div>
              <p className="mt-1 leading-relaxed">
                While running, elapsed time updates continuously for a smooth
                display. When paused, the time is held steady until you resume
                or reset.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Lap math</div>
              <p className="mt-1 leading-relaxed">
                Split time is calculated as{" "}
                <span className="font-semibold text-slate-900">
                  current total minus previous lap total
                </span>
                . This keeps splits consistent even across pause/resume.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">Copy output</div>
              <p className="mt-1 leading-relaxed">
                Copy produces CSV with the header{" "}
                <span className="font-semibold text-slate-900">
                  Lap,Split Time,Total Time
                </span>
                . Times include milliseconds and use{" "}
                <span className="font-semibold text-slate-900">m:ss.mmm</span>{" "}
                (or{" "}
                <span className="font-semibold text-slate-900">
                  h:mm:ss.mmm
                </span>{" "}
                for longer sessions).
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">Fullscreen</div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser fullscreen API. Some browsers
                require a click gesture to enter fullscreen; Esc always exits.
                In fullscreen, the time display is clickable to start/pause.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Related.</strong> Need a countdown?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/countdown-timer"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Countdown Timer
            </Link>
          </span>
          . Want interval structure?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/hiit-timer"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              HIIT Timer
            </Link>
          </span>{" "}
          or{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/tabata-timer"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Tabata Timer
            </Link>
          </span>
          . Need multiple stations?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/multiple-timers"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Multiple Timers
            </Link>
          </span>
          . Prefer a dedicated solve timer?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/speedcubing-timer"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Speedcubing Timer
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
