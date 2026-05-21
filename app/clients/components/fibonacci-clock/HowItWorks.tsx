import React from "react";
import { Link } from "react-router";

export function JsonLd({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/fibonacci-clock",
}: {
  canonicalUrl?: string;
  baseUrl?: string;
}) {
  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use the Fibonacci Clock",
    description:
      "Read time through Fibonacci-sized squares, switch time zones, explore manual times, copy the tile breakdown, and use fullscreen.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Read the digital time first",
        text: "The page shows the exact digital time and the Fibonacci HH:MM version. Minutes are represented in 5-minute steps.",
      },
      {
        "@type": "HowToStep",
        name: "Use the Fibonacci tiles",
        text: "Tiles sized 1, 1, 2, 3, and 5 combine to represent the hour and rounded minutes. The legend explains hour-only, minute-only, and shared tiles.",
      },
      {
        "@type": "HowToStep",
        name: "Switch Live or Explore mode",
        text: "Live follows the selected time zone. Explore lets you type an hour and minute to see how that moment maps to the tiles.",
      },
      {
        "@type": "HowToStep",
        name: "Copy or go fullscreen",
        text: "Copy outputs the Fibonacci time, exact digital time, rounding note, and tile sums. Fullscreen keeps the visual clock large.",
      },
    ],
  };

  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="ilt-keycap px-2 py-1 font-mono text-[11px] font-semibold text-[var(--ilt-text-primary)]">
      {children}
    </kbd>
  );

  const PillLink = ({
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => (
    <Link
      to={to}
      className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
    >
      {children} -&gt;
    </Link>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <JsonLd data={howToLd} />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
              How this clock works
            </h2>
            <p className="mt-2 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              Fibonacci Clock shows the time using five tiles sized 1, 1, 2, 3,
              and 5. The tiles combine to represent the hour and the minutes,
              with minutes rounded to the nearest 5-minute step. The normal
              digital time remains visible so you can compare the visual
              pattern against the exact time.
            </p>
            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              Live mode follows your selected time zone. Explore mode lets you
              enter a manual hour and minute so you can study how a specific
              time maps onto the tiles. Copy gives you the Fibonacci time, exact
              digital time, rounding note, and tile sums.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fibonacci tiles
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Time zones
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Explore mode
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Copy
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Reading the display
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>The digital time shows the exact selected-zone time.</li>
              <li>
                Fibonacci time uses HH:MM where minutes are in 5-minute steps.
              </li>
              <li>
                Tile colors show whether a tile contributes to hours, minutes,
                both, or neither.
              </li>
              <li>
                The rounding note explains when minutes round up or carry the
                hour forward.
              </li>
            </ul>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Shortcuts
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Use <Kbd>F</Kbd> for fullscreen, <Kbd>C</Kbd> to copy,{" "}
              <Kbd>L</Kbd> for Live, <Kbd>E</Kbd> for Explore, and{" "}
              <Kbd>Esc</Kbd> to exit fullscreen. Click the clock first if
              shortcuts do not fire.
            </p>
          </div>
        </div>

        <div className="mt-7 ilt-surface-card p-5">
          <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
            Related clocks
          </div>
          <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
            Use Fibonacci Clock for a visual puzzle-style time display. Use
            these pages for more direct time reading or conversion.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/digital-clock">Digital Clock</PillLink>
            <PillLink to="/world-clock">World Clock</PillLink>
            <PillLink to="/time-zone-converter">Time Zone Converter</PillLink>
            <PillLink to="/binary-clock">Binary Clock</PillLink>
          </div>
        </div>
      </div>
    </section>
  );
}
