import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (WORLD CLOCK)
========================================================= */
export default function KeyboardShortcuts() {
  // World Clock supports:
  // F (fullscreen), T (24-hour toggle), S (seconds toggle), C (copy), R (reset), X (clear), Esc (exit fullscreen)
  const rows = [
    { key: "F", action: "Toggle fullscreen" },
    { key: "T", action: "Toggle 24-hour time" },
    { key: "S", action: "Toggle seconds" },
    { key: "C", action: "Copy selected city times" },
    { key: "R", action: "Reset to default cities" },
    { key: "X", action: "Clear all selected cities" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-slate-700">
          Click the World Clock card once, then use the shortcuts below.
          Shortcuts won’t trigger while you’re typing in the Search field.
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
   BEHAVIOR + PRIVACY (world clock + formatting + fullscreen)
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
              City selection, formatting (24-hour and seconds), and fullscreen
              run on your device. No account is needed.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Live updates with clean boundaries
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              With seconds shown, the display updates on the next second. With
              seconds hidden, it updates on the next minute.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Clear add/remove behavior
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Click a Popular chip to toggle a city on or off. You can also
              remove a city from its card. Reset restores the default set; Clear
              removes everything.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Copy stays simple
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Copy outputs plain text: one line per selected city with its
              current time and time zone. It’s designed to paste cleanly into
              messages and notes.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No uploads required
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page does not ask you to upload files or personal data to use
              the world clock.
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
                Technical notes (formatting, updating, fullscreen, copy)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional details about time formatting, update cadence, and how
                copy output is produced
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Time zone formatting
              </div>
              <p className="mt-1 leading-relaxed">
                Times are formatted using standard IANA time zones (for example
                America/Toronto). The display respects your chosen 12/24-hour
                and seconds settings.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Update cadence</div>
              <p className="mt-1 leading-relaxed">
                When seconds are on, updates are aligned to the next second
                boundary. When seconds are off, updates align to the next minute
                boundary for a steadier display.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">Copy output</div>
              <p className="mt-1 leading-relaxed">
                Copy produces one line per selected city in the format{" "}
                <span className="font-semibold text-slate-900">
                  City: time (timeZone)
                </span>
                . If you need to convert a specific scheduled time between time
                zones (not just “now”), use the Time Zone Converter.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">Fullscreen</div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser fullscreen API. Some browsers
                require a click gesture to enter fullscreen; Esc always exits.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Related.</strong> Need conversions
          between time zones?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/time-zone-converter"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Time Zone Converter
            </Link>
          </span>
          . Want a UTC reference?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/utc-clock"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              UTC Clock
            </Link>
          </span>
          . Want a single big clock display?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/digital-clock"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Digital Clock
            </Link>
          </span>
          . Need only your local time?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/current-local-time"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Current Local Time
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
