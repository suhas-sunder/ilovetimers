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
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
          Click the converter card once, then use the shortcuts below. Shortcuts
          won’t trigger while you’re typing in an input, select, textarea, or
          editable field.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--ilt-border-subtle)] text-left">
                <th className="py-2 pr-4 font-semibold text-[var(--ilt-text-primary)]">Key</th>
                <th className="py-2 font-semibold text-[var(--ilt-text-primary)]">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={`${r.key}-${r.action}`}
                  className="border-b border-[var(--ilt-border-subtle)]"
                >
                  <td className="py-2 pr-4">
                    <kbd className="ilt-keycap px-2 py-1 font-mono text-xs text-[var(--ilt-text-primary)]">
                      {r.key}
                    </kbd>
                  </td>
                  <td className="py-2 text-[var(--ilt-text-secondary)]">{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
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
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Behavior and privacy
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Runs locally in your browser
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              No sign-in required. Conversion, validation, and copy all run in
              your browser.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Exact decimal conversion
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Conversions are done by shifting the decimal point (×1000 or
              ÷1000) to avoid floating-point rounding surprises.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Copy stays on your device
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Using Copy writes text to your clipboard so you can paste it
              elsewhere. Nothing needs to be sent to a server to do this.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Cleaned output for pasting
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Results are normalized by trimming unnecessary trailing zeros, so
              the value you copy looks clean and consistent.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              No account, no uploads
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This page does not require an account and does not ask you to
              upload files or personal data to convert values.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              No hidden formatting
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The converter won’t auto-round to a fixed number of decimals. What
              you see is the exact decimal shift result (with only cosmetic
              cleanup).
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (accepted input + conversion behavior)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional details about parsing, normalization, and edge cases
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Accepted numeric formats
              </div>
              <p className="mt-1 leading-relaxed">
                Signed decimals are accepted, including{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">-12</span>,{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">12.</span>,{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">.5</span>,{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">0.01667</span>,
                and <span className="font-semibold text-[var(--ilt-text-primary)]">+10.2</span>.
                Commas in pasted values are ignored (for example{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">1,500</span>).
              </p>
              <p className="mt-2 leading-relaxed">
                Inputs with letters or extra symbols won’t convert. Keep the
                value numeric (optionally with +, -, and a single decimal
                point).
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                How conversion is performed
              </div>
              <p className="mt-1 leading-relaxed">
                Milliseconds to seconds shifts the decimal point left by{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">3</span> places
                (÷1000). Seconds to milliseconds shifts it right by{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">3</span> places
                (×1000).
              </p>
              <p className="mt-2 leading-relaxed">
                Output is normalized by removing unnecessary trailing zeros (for
                example{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">1.500</span> →{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">1.5</span>) and
                cleaning leading zeros.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Copy behavior</div>
              <p className="mt-1 leading-relaxed">
                Copy writes a formatted conversion line to your clipboard (for
                example{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  1500 ms = 1.5 seconds
                </span>
                ). If your browser blocks clipboard access, the page attempts a
                safe fallback copy method.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
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

        <div className="mt-4 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Related.</strong> Need time math
          across units?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/time-calculator"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Time Calculator
            </Link>
          </span>
          . Timing something live?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/stopwatch"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Stopwatch
            </Link>
          </span>
          . Need more than one timer?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/multiple-timers"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
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
