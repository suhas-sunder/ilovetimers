export default function Disclaimer() {
  const preview =
    "Sound can be blocked • Background tabs can throttle updates • No notifications • Fullscreen restrictions";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
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
                Sound depends on your device.
              </strong>{" "}
              Some browsers, especially on mobile, block audio until you
              interact with the page or have sound muted at the system level.
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Background tabs are throttled.
              </strong>{" "}
              Browsers pause or slow visual updates when a tab is in the
              background or the screen is locked. Timers keep correct time and
              update when you return.
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                No notifications or alarms.
              </strong>{" "}
              Timers run only while this page is open. There are no push
              notifications or system alarms.
            </li>

            <li className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Fullscreen has browser limits.
              </strong>{" "}
              Fullscreen mode requires user interaction and may be restricted by
              browser or device policies.
            </li>
          </ul>
        </details>
      </div>
    </section>
  );
}
