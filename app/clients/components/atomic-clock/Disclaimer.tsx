export default function Disclaimer() {
  const preview =
    "Milliseconds are from your device clock • Freeze/resume • Fullscreen works with a click • Background tabs can throttle";

  return (
    <section className="space-y-4">
      <div className="ilt-surface-card p-5">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Limits & notes
              </h2>
              <p className="mt-1 text-sm font-medium text-[var(--ilt-text-muted)]">
                {preview}
              </p>
            </div>

            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <ul className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                This shows your device time.
              </strong>{" "}
              The clock uses your browser/device time (not a network-synced time
              source). If your system clock is off, the display will be off too.
              For a plain readout without milliseconds, try{" "}
              <a
                href="/current-local-time"
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
              >
                Current Local Time
              </a>{" "}
              or{" "}
              <a
                href="/digital-clock"
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
              >
                Digital Clock
              </a>
              .
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                “Atomic-style” is a display format.
              </strong>{" "}
              You get a big, high-contrast, millisecond readout that updates
              smoothly. It’s ideal for presentations, recording, quick timing
              checks, or syncing cues, but it is not a certified atomic time
              service.
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Freeze/resume is intentional.
              </strong>{" "}
              Use <span className="font-semibold text-[var(--ilt-text-primary)]">Freeze</span>{" "}
              to hold the current displayed time on screen, then{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Resume</span> to go
              live again. Shortcut:{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span>.
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Milliseconds can be toggled.
              </strong>{" "}
              Turn milliseconds on when you want the device clock's
              millisecond field, or turn them off for a steadier seconds-only
              readout. Shortcut:{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">M</span>. If you
              need conversions, use{" "}
              <a
                href="/milliseconds-converter"
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
              >
                Milliseconds Converter
              </a>
              .
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Fullscreen requires a user action.
              </strong>{" "}
              Browsers only allow fullscreen after a click or tap. Shortcut:{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>. Press{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> to exit.
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Background tabs can throttle updates.
              </strong>{" "}
              When the tab is not visible, browsers may reduce animation and
              timer frequency. The time remains correct, but the milliseconds
              display may look less smooth when you return.
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Time zones are not changed here.
              </strong>{" "}
              This page shows your device’s local time. If you need UTC or
              another zone, use{" "}
              <a
                href="/utc-clock"
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
              >
                UTC Clock
              </a>
              ,{" "}
              <a
                href="/world-clock"
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
              >
                World Clock
              </a>
              , or{" "}
              <a
                href="/time-zone-converter"
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
              >
                Time Zone Converter
              </a>
              .
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Prefer a dedicated timer tool?
              </strong>{" "}
              For timing tasks (not just viewing time), try{" "}
              <a
                href="/online-timer"
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
              >
                Fullscreen Timer
              </a>{" "}
              or{" "}
              <a
                href="/stopwatch"
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
              >
                Stopwatch
              </a>
              .
            </li>
          </ul>

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
                    Time source
                  </div>
                  <p className="mt-2">
                    Displayed time comes from <code>Date</code> in the browser,
                    which reflects your device clock. This page does not request
                    network time or NTP synchronization.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Milliseconds mode
                  </div>
                  <p className="mt-2">
                    With milliseconds enabled, the display updates on animation
                    frames (<code>requestAnimationFrame</code>) for smooth
                    changes, and reads the current millisecond value each frame.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Seconds-only mode
                  </div>
                  <p className="mt-2">
                    With milliseconds off, updates snap to the next second
                    boundary, then tick once per second for a stable readout.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Fullscreen is controlled via the Fullscreen API. Browsers
                    require a user gesture (click/tap/keypress) to enter
                    fullscreen, and <code>Esc</code> exits.
                  </p>
                </div>
              </div>
            </details>
          </div>
        </details>
      </div>
    </section>
  );
}
