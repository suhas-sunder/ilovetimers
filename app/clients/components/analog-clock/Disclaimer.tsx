export default function Disclaimer() {
  const preview =
    "Fullscreen requires a gesture • Background tabs can throttle • Smooth seconds uses more CPU • Timezone is device-based";

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
                Fullscreen requires a user action.
              </strong>{" "}
              Browsers only allow fullscreen after a click/tap. If fullscreen
              doesn’t open, click the clock area and try again. Use Esc to exit.
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Background tabs can throttle updates.
              </strong>{" "}
              When the tab is not visible, browsers may reduce animation and
              timer frequency. The time stays correct, but the seconds hand may
              look less smooth when you return.
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Smooth seconds uses more CPU.
              </strong>{" "}
              Smooth mode updates continuously for a fluid seconds hand. If you
              want lower power usage (or you’re projecting on an older device),
              turn off Smooth or hide the seconds hand.
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Timezone is device-based.
              </strong>{" "}
              This clock shows your device’s local time and timezone settings.
              If it looks wrong, check your OS timezone and “Set time
              automatically.”
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Clock accuracy depends on the device.
              </strong>{" "}
              Most systems stay accurate, but if your device clock drifts, this
              page will reflect that drift. For a reference time source, use the{" "}
              <a
                href="/atomic-clock"
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
              >
                Atomic Clock
              </a>
              .
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Keyboard shortcuts need focus.
              </strong>{" "}
              Click the clock card once so shortcuts work: F fullscreen • S
              seconds hand • M smooth.
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Screen recording and mirroring can add lag.
              </strong>{" "}
              If you’re casting or recording, animations may look slightly less
              smooth due to capture overhead. Try disabling Smooth.
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Prefer a different style?
              </strong>{" "}
              If you want a simpler display, try the{" "}
              <a
                href="/minimalist-clock"
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
              >
                Minimalist Clock
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
          </ul>
        </details>
      </div>
    </section>
  );
}
