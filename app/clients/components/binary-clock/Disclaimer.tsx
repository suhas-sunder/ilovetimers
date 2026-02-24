export default function Disclaimer() {
  const preview =
    "BCD + pure binary • Optional seconds • 12/24-hour • Copy friendly • Fullscreen + shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                How this page helps
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {preview}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                See the current time in binary.
              </strong>{" "}
              The clock updates exactly on the next second boundary, so seconds
              and minutes flip cleanly with no “drift” feel.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Pick the binary style that matches your goal.
              </strong>{" "}
              Use <span className="font-semibold text-slate-900">BCD</span> to
              see each decimal digit as 4 bits, or{" "}
              <span className="font-semibold text-slate-900">Pure</span> binary
              to see hours, minutes, and seconds as real binary numbers.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Toggle seconds and 12/24-hour instantly.
              </strong>{" "}
              Hide seconds for a calmer display, or show them for a true “live”
              clock. Switch between 12-hour and 24-hour time without changing
              the underlying local time.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Fullscreen for a clean wall display.
              </strong>{" "}
              Go fullscreen for presentations, streams, or desk displays.
              Controls stay accessible, and{" "}
              <span className="font-semibold text-slate-900">Esc</span> exits
              quickly.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Copy the current moment.
              </strong>{" "}
              Copy grabs a compact snapshot including your formatted time, date,
              timezone label, and the binary representation so you can paste it
              into notes or messages.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Keyboard shortcuts (fast control).
              </strong>{" "}
              Click the card once, then use{" "}
              <span className="font-semibold text-slate-900">F</span>{" "}
              fullscreen,{" "}
              <span className="font-semibold text-slate-900">C</span> copy,{" "}
              <span className="font-semibold text-slate-900">S</span> seconds
              on/off, <span className="font-semibold text-slate-900">B</span>{" "}
              mode, <span className="font-semibold text-slate-900">1</span>{" "}
              (12h), <span className="font-semibold text-slate-900">2</span>{" "}
              (24h), <span className="font-semibold text-slate-900">Esc</span>{" "}
              exit.
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Best-fit uses
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Quick “what time is it?”
                  </strong>{" "}
                  Keep seconds off and use BCD for a readable binary-style
                  clock.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Binary snapshot sharing
                  </strong>{" "}
                  Turn seconds on, choose your mode, then hit Copy to paste the
                  moment anywhere.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Wall / stream display
                  </strong>{" "}
                  Use Fullscreen and 24-hour time for a clean, unambiguous
                  display.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer a standard display?{" "}
                  <a
                    href="/digital-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Digital Clock
                  </a>{" "}
                  and{" "}
                  <a
                    href="/analog-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Analog Clock
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a time reference?{" "}
                  <a
                    href="/utc-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    UTC Clock
                  </a>{" "}
                  or{" "}
                  <a
                    href="/world-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    World Clock
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want another “encoded” clock?{" "}
                  <a
                    href="/hexadecimal-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Hexadecimal Clock
                  </a>{" "}
                  or{" "}
                  <a
                    href="/morse-code-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Morse Code Clock
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Just want the plain current time line?{" "}
                  <a
                    href="/current-local-time"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Current Local Time
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
                <span>Technical details</span>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Modes
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-900">BCD</span>{" "}
                    displays each decimal digit as{" "}
                    <span className="font-semibold text-slate-900">4 bits</span>{" "}
                    (00–09 per digit).{" "}
                    <span className="font-semibold text-slate-900">Pure</span>{" "}
                    displays hours/minutes/seconds as binary numbers (bit-width
                    sized for the field).
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Bit widths
                  </div>
                  <p className="mt-2">
                    In pure mode, minutes and seconds use{" "}
                    <span className="font-semibold text-slate-900">6 bits</span>{" "}
                    (0–59). Hours use{" "}
                    <span className="font-semibold text-slate-900">5 bits</span>{" "}
                    in 24-hour mode (0–23) and{" "}
                    <span className="font-semibold text-slate-900">4 bits</span>{" "}
                    in 12-hour mode (1–12).
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Update timing
                  </div>
                  <p className="mt-2">
                    The display schedules updates aligned to the next
                    whole-second boundary. Even if seconds are hidden, it still
                    updates on second boundaries so minute changes land cleanly.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Time source + timezone
                  </div>
                  <p className="mt-2">
                    Time is shown using your device’s local clock and locale
                    formatting. The timezone label is read from the browser’s
                    Intl timezone when available.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Copy format
                  </div>
                  <p className="mt-2">
                    Copy includes: formatted time, timezone label, formatted
                    date line, a binary line (mode-dependent), and an ISO
                    timestamp for exact reference.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Fullscreen uses the browser Fullscreen API on the clock
                    card. Press{" "}
                    <span className="font-semibold text-slate-900">Esc</span> to
                    exit, or use the Exit control.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Heads up.</strong> This clock
            shows{" "}
            <span className="font-semibold text-slate-900">
              your device’s local time
            </span>
            . If your system clock is off, the binary display will be off by the
            same amount.
          </div>
        </details>
      </div>
    </section>
  );
}
