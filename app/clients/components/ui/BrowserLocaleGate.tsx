import { useEffect, useState } from "react";
import type { ReactNode } from "react";

/**
 * Static prerendering cannot know the visitor's locale or system time zone.
 * Keep server HTML and the browser's first hydration frame identical, then
 * mount the genuine locale-aware clock without a React hydration rebuild.
 *
 * Use only around live date/time controls that depend on the browser locale.
 * Stable descriptions, metadata and SEO content remain server-rendered.
 */
export default function BrowserLocaleGate({
  children,
  label = "Local time",
}: {
  children: ReactNode;
  label?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (mounted) return <>{children}</>;

  return (
    <div
      className="ilt-tool-frame flex min-h-[clamp(12rem,24svh,19rem)] w-full flex-col items-center justify-center gap-2 px-4 text-center"
      data-browser-locale-placeholder
      aria-busy="true"
    >
      <span className="text-sm font-semibold text-[var(--ilt-text-muted)]">
        {label}
      </span>
      <span className="text-lg font-semibold text-[var(--ilt-text-secondary)]">
        Loading your clock…
      </span>
      <button
        type="button"
        disabled
        className="mt-2 min-h-11 rounded-[var(--ilt-radius-control)] bg-[var(--ilt-button-secondary-bg)] px-4 text-sm text-[var(--ilt-text-muted)] opacity-60"
      >
        Controls loading
      </button>
    </div>
  );
}
