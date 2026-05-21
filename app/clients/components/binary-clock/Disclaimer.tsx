export default function Disclaimer() {
  const preview =
    "BCD + pure binary • Optional seconds • 12/24-hour • Copy friendly • Fullscreen + shortcuts";

  return (
    <section className="space-y-4">
      <div className="ilt-surface-card p-5">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                How this page helps
              </h2>
              <p className="mt-1 text-sm font-medium text-[var(--ilt-text-muted)]">
                {preview}
              </p>
            </div>

            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                See the current time in binary.
              </strong>{" "}
              The clock updates exactly on the next second boundary, so seconds
              and minutes flip cleanly with no “drift” feel.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Pick the binary style that matches your goal.
              </strong>{" "}
              Use <span className="font-semibold text-[var(--ilt-text-primary)]">BCD</span> to
              see each decimal digit as 4 bits, or{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Pure</span> binary
              to see hours, minutes, and seconds as real binary numbers.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Toggle seconds and 12/24-hour instantly.
              </strong>{" "}
              Hide seconds for a calmer display, or show them for a true “live”
              clock. Switch between 12-hour and 24-hour time without changing
              the underlying local time.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Fullscreen for a clean wall display.
              </strong>{" "}
              Go fullscreen for presentations, streams, or desk displays.
              Controls stay accessible, and{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> exits
              quickly.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Copy the current moment.
              </strong>{" "}
              Copy grabs a compact snapshot including your formatted time, date,
              timezone label, and the binary representation so you can paste it
              into notes or messages.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Keyboard shortcuts (fast control).
              </strong>{" "}
              Click the card once, then use{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
              fullscreen,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">C</span> copy,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">S</span> seconds
              on/off, <span className="font-semibold text-[var(--ilt-text-primary)]">B</span>{" "}
              mode, <span className="font-semibold text-[var(--ilt-text-primary)]">1</span>{" "}
              (12h), <span className="font-semibold text-[var(--ilt-text-primary)]">2</span>{" "}
              (24h), <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>{" "}
              exit.
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Best-fit uses
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Quick “what time is it?”
                  </strong>{" "}
                  Keep seconds off and use BCD for a readable binary-style
                  clock.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Binary snapshot sharing
                  </strong>{" "}
                  Turn seconds on, choose your mode, then hit Copy to paste the
                  moment anywhere.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Wall / stream display
                  </strong>{" "}
                  Use Fullscreen and 24-hour time for a clean, unambiguous
                  display.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Prefer a standard display?{" "}
                  <a
                    href="/digital-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Digital Clock
                  </a>{" "}
                  and{" "}
                  <a
                    href="/analog-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Analog Clock
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a time reference?{" "}
                  <a
                    href="/utc-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    UTC Clock
                  </a>{" "}
                  or{" "}
                  <a
                    href="/world-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    World Clock
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want another “encoded” clock?{" "}
                  <a
                    href="/hexadecimal-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Hexadecimal Clock
                  </a>{" "}
                  or{" "}
                  <a
                    href="/morse-code-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Morse Code Clock
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Just want the plain current time line?{" "}
                  <a
                    href="/current-local-time"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Current Local Time
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 ilt-surface-card p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-[var(--ilt-text-primary)] ilt-focus-ring">
                <span>Technical details</span>
                <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-2">
                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Modes
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-[var(--ilt-text-primary)]">BCD</span>{" "}
                    displays each decimal digit as{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">4 bits</span>{" "}
                    (00–09 per digit).{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Pure</span>{" "}
                    displays hours/minutes/seconds as binary numbers (bit-width
                    sized for the field).
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Bit widths
                  </div>
                  <p className="mt-2">
                    In pure mode, minutes and seconds use{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">6 bits</span>{" "}
                    (0–59). Hours use{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">5 bits</span>{" "}
                    in 24-hour mode (0–23) and{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">4 bits</span>{" "}
                    in 12-hour mode (1–12).
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Update timing
                  </div>
                  <p className="mt-2">
                    The display schedules updates aligned to the next
                    whole-second boundary. Even if seconds are hidden, it still
                    updates on second boundaries so minute changes land cleanly.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Time source + timezone
                  </div>
                  <p className="mt-2">
                    Time is shown using your device’s local clock and locale
                    formatting. The timezone label is read from the browser’s
                    Intl timezone when available.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Copy format
                  </div>
                  <p className="mt-2">
                    Copy includes: formatted time, timezone label, formatted
                    date line, a binary line (mode-dependent), and an ISO
                    timestamp as a UTC reference.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Fullscreen uses the browser Fullscreen API on the clock
                    card. Press{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> to
                    exit, or use the Exit control.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Heads up.</strong> This clock
            shows{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">
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
