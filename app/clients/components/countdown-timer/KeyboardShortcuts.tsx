const shortcuts = [
  { key: "Space", action: "Start or pause the countdown" },
  { key: "R", action: "Reset to the selected duration" },
  { key: "A", action: "Add one minute" },
  { key: "S", action: "Subtract ten seconds" },
  { key: "F", action: "Toggle fullscreen" },
  { key: "Esc", action: "Exit fullscreen" },
];

export default function KeyboardShortcuts() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
          Click or tab into the timer first, then use these shortcuts without
          moving focus away from the display.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="ilt-surface-muted flex items-center justify-between gap-3 p-3 text-sm"
            >
              <kbd className="ilt-keycap px-2 py-1 font-mono text-xs font-semibold text-[var(--ilt-text-primary)]">
                {shortcut.key}
              </kbd>
              <span className="text-right text-[var(--ilt-text-secondary)]">
                {shortcut.action}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
