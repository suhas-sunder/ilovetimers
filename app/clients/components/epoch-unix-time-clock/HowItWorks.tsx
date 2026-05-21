import React from "react";
import { Link } from "react-router";

/* ---------- Small helper: JSON-LD script ---------- */
export function JsonLd({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* =========================================================
   1) HOW IT WORKS (trust + SEO + user intent)
   Notes:
   - Unix time intent: show current epoch in seconds and milliseconds,
     copy fast, live/freeze/snap, local + UTC display, fullscreen, shortcuts.
   - Tool-focused, not an educational blog.
   - Scenario-based with concrete numbers users will see here.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/epoch-unix-time-clock",
  baseUrl = "https://www.ilovetimers.com",
}: {
  canonicalUrl?: string;
  baseUrl?: string;
}) {
  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use the Unix Time Clock (current epoch timestamp)",
    description:
      "Get the current Unix epoch timestamp in seconds and milliseconds. Copy instantly, freeze to hold a stable value, snap once while frozen, and use fullscreen for a clean seconds display with keyboard shortcuts.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Read the current timestamp",
        text: "The large number is Unix time in seconds. Milliseconds is shown below. Local time and UTC time are shown for human-readable verification.",
      },
      {
        "@type": "HowToStep",
        name: "Freeze for a stable value",
        text: "Toggle Live off to freeze the clock so the number does not change while you copy or compare.",
      },
      {
        "@type": "HowToStep",
        name: "Copy seconds or milliseconds",
        text: "Use Copy seconds or Copy milliseconds (or shortcuts C and M) to copy exactly what you need.",
      },
      {
        "@type": "HowToStep",
        name: "Snap once while frozen",
        text: "When frozen, use Snap (or shortcut N) to update to the current time once without returning to continuous updates.",
      },
      {
        "@type": "HowToStep",
        name: "Fullscreen and shortcuts",
        text: "Use Fullscreen (or shortcut F) for a large seconds display. Space toggles Live/Frozen, C copies seconds, M copies milliseconds, N snaps now, and Esc exits fullscreen.",
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
      {children} →
    </Link>
  );

  const ExampleBlock = ({
    title,
    subtitle,
    lines,
  }: {
    title: string;
    subtitle?: string;
    lines: string[];
  }) => (
    <div className="ilt-surface-card p-5">
      <div className="text-base font-semibold text-[var(--ilt-text-primary)]">{title}</div>
      {subtitle ? (
        <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">{subtitle}</div>
      ) : null}
      <div className="mt-3 ilt-surface-muted p-4">
        <div className="whitespace-pre-wrap font-mono text-xs text-[var(--ilt-text-secondary)]">
          {lines.join("\n")}
        </div>
      </div>
    </div>
  );

  return (
    <section className="space-y-4">
      <JsonLd data={howToLd} />

      <div className="ilt-surface-card p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>

            <p className="mt-2 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Unix Time Clock
              </span>{" "}
              is built for the moment you need a correct “now” timestamp fast.
              The big number is the current Unix epoch time in{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">seconds</span>. The
              page also shows the same moment in{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">milliseconds</span>
              , plus a local and UTC date-time so you can sanity-check what that
              timestamp actually represents.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              This page is not a tutorial about time systems. It is a practical
              utility: copy seconds or milliseconds, freeze the display so it
              does not change while you work, snap once when you need a fresh
              value, and go fullscreen when you want the seconds value to be
              readable on a shared screen.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              Key behavior to understand: the clock reads from your device time.
              If your device clock is off, the epoch value will be off too. For
              normal workflows like logs, debugging, and test payloads, this is
              exactly what you want: it matches what your browser and many
              client-side apps consider “now.”
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Seconds
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Milliseconds
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Copy
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Live/Frozen
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Snap
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fullscreen
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Shortcuts
            </span>
          </div>
        </div>

        {/* Quick flow */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Quick use (what most people do)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Read
                the big number: that is Unix time in{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">seconds</span>.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> If you
                need a stable value, toggle{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Live</span> off
                (or press <Kbd>Space</Kbd>) to freeze it.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Click{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Copy seconds
                </span>{" "}
                or{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Copy milliseconds
                </span>{" "}
                (or press <Kbd>C</Kbd> / <Kbd>M</Kbd>).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> If you
                are frozen and need a fresh “now” without going back to live,
                use <span className="font-semibold text-[var(--ilt-text-primary)]">Snap</span>{" "}
                (or <Kbd>N</Kbd>).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> For a
                big display, press <Kbd>F</Kbd> for fullscreen. Press{" "}
                <Kbd>Esc</Kbd> to exit.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Seconds vs milliseconds, in plain terms
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Seconds is typically a{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">10-digit</span>{" "}
                number (for current years). Milliseconds is typically a{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">13-digit</span>{" "}
                number. Many errors come from pasting a 13-digit value into a
                system expecting seconds, or vice versa. This page shows both so
                you can copy the right one without guessing.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Checklist for a clean copy
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                If you are copying into a form, freeze first so the value does
                not change between click and paste.
              </li>
              <li>
                If copy does nothing, your browser may be blocking clipboard
                access in that context. Try clicking the copy button again or
                use the keyboard shortcuts.
              </li>
              <li>
                Use local and UTC lines as a fast sanity check when debugging
                timezone issues.
              </li>
              <li>
                If shortcuts do nothing, click the clock card once to focus it.
                Shortcuts do not fire while typing in an input.
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Shortcuts:</span>{" "}
              <Kbd>Space</Kbd> live/freeze, <Kbd>C</Kbd> copy seconds,{" "}
              <Kbd>M</Kbd> copy ms, <Kbd>N</Kbd> snap, <Kbd>F</Kbd> fullscreen,{" "}
              <Kbd>Esc</Kbd> exit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What this page gives you, and why it is useful
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            Unix time is a standard way to represent a moment as a single number
            (seconds or milliseconds since the Unix epoch). It is widely used in
            APIs, logs, databases, analytics events, and debugging tools because
            it is easy to store and compare. This page focuses on three jobs:
            show “now” in both units, help you copy the right value instantly,
            and help you confirm what that value means using UTC and local
            strings.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            <span className="font-semibold text-[var(--ilt-text-primary)]">Live</span> mode is
            for quickly glancing at the current value.{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">Frozen</span> mode is
            for correctness under pressure: you get one stable value that stays
            on screen while you paste it into a console, a ticket, a test case,
            or an alert payload.{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">Snap</span> is the
            middle ground: you stay frozen (so the screen is stable) but you can
            refresh the value once when you need “now” again.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Scenarios with examples (real numbers you will see here)
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            The examples below are written around the same patterns users run
            into: seconds vs milliseconds confusion, needing a stable timestamp,
            and verifying UTC versus local time quickly. The specific numbers
            are realistic examples, and the page will show the same kinds of
            values.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: “Give me now in seconds” for an API call"
              subtitle="You are testing an endpoint that expects epoch seconds"
              lines={[
                "What you do:",
                "- Toggle Frozen (Space) so the number stays stable",
                "- Click Copy seconds (or press C)",
                "",
                "What you might copy:",
                "- Seconds: 1735689600",
                "",
                "How you sanity-check it:",
                "- UTC line shows: Wed, Jan 01, 2025 00:00:00 UTC (example)",
                "- Local line shows the same moment in your timezone",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: You pasted 13 digits and everything broke"
              subtitle="Classic unit mismatch: milliseconds mistaken for seconds"
              lines={[
                "What you see on this page at the same moment:",
                "- Seconds: 1735689600",
                "- Milliseconds: 1735689600000",
                "",
                "What goes wrong:",
                "- If a system expects seconds and you paste 1735689600000,",
                "  it is 1000× too large and may parse as a far-future date.",
                "",
                "What to do instead:",
                "- Copy seconds (C) for second-based systems",
                "- Copy ms (M) for millisecond-based systems",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: You need a stable value while writing a ticket"
              subtitle="Freeze first so your timestamp does not change mid-copy"
              lines={[
                "Workflow:",
                "- Freeze the clock",
                "- Copy seconds and paste into the ticket",
                "- Copy milliseconds and paste into a JSON payload",
                "",
                "Example values you might paste:",
                "- seconds: 1740991234",
                "- ms: 1740991234123",
                "",
                "Why freeze matters:",
                "- Without freezing, the ms value changes constantly",
                "- You can end up pasting a different moment than you intended",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: UTC vs local confusion during debugging"
              subtitle="You suspect a timezone offset bug in a client app"
              lines={[
                "What you check:",
                "- Compare Local time and UTC time rows on this page",
                "",
                "Example display (format varies by browser/locale):",
                "- Local: Tue, Mar 04, 2025 08:15:12",
                "- UTC:   Tue, Mar 04, 2025 13:15:12 UTC",
                "",
                "What it tells you:",
                "- The epoch number is the same moment",
                "- Only the human-readable rendering changes by timezone",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Incident call, screen-shared reference clock"
              subtitle="Fullscreen makes the seconds value easy for everyone to read"
              lines={[
                "What you do:",
                "- Press F for fullscreen",
                "- Keep the big seconds display visible during the call",
                "",
                "Typical call-out:",
                "- 'At 1740991300 seconds the alert fired'",
                "",
                "Tip:",
                "- If you need to call out a specific moment, freeze first",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: You want a fresh “now” without going fully live"
              subtitle="Snap updates once while staying Frozen"
              lines={[
                "Example flow:",
                "- You are Frozen at seconds=1740991200",
                "- You do some work for a minute",
                "- Press N (Snap) to update once",
                "",
                "What you see:",
                "- seconds jumps to something like 1740991263",
                "- ms updates to match that exact moment",
                "",
                "Why it helps:",
                "- You stay in a stable mode but can refresh on demand",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen and shortcuts (fast control, low friction)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              If you use this page often, shortcuts are the fastest path. Press{" "}
              <Kbd>Space</Kbd> to toggle Live/Frozen, <Kbd>C</Kbd> to copy
              seconds, <Kbd>M</Kbd> to copy milliseconds, <Kbd>N</Kbd> to snap
              now, and <Kbd>F</Kbd> to toggle fullscreen. If shortcuts do
              nothing, click the clock card once so it has focus. Shortcuts are
              ignored while typing in inputs to prevent accidental triggers.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>Space</Kbd> live/freeze
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>C</Kbd> copy seconds
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>M</Kbd> copy ms
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>N</Kbd> snap
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>F</Kbd> fullscreen
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>Esc</Kbd> exit
              </span>
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 ilt-surface-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Related tools (same ecosystem, different job)
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                If you need a different time view or time math, use the closest
                match below.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>C</Kbd> <Kbd>M</Kbd> <Kbd>N</Kbd>{" "}
              <Kbd>F</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/utc-clock">UTC Clock</PillLink>
            <PillLink to="/current-local-time">Current Local Time</PillLink>
            <PillLink to="/time-zone-converter">Time Zone Converter</PillLink>
            <PillLink to="/milliseconds-converter">
              Milliseconds Converter
            </PillLink>
            <PillLink to="/world-clock">World Clock</PillLink>
            <PillLink to="/time-calculator">Time Calculator</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (units, clock source, clipboard, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Notes that matter when you rely on precise copy behavior
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Clock source and units
              </div>
              <p className="mt-1 leading-relaxed">
                The page uses your device time via JavaScript Date. Seconds is
                computed by dividing milliseconds by 1000 and truncating to an
                integer, so it behaves like typical Unix epoch seconds.
                Milliseconds is the raw Date value in ms.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Why updates can look “jumpy”
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers can reduce timer frequency in background tabs to save
                resources. When that happens, the display may update less often.
                The underlying time still comes from the device clock, so the
                values remain consistent with “now” when the tab is active.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Clipboard behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Copy uses the browser clipboard API. Some contexts restrict
                clipboard access (for example, embedded browsers or strict
                privacy settings). If copy fails, try the button again or use
                keyboard shortcuts after focusing the card.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API. Most browsers
                require a user gesture (click/tap) to enter fullscreen. Exiting
                fullscreen is handled by <Kbd>Esc</Kbd> or the Exit button.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Need UTC only?</strong> Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/utc-clock"
            >
              UTC Clock
            </Link>{" "}
            for a dedicated UTC display.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Need conversions?</strong> Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/milliseconds-converter"
            >
              Milliseconds Converter
            </Link>{" "}
            when you are working with duration-style values or need a different
            unit.
          </div>
        </div>
      </div>
    </section>
  );
}
