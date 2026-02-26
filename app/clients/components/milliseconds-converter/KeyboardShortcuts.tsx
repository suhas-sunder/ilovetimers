import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (MILLISECONDS CONVERTER)
========================================================= */
export default function KeyboardShortcuts() {
  // Milliseconds Converter supports:
  // R (reset), C (copy current conversion)
  const rows = [
    { key: "R", action: "Reset to defaults (1000 ms ↔ 1 s)" },
    { key: "C", action: "Copy the current conversion line" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-slate-700">
          Click the converter card once, then use the shortcuts below. Shortcuts
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
          Tip: if shortcuts do nothing, the converter card probably isn’t
          focused. Click the card once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (local-only, exact conversion)
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
              No sign-in required. Conversion, validation, and copy all run in
              your browser.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Exact decimal conversion
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Conversions are done by shifting the decimal point (×1000 or
              ÷1000) to avoid floating-point rounding surprises.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Copy stays on your device
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Using Copy writes text to your clipboard so you can paste it
              elsewhere. Nothing needs to be sent to a server to do this.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Cleaned output for pasting
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Results are normalized by trimming unnecessary trailing zeros, so
              the value you copy looks clean and consistent.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No account, no uploads
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page does not require an account and does not ask you to
              upload files or personal data to convert values.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No hidden formatting
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The converter won’t auto-round to a fixed number of decimals. What
              you see is the exact decimal shift result (with only cosmetic
              cleanup).
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (accepted input + conversion behavior)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional details about parsing, normalization, and edge cases
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Accepted numeric formats
              </div>
              <p className="mt-1 leading-relaxed">
                Signed decimals are accepted, including{" "}
                <span className="font-semibold text-slate-900">-12</span>,{" "}
                <span className="font-semibold text-slate-900">12.</span>,{" "}
                <span className="font-semibold text-slate-900">.5</span>,{" "}
                <span className="font-semibold text-slate-900">0.01667</span>,
                and <span className="font-semibold text-slate-900">+10.2</span>.
                Commas in pasted values are ignored (for example{" "}
                <span className="font-semibold text-slate-900">1,500</span>).
              </p>
              <p className="mt-2 leading-relaxed">
                Inputs with letters or extra symbols won’t convert. Keep the
                value numeric (optionally with +, -, and a single decimal
                point).
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                How conversion is performed
              </div>
              <p className="mt-1 leading-relaxed">
                Milliseconds to seconds shifts the decimal point left by{" "}
                <span className="font-semibold text-slate-900">3</span> places
                (÷1000). Seconds to milliseconds shifts it right by{" "}
                <span className="font-semibold text-slate-900">3</span> places
                (×1000).
              </p>
              <p className="mt-2 leading-relaxed">
                Output is normalized by removing unnecessary trailing zeros (for
                example{" "}
                <span className="font-semibold text-slate-900">1.500</span> →{" "}
                <span className="font-semibold text-slate-900">1.5</span>) and
                cleaning leading zeros.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">Copy behavior</div>
              <p className="mt-1 leading-relaxed">
                Copy writes a formatted conversion line to your clipboard (for
                example{" "}
                <span className="font-semibold text-slate-900">
                  1500 ms = 1.5 seconds
                </span>
                ). If your browser blocks clipboard access, the page attempts a
                safe fallback copy method.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Focus + keyboard handling
              </div>
              <p className="mt-1 leading-relaxed">
                Keyboard shortcuts are captured on the converter card. If
                shortcuts do not fire, click the card once to focus it. While
                you’re typing in an input, shortcuts are ignored to prevent
                accidental actions.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Related.</strong> Need time math
          across units?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/time-calculator"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Time Calculator
            </Link>
          </span>
          . Timing something live?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/stopwatch"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Stopwatch
            </Link>
          </span>
          . Need more than one timer?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/multiple-timers"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Multiple Timers
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
