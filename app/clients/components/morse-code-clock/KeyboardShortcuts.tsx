import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (MORSE CODE CLOCK)
========================================================= */
export default function KeyboardShortcuts() {
  // Morse Code Clock supports:
  // F (fullscreen), T (24-hour), S (seconds), V (view), C (copy), Esc (exit fullscreen)
  const rows = [
    { key: "F", action: "Toggle fullscreen" },
    { key: "T", action: "Toggle 24-hour time" },
    { key: "S", action: "Toggle seconds on/off" },
    { key: "V", action: "Switch view (blocks ↔ text)" },
    { key: "C", action: "Copy time + Morse output" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-slate-700">
          Click the Morse clock card once, then use the shortcuts below.
          Shortcuts won’t trigger while you’re typing in an input field.
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
          the display once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (morse digits + live time + fullscreen + copy)
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
              Uses your device time and time zone
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The clock shows your local device time. If your system clock or
              time zone is set incorrectly, the display will reflect that.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Live updates for a stable clock feel
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The display updates continuously and stays aligned to the second
              boundary so it doesn’t “drift” visually.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Block and Text views are the same data
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Block view renders dots and dashes as shapes for readability. Text
              view shows the raw Morse strings. Both represent the same digits.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Copy is opt-in and writes to your clipboard
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The Copy action runs only when you press it (or hit C). It writes
              the current time and Morse output to your clipboard so you can
              paste it elsewhere.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No account, no uploads
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page does not require an account and does not ask you to
              upload files or personal data to use the tool.
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
                Technical notes (updates, Morse digits, fullscreen, clipboard)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional details about update cadence, digit encoding, and
                browser APIs used
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Live update cadence
              </div>
              <p className="mt-1 leading-relaxed">
                The clock schedules updates to land on the next second boundary,
                which keeps the visual timing consistent.
              </p>
              <p className="mt-2 leading-relaxed">
                Showing seconds increases the number of displayed digits (and
                Morse groups) without changing how encoding works.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Digit encoding (0–9)
              </div>
              <p className="mt-1 leading-relaxed">
                Each digit is mapped to its standard Morse code pattern, then
                rendered as either text (dots and dashes) or blocks (circles and
                rounded bars).
              </p>
              <p className="mt-2 leading-relaxed">
                Separators between HH and MM (and SS if enabled) are visual only
                and aren’t encoded as Morse.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Fullscreen + clipboard behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser fullscreen API and may require user
                interaction depending on browser settings. Copy uses the modern
                Clipboard API when available and falls back to a compatible copy
                method for older contexts.
              </p>
              <p className="mt-2 leading-relaxed">
                Clipboard access only happens when you press Copy (or C).
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Related.</strong> Prefer a standard
          clock?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/digital-clock"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Digital Clock
            </Link>
          </span>
          . Want another “coded” display?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/binary-clock"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Binary Clock
            </Link>
          </span>
          . Need other locations?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/world-clock"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              World Clock
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
