import React from "react";

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
   - Uses only your real routes (no hash anchors).
   - Scenario-based with concrete examples for /binary-clock.
   - Tool-focused, not a blog post.
   - Technical details live in an expandable section.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/binary-clock",
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
    name: "How to view the current time in binary (BCD or pure binary)",
    description:
      "Use the Binary Clock to display your current local time in binary. Switch between BCD and pure binary, toggle seconds, choose 12/24-hour time, copy a snapshot, and use fullscreen for a clean display.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Open the Binary Clock",
        text: "The page shows your current local time immediately, along with a binary representation of the time.",
      },
      {
        "@type": "HowToStep",
        name: "Choose a binary mode (BCD or pure)",
        text: "Use BCD for digit-by-digit binary (each decimal digit becomes 4 bits) or pure binary to show hours, minutes, and seconds as binary numbers.",
      },
      {
        "@type": "HowToStep",
        name: "Adjust display options",
        text: "Toggle seconds on/off and switch between 12-hour and 24-hour time.",
      },
      {
        "@type": "HowToStep",
        name: "Copy a snapshot",
        text: "Use Copy to capture the formatted time, date, timezone label, binary output, and ISO timestamp.",
      },
      {
        "@type": "HowToStep",
        name: "Use fullscreen and shortcuts",
        text: "Toggle fullscreen for a wall display and use keyboard shortcuts for fast control (F, C, S, B, 1, 2, Esc).",
      },
    ],
  };

  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="ilt-keycap px-2 py-1 font-mono text-[11px] font-semibold text-[var(--ilt-text-primary)]">
      {children}
    </kbd>
  );

  const PillLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a
      href={href}
      className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
    >
      {children} →
    </a>
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
        <div className="font-mono text-xs whitespace-pre-wrap text-[var(--ilt-text-secondary)]">
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

            <p className="mt-2 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              This Binary Clock shows the current time from your device and
              renders it in binary in a way you can actually use. It is not a
              “learn binary” article and it is not a novelty widget that hides
              the useful parts. You pick how you want the bits expressed, then
              the page stays consistent: it updates cleanly, offers a
              copy-friendly snapshot, and supports fullscreen when you want a
              readable display at a distance.
            </p>

            <p className="mt-3 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              The two viewing modes are for two different intents:
              <strong> BCD</strong> keeps the familiar clock digits and shows
              each decimal digit as four bits. <strong>Pure binary</strong>{" "}
              shows hours, minutes, and seconds as true binary numbers. Neither
              mode changes the underlying time. It only changes the
              representation.
            </p>

            <p className="mt-3 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              If you want a standard display instead, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/digital-clock")}
              >
                Digital Clock
              </a>{" "}
              or{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/analog-clock")}
              >
                Analog Clock
              </a>
              . If you want elapsed time in a binary-style format, try the{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/binary-stopwatch")}
              >
                Binary Stopwatch
              </a>{" "}
              . If you need time across locations, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/world-clock")}
              >
                World Clock
              </a>{" "}
              or{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/time-zone-converter")}
              >
                Time Zone Converter
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              BCD + pure
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Seconds toggle
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              12/24-hour
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Copy snapshot
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fullscreen
            </span>
          </div>
        </div>

        {/* Quick flow */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              The fastest setup (no scrolling, no configuration rabbit holes)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Pick a
                mode: <strong>BCD</strong> (digits) or <strong>Pure</strong>{" "}
                (binary numbers). Press <Kbd>B</Kbd> to toggle.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Decide
                whether you want seconds. Press <Kbd>S</Kbd> to toggle.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Choose{" "}
                <strong>24-hour</strong> or <strong>12-hour</strong>. Press{" "}
                <Kbd>2</Kbd> for 24-hour, <Kbd>1</Kbd> for 12-hour.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> Use{" "}
                <Kbd>F</Kbd> for fullscreen when you want a wall display.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> Use{" "}
                <Kbd>C</Kbd> to copy a snapshot of the current moment.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What you are actually looking at
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                The large time line is your local time formatted in either 24h
                or 12h style. The grid beneath it is the binary representation.
                In BCD, you get one 4-bit column per digit. In pure mode, you
                get one bit column per field (hours, minutes, seconds).
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                The page updates aligned to the next whole-second boundary. Even
                if seconds are hidden, the page still ticks on second boundaries
                so the minute change happens cleanly.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Quick mode choice (pick based on intent)
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                Choose <span className="font-semibold">BCD</span> when you want
                the bits to stay aligned to clock digits.
              </li>
              <li>
                Choose <span className="font-semibold">Pure</span> when you want
                the actual hour, minute, and second values as binary numbers.
              </li>
              <li>
                Hide seconds for a calmer display. Show seconds for a “live”
                clock feel.
              </li>
              <li>
                This uses your device clock. It is not a network-synced or
                atomic time source.
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Practical tip:
              </span>{" "}
              If you are going to share a screenshot or paste output into notes,
              turn seconds on for more precise snapshots, then use Copy.
            </div>
          </div>
        </div>

        {/* Main explanation (tool-focused, SEO-friendly, unique) */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What each option changes (and what it does not)
          </h3>

          <div className="mt-2 grid gap-4 lg:grid-cols-2">
            <div className="ilt-surface-card p-5">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                BCD mode: digit-by-digit binary that stays readable
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                BCD is built for the moment you want “binary time” while still
                thinking in normal clock digits. The time stays in the same
                format you already recognize (HH:MM:SS or HH:MM). The difference
                is that each digit becomes a 4-bit group, so the grid can be
                read as a compact mapping of digits to bits.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                This makes BCD ideal for quick glances and for displays where
                you want to see which digit changed. When minutes roll from 09
                to 10, you can tell it was a digit change, not a full-field
                binary rollover.
              </p>
            </div>

            <div className="ilt-surface-card p-5">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Pure binary mode: binary numbers for hours, minutes, seconds
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Pure mode is for users who want the binary values of the fields
                themselves. Minutes are shown as a 6-bit number because minutes
                range from 0 to 59. Seconds are the same. Hours use 5 bits in
                24-hour mode (0–23), and 4 bits in 12-hour mode (1–12). The grid
                is a direct binary value display rather than a digit mapping.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                If you are validating an implementation, comparing to another
                encoded clock, or just want the cleanest “binary number” view,
                pure mode is the right choice.
              </p>
            </div>
          </div>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Real scenarios with concrete examples
          </h3>
          <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
            These examples mirror what people actually do on this page: toggle a
            mode, hide seconds for stability, switch to 12-hour time for display
            style, and copy a snapshot for notes. The numbers below are
            intentionally specific so you can verify the bit strings yourself.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Debug a specific moment (24-hour + seconds on)"
              subtitle="You want a binary snapshot of a visible time"
              lines={[
                "Displayed time: 13:07:42 (24-hour, seconds on)",
                "",
                "BCD (each digit -> 4 bits):",
                "Digits: 1 3 0 7 4 2",
                "Bits:   0001 0011 0000 0111 0100 0010",
                "",
                "Pure binary (fields -> binary numbers):",
                "Hours 13 (5 bits):    01101",
                "Minutes 7 (6 bits):   000111",
                "Seconds 42 (6 bits):  101010",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Calm desk display (seconds off)"
              subtitle="You want binary time without constant motion"
              lines={[
                "Displayed time: 09:58 (24-hour, seconds off)",
                "",
                "BCD:",
                "Digits: 0 9 5 8",
                "Bits:   0000 1001 0101 1000",
                "",
                "Pure binary:",
                "Hours 9 (5 bits):     01001",
                "Minutes 58 (6 bits):  111010",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: 12-hour display for a wall clock (AM/PM suffix)"
              subtitle="You want a familiar display style but still binary"
              lines={[
                "Displayed time: 03:05 PM (12-hour, seconds off)",
                "Underlying local hour: 15:05 in 24-hour time",
                "",
                "BCD (12-hour uses hour digits '03'):",
                "Digits: 0 3 0 5",
                "Bits:   0000 0011 0000 0101",
                "",
                "Pure binary (12-hour hour value is 3, 4 bits):",
                "Hours 3 (4 bits):     0011",
                "Minutes 5 (6 bits):   000101",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Copy a snapshot you can paste into notes"
              subtitle="You want a compact record including ISO time"
              lines={[
                "Example copy content (format may vary slightly by locale):",
                "",
                "13:07:42 (America/Toronto)",
                "Friday, February 20, 2026",
                "H:01101 M:000111 S:101010",
                "ISO: 2026-02-20T18:07:42.123Z",
                "",
                "Tip: If you need a timestamped moment, keep seconds on and use Copy.",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen and shortcuts (what you will actually use)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen is built for readability, not for hiding controls. You
              can still change mode, seconds, and 12/24-hour settings while in
              fullscreen. Keyboard shortcuts are designed to keep you moving
              without hunting for toggles.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>F</Kbd> fullscreen
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>C</Kbd> copy
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>S</Kbd> seconds
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>B</Kbd> mode
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>1</Kbd> 12-hour
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>2</Kbd> 24-hour
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
                Related tools (same idea, different representation)
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                If you like encoded time displays, these routes keep the intent
                but change the format.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>F</Kbd> <Kbd>C</Kbd> <Kbd>S</Kbd> <Kbd>B</Kbd>{" "}
              <Kbd>1</Kbd> <Kbd>2</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/hexadecimal-clock")}>
              Hexadecimal Clock
            </PillLink>
            <PillLink href={abs("/binary-stopwatch")}>
              Binary Stopwatch
            </PillLink>
            <PillLink href={abs("/morse-code-clock")}>
              Morse Code Clock
            </PillLink>
            <PillLink href={abs("/fibonacci-clock")}>Fibonacci Clock</PillLink>
            <PillLink href={abs("/epoch-unix-time-clock")}>
              Epoch / Unix Time Clock
            </PillLink>
            <PillLink href={abs("/utc-clock")}>UTC Clock</PillLink>
            <PillLink href={abs("/world-clock")}>World Clock</PillLink>
            <PillLink href={abs("/digital-clock")}>Digital Clock</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (bit widths, time source, copy format)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                What the grid represents, how fields are sized, and what Copy
                includes
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">BCD mapping</div>
              <p className="mt-1 leading-relaxed">
                In BCD mode, each decimal digit (0–9) is displayed as 4 bits.
                The grid shows one 4-bit column per digit in the displayed time.
                When seconds are off, only HH:MM digits are shown.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Pure binary field sizing
              </div>
              <p className="mt-1 leading-relaxed">
                Minutes and seconds use 6 bits (0–59). Hours use 5 bits in
                24-hour mode (0–23). In 12-hour mode, hours use 4 bits (1–12)
                and the AM/PM suffix is shown as text alongside the time.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Time source</div>
              <p className="mt-1 leading-relaxed">
                The clock uses your device’s local time. The timezone label is
                read from the browser when available. This page does not convert
                between time zones and does not query a time server.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Copy output</div>
              <p className="mt-1 leading-relaxed">
                Copy includes the formatted time, a timezone label, a date line,
                a mode-specific binary line, and an ISO timestamp. ISO is
                included as a UTC reference even if your display format is
                12-hour.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API on the clock card. If
                fullscreen is not available due to browser policies, the page
                continues to work normally. Exiting is always available via{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> or the
                Exit control.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Need time across locations?
            </strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/world-clock")}
            >
              World Clock
            </a>{" "}
            or{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/time-zone-converter")}
            >
              Time Zone Converter
            </a>
            .
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Want a normal clock view?
            </strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/digital-clock")}
            >
              Digital Clock
            </a>{" "}
            or{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/current-local-time")}
            >
              Current Local Time
            </a>
            .
          </div>
        </div>
      </div>
    </section>
  );
}
