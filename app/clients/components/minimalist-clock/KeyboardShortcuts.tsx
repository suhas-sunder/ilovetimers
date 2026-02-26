import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (MINIMALIST CLOCK)
========================================================= */
export default function KeyboardShortcuts() {
  // Minimalist Clock supports:
  // F (fullscreen), S (seconds), T (12/24), D (date), Z (zen), C (copy), Esc (exit fullscreen)
  const rows = [
    { key: "F", action: "Toggle fullscreen for the clock display" },
    { key: "S", action: "Toggle seconds on/off" },
    { key: "T", action: "Toggle 12-hour / 24-hour time" },
    { key: "D", action: "Toggle the date line on/off" },
    { key: "Z", action: "Toggle Zen mode (auto-hide UI when idle)" },
    { key: "C", action: "Copy a timestamp block (time, time zone, ISO)" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-slate-700">
          Click the clock once, then use the shortcuts below. Shortcuts won’t
          trigger while you’re typing in an input, select, textarea, or editable
          field.
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
          Tip: if shortcuts do nothing, the clock probably isn’t focused. Click
          the clock once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (local-only clock, fullscreen + copy)
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
              No sign-in required. The clock display, toggles, and Zen UI hiding
              run locally in your browser.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Uses your device’s local time
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The clock reflects your device time and detected time zone label.
              If your system time is wrong, the clock will match it.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is a browser feature
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen requires your browser’s permission. Press{" "}
              <span className="font-semibold text-slate-900">Esc</span> to exit
              at any time.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Copy stays on your device
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Copy writes a timestamp block to your clipboard so you can paste
              it elsewhere. Nothing needs to be sent to a server to do this.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Zen mode reduces distractions
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              When Zen is on, UI elements fade after a short idle period
              (especially in fullscreen). Move/tap/press a key to bring them
              back.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No account, no uploads
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page does not require an account and does not ask you to
              upload files or personal data to use the clock.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (shortcuts, ticking, fullscreen, copy)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional details about keyboard focus, update cadence, and
                clipboard behavior
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Keyboard focus + handling
              </div>
              <p className="mt-1 leading-relaxed">
                Shortcuts are captured on the clock card. If shortcuts do not
                fire, click the clock once to focus it. While you’re typing in
                an input, shortcuts are ignored to prevent accidental toggles.
              </p>
              <p className="mt-2 leading-relaxed">
                In fullscreen,{" "}
                <span className="font-semibold text-slate-900">Esc</span> exits
                immediately.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Update cadence (seconds on/off)
              </div>
              <p className="mt-1 leading-relaxed">
                With seconds enabled, the display updates every second, aligned
                to the next second boundary. With seconds disabled, the display
                updates less frequently for a calmer view while still staying
                accurate.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Fullscreen + clipboard behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser’s fullscreen API and may require a
                user interaction (click/keypress). Copy uses the clipboard API,
                with a safe fallback if clipboard permissions are restricted.
              </p>
              <p className="mt-2 leading-relaxed">
                The copied text includes the current displayed time, time zone
                label, optional date line (if enabled), and an ISO timestamp.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Related.</strong> Need multiple time
          zones side-by-side?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/world-clock"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              World Clock
            </Link>
          </span>
          . Need UTC?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/utc-clock"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              UTC Clock
            </Link>
          </span>
          . Want a timer instead?{" "}
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