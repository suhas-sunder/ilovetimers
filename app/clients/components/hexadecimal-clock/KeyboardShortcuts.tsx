import { Link } from "react-router";

export default function KeyboardShortcuts() {
  // Hexadecimal Clock supports:
  // F (toggle fullscreen), C (copy), S (toggle seconds), M (toggle ms - time mode only),
  // X (toggle mode), 1 (12h), 2 (24h), Esc (exit fullscreen)
  const rows = [
    { key: "F", action: "Toggle fullscreen" },
    { key: "C", action: "Copy (hex + decimal + date + ISO)" },
    { key: "S", action: "Toggle seconds" },
    { key: "M", action: "Toggle milliseconds (Hex HH:MM:SS mode only)" },
    { key: "X", action: "Toggle mode (Hex time ↔ Hex color)" },
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
          Click the clock card once, then use the keyboard shortcuts below.
          Shortcuts won’t trigger while you’re typing in an input, select,
          textarea, or editable field.
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
          Click the card once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (time zone, accuracy, fullscreen, copy, local-only)
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
              No sign-in required. The clock display, mode toggles, fullscreen,
              and copy behavior run in your browser.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Time zone comes from your device
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The “Local time” label reflects your device time zone. If you need
              another region’s time, use a converter after you copy the ISO
              timestamp.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              ISO timestamp included for clarity
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The copy block includes an ISO timestamp in UTC so you can share a
              precise moment without ambiguity.
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
              Precision depends on settings
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              If seconds are off, the display intentionally updates less often
              and milliseconds are disabled to avoid implying precision that
              isn’t shown.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Clipboard permission may apply
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Copy uses your browser’s clipboard API. If copy fails, your
              browser may be blocking clipboard access or the page may not be in
              a secure context.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (formats, refresh, copy, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional details about how the page behaves
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Hex time ranges
              </div>
              <p className="mt-1 leading-relaxed">
                In 24-hour mode, hours run{" "}
                <span className="font-semibold text-slate-900">00–17</span>{" "}
                (0–23). Minutes and seconds run{" "}
                <span className="font-semibold text-slate-900">00–3B</span>{" "}
                (0–59). All values are shown as uppercase hex with fixed widths.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                12-hour hex behavior
              </div>
              <p className="mt-1 leading-relaxed">
                In 12-hour mode, the hour is converted to{" "}
                <span className="font-semibold text-slate-900">1–12</span> and
                then encoded as hex{" "}
                <span className="font-semibold text-slate-900">(01–0C)</span>{" "}
                with an AM/PM suffix.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Refresh rate</div>
              <p className="mt-1 leading-relaxed">
                The page updates more often when milliseconds are on. With
                seconds on, it updates several times per second. With seconds
                off, it updates much less frequently to reduce CPU usage.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Hex color mode</div>
              <p className="mt-1 leading-relaxed">
                Color mode shows{" "}
                <span className="font-semibold text-slate-900">#RRGGBB</span>{" "}
                where <span className="font-semibold text-slate-900">RR</span>
                =hours (24h),{" "}
                <span className="font-semibold text-slate-900">GG</span>
                =minutes, and{" "}
                <span className="font-semibold text-slate-900">BB</span>
                =seconds. If seconds are hidden,{" "}
                <span className="font-semibold text-slate-900">BB</span> becomes{" "}
                <span className="font-semibold text-slate-900">00</span>.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Copy payload (what gets copied)
              </div>
              <p className="mt-1 leading-relaxed">
                Copy includes the hex output, decimal time with the resolved
                time zone label, the formatted date, and an ISO timestamp (UTC).
                This is intentionally “over-complete” so pastes are useful in
                chat, tickets, and notes without extra context.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Related.</strong> Want a different
          encoding?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/binary-clock"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Binary Clock
            </Link>
          </span>{" "}
          or{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/morse-code-clock"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Morse Code Clock
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
          .
        </div>
      </div>
    </section>
  );
}
