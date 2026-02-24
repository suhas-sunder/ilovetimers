export default function KeyboardShortcuts() {
  // Current Local Time supports: F (fullscreen), C (copy), S (seconds),
  // 1 (12-hour), 2 (24-hour), Esc (exit fullscreen)
  const rows = [
    { key: "F", action: "Toggle fullscreen" },
    { key: "C", action: "Copy current time + date" },
    { key: "S", action: "Toggle seconds" },
    { key: "1", action: "Switch to 12-hour time" },
    { key: "2", action: "Switch to 24-hour time" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-slate-700">
          Click the clock card once, then use the keyboard to control the time
          display. Shortcuts won’t trigger while you’re typing in an input,
          select, textarea, or editable field.
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
          Tip: if shortcuts do nothing, the clock card probably isn’t focused.
          Click the clock once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   4) TRUST + HONESTY (clock source, fullscreen, copy)
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
              No sign-in required. The clock runs on your device and reads the
              current time from your browser/device settings.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Local time comes from your device settings
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              “Local” time is based on your device’s clock and timezone. If your
              device time, timezone, or daylight-saving setting is wrong, the
              displayed local time will be wrong too.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Time zones are browser-formatted
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              City comparisons (like Toronto, New York, or London) are formatted
              using your browser’s timezone database. If your browser is very
              old, a zone label or formatting may vary.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is display-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen makes the digits large and adds top/bottom controls.
              Exit with{" "}
              <span className="font-semibold text-slate-900">Esc</span> or the
              Exit button. In fullscreen, you can also tap/click the time area
              to copy.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Copy uses your clipboard
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Copy writes a formatted timestamp to your clipboard (time, zone
              label, date, and ISO week number). Some browsers restrict
              clipboard access in certain contexts. If copy fails, click the
              page once and try again.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No GPS, no account
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page does not request your precise location. It does not
              require sign-in. The display is based on your browser/device time
              and timezone settings.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (time formatting + zones + fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                How time is formatted, why zones can vary, and permission notes
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Formatting engine
              </div>
              <p className="mt-1 leading-relaxed">
                The clock uses{" "}
                <span className="font-semibold text-slate-900">
                  Intl.DateTimeFormat
                </span>{" "}
                for 12/24-hour formatting and optional seconds. Some locales
                include special direction marks; these are stripped for cleaner
                display.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Time zones</div>
              <p className="mt-1 leading-relaxed">
                City times are rendered by formatting the same{" "}
                <span className="font-semibold text-slate-900">Date</span>{" "}
                instance with a{" "}
                <span className="font-semibold text-slate-900">timeZone</span>{" "}
                option (for example{" "}
                <span className="font-semibold text-slate-900">
                  America/Toronto
                </span>
                ). The underlying timezone database comes from your browser/OS,
                so very old devices can differ.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Copy string content
              </div>
              <p className="mt-1 leading-relaxed">
                Copy output includes: visible time, a zone label (your local
                timezone name when available, otherwise the selected city
                label), a full date line, and the ISO week number.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen + clipboard permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API and updates state on{" "}
                <span className="font-semibold text-slate-900">
                  fullscreenchange
                </span>
                . Clipboard access can be restricted by browser policy; it is
                most reliable after a user gesture (click/tap).
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Note.</strong> If you need a
          “correct” reference time independent of your device settings, use{" "}
          <strong className="text-slate-900">UTC Clock</strong> for a dedicated
          UTC display or a network-synced reference like an atomic time source.
          This page is designed to show what your device considers “local time.”
        </div>
      </div>
    </section>
  );
}
