export default function Disclaimer() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Countdown timer notes
              </h2>
              <p className="mt-1 text-sm font-medium text-[var(--ilt-text-muted)]">
                Browser timing, fullscreen behavior, and audio limits to keep in mind.
              </p>
            </div>

            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              v
            </span>
          </summary>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Keep the tab open.</strong>{" "}
              This countdown runs in your browser. If the tab is closed, the page
              cannot keep timing or alert you at zero.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Sound depends on the browser.</strong>{" "}
              Some browsers block audio until you interact with the page. Start
              the timer once with the tab active if an end alert matters.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen is optional.</strong>{" "}
              Fullscreen uses the browser Fullscreen API and may require a direct
              click or tap before it can open.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Use device alarms for critical needs.</strong>{" "}
              For wake-ups, medication, safety, or anything that must ring even
              if the browser closes, use your device alarm instead.
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
