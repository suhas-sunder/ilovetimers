import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (TIME ZONE CONVERTER)
========================================================= */
export default function KeyboardShortcuts() {
  // Time Zone Converter supports:
  // F (fullscreen), S (swap), N (now), C (copy), Esc (exit fullscreen)
  const rows = [
    { key: "F", action: "Toggle fullscreen" },
    { key: "S", action: "Swap From and To time zones" },
    { key: "N", action: "Set date/time to now" },
    { key: "C", action: "Copy conversion output" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-slate-700">
          Click the Time Zone Converter card once, then use the shortcuts below.
          Shortcuts won’t trigger while you’re typing in an input.
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
   BEHAVIOR + PRIVACY (time zone converter + sharing + copy + fullscreen)
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
              Your selected time zones, date/time inputs, and seconds setting
              are processed on your device. No account is needed.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              DST-aware conversion for the selected date
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The conversion follows the selected zones’ daylight saving rules
              for the date you entered, so you don’t have to manually calculate
              offsets.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Copy stays practical
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Copy produces a plain-text block with your From/To zones, input
              date/time, both rendered times, and an ISO timestamp for a
              concrete reference.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Share links are explicit
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Share creates a URL that includes From zone, To zone, date, time,
              and seconds preference so someone else sees the same conversion.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No uploads required
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page does not ask you to upload files or personal data to use
              the converter.
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
                Technical notes (DST, ISO, copy, sharing, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional details about time zone rules, ambiguous local times,
                and why ISO is included
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Time zones and DST
              </div>
              <p className="mt-1 leading-relaxed">
                Time zones are IANA identifiers (for example{" "}
                <span className="font-semibold text-slate-900">
                  America/Toronto
                </span>
                ). The conversion uses the zone’s rules for the date you
                entered, including daylight saving changes.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">DST edge cases</div>
              <p className="mt-1 leading-relaxed">
                Near DST transitions, some local times can be skipped or
                repeated. If you’re converting a time near a DST boundary,
                double-check the date and time zone selection. The ISO timestamp
                helps avoid ambiguity.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">ISO timestamp</div>
              <p className="mt-1 leading-relaxed">
                ISO is included as a single, unambiguous instant in time. It’s
                useful for logs, tickets, and systems that need an exact moment
                rather than a local representation.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">Share link</div>
              <p className="mt-1 leading-relaxed">
                The share URL stores From/To zones, date, time, and the seconds
                setting in query parameters so opening the link restores the
                same conversion setup.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">Fullscreen</div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser fullscreen API. Some browsers
                require a click gesture to enter fullscreen;{" "}
                <span className="font-semibold text-slate-900">Esc</span> always
                exits.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Related.</strong> Want live times
          across multiple cities?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/world-clock"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              World Clock
            </Link>
          </span>
          . Need a UTC reference?{" "}
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
