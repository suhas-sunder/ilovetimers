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
   - Hexadecimal Clock intent: show current local time as hex (HH:MM:SS),
     optional milliseconds, 12/24-hour toggle, copy block, fullscreen,
     and hex color mode (#RRGGBB).
   - Tool-focused, not an educational blog.
   - Scenario-based with concrete numbers users will see here.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/hexadecimal-clock",
  baseUrl = "https://www.ilovetimers.com",
}: {
  canonicalUrl?: string;
  baseUrl?: string;
}) {
  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;


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
    <div className="space-y-4">
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
    <section className="mx-auto max-w-7xl px-4 pb-10">

      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>

            <p className="mt-2 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Hexadecimal Clock
              </span>{" "}
              is built for one job: show the{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                current time rendered in hexadecimal
              </span>{" "}
              without extra noise. You can flip between{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Hex HH:MM:SS</span>{" "}
              and a{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                hex color mode
              </span>{" "}
              (time mapped to{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">#RRGGBB</span>),
              choose 12-hour or 24-hour output, toggle seconds and milliseconds,
              and copy a ready-to-paste timestamp block.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              This page is designed for action. If you are trying to paste a
              timestamp into a ticket, capture a “right now” moment for a log,
              or keep a clean time display up on a second monitor, you should be
              able to do that in a couple of clicks, not a workflow.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              The output is intentionally consistent: fixed-width hex digits,
              uppercase letters, and a copy payload that includes both the human
              view (local time + date) and a precise machine-friendly timestamp
              (ISO in UTC).
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Hex HH:MM:SS
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Milliseconds
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              12/24-hour
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Copy block
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Hex color
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
              Quick use (what most people do)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Pick a{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">mode</span>: Hex
                HH:MM:SS or Hex color.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Choose{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">format</span>:
                24-hour (00–17 hours in hex) or 12-hour (01–0C with AM/PM).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Decide{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">precision</span>:
                seconds on/off, and ms when available.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> Hit{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Copy</span> to
                grab a complete snapshot you can paste into notes, chat, or
                debugging output.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> For a
                clean display, press <Kbd>F</Kbd> to go fullscreen. Exit with{" "}
                <Kbd>Esc</Kbd>.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What “Copy” is optimized for
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Copy is not just the big hex string. It includes the hex output
                you’re looking at, the decimal time and time zone label your
                device is using, a readable date line, and an ISO timestamp in
                UTC. The goal is that your paste is useful even if the person
                reading it is in a different time zone, or looking at it later.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Practical checklist
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                If you share time across teams, keep ISO in the paste (it avoids
                “which time zone?” follow-ups).
              </li>
              <li>
                If you want higher precision, keep seconds on before enabling ms
                (ms is intentionally tied to seconds).
              </li>
              <li>
                If you’re demoing, fullscreen makes the display readable from a
                distance.
              </li>
              <li>
                If shortcuts do nothing, click the card once so it has focus.
              </li>
              <li>
                Color mode uses 24-hour hours (RR) even if you prefer 12-hour
                display elsewhere.
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Shortcuts:</span>{" "}
              <Kbd>F</Kbd> fullscreen, <Kbd>C</Kbd> copy, <Kbd>S</Kbd> seconds,{" "}
              <Kbd>M</Kbd> ms, <Kbd>X</Kbd> mode, <Kbd>1</Kbd> 12h, <Kbd>2</Kbd>{" "}
              24h, <Kbd>Esc</Kbd> exit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What you can do on this page
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            The main display is the current time rendered in hex, built as a
            stable, fixed-width string you can read quickly. In Hex HH:MM:SS,
            each field is a predictable two-digit value. In 24-hour mode, hours
            run from <span className="font-semibold text-[var(--ilt-text-primary)]">00</span>{" "}
            (midnight) to{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">17</span> (23
            decimal). Minutes and seconds run from{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">00</span> to{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">3B</span>. This means
            that if you see{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">3A</span> in the
            minutes position, you are at 58 minutes past the hour, and if you
            see <span className="font-semibold text-[var(--ilt-text-primary)]">10</span> in the
            hour position, that’s 16:xx in 24-hour time.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            You can also switch to 12-hour display. In that mode, the clock
            converts the hour into the familiar 1–12 range first, then renders
            that value in hex and appends AM/PM. This is why 12-hour hex hours
            tend to look like{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">09</span> (9 o’clock)
            or <span className="font-semibold text-[var(--ilt-text-primary)]">0C</span> (12
            o’clock). It’s intentional: the hour is hex-encoded, but still
            “reads” like a 12-hour clock in terms of meaning.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            Precision is controlled with toggles. If seconds are off, the page
            behaves like a “minutes clock” and updates much less often. If
            seconds are on, the display updates frequently. If you enable ms,
            you get an additional readout that shows milliseconds in hex (3
            digits) and the same value in decimal. Milliseconds are locked to
            seconds because otherwise users tend to misread the output as
            “precise time” while the main display is only showing hours and
            minutes.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Scenarios with examples (real numbers you will see)
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            These examples are written in the same shape as the output you copy
            from this page. The values will change with your current time,
            but the structure and ranges are consistent.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: “What time is it in hex right now?”"
              subtitle="You keep seconds on, 24-hour mode, time display."
              lines={[
                "Settings:",
                "- Mode: Hex HH:MM:SS",
                "- 24h: ON",
                "- Seconds: ON",
                "- ms: OFF",
                "",
                "Example on-screen value:",
                "- Hex: 10:2A:3C",
                "",
                "What it means (decimal):",
                "- 0x10 hours = 16 hours",
                "- 0x2A minutes = 42 minutes",
                "- 0x3C seconds = 60 seconds (note: seconds will usually be 00–3B; this example is just format)",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Copy a clean “timestamp block” for a bug report"
              subtitle="You want something pastable that includes local context and UTC."
              lines={[
                "Action:",
                "- Press Copy (or C)",
                "",
                "What your paste looks like (example):",
                "Hex: 0F:3B:08",
                "Dec: 15:59:08 (America/Toronto)",
                "Date: Monday, February 23, 2026",
                "ISO: 2026-02-23T20:59:08.214Z",
                "",
                "Why this helps:",
                "- The person reading it can use ISO as a UTC timestamp",
                "- The local line explains what you saw on your device",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Milliseconds for quick precision checks"
              subtitle="You need ms, but still want the main readout readable."
              lines={[
                "Settings:",
                "- Mode: Hex HH:MM:SS",
                "- Seconds: ON",
                "- ms: ON",
                "",
                "Example readout (shape):",
                "- Hex: 0A:12:2F · ms:1C4",
                "- Sub: ms: 1C4 (hex) · 452 (dec)",
                "",
                "What it means:",
                "- 0x1C4 = 452 milliseconds",
                "- The ms line changes fast; the HH:MM:SS stays readable",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Hex color mode for a quick #RRGGBB"
              subtitle="You want a time-based color you can paste into a design note."
              lines={[
                "Settings:",
                "- Mode: Hex color",
                "- Seconds: ON",
                "",
                "Example on-screen value:",
                "- #0F2A1D",
                "",
                "What it maps to:",
                "- RR=0F (hours=15)",
                "- GG=2A (minutes=42)",
                "- BB=1D (seconds=29)",
                "",
                "If Seconds is OFF:",
                "- #0F2A00 (BB forced to 00)",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Big-screen demo (fullscreen + click-to-copy)"
              subtitle="You want an uncluttered display and quick copying."
              lines={[
                "Workflow:",
                "- Press F to enter fullscreen",
                "- Click/tap the big time display to copy",
                "- Press Esc to exit",
                "",
                "When it’s useful:",
                "- Standups, live demos, classrooms",
                "- Recording a screen while showing “time in hex” clearly",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: Switching 12h/24h depending on who you’re sharing with"
              subtitle="Same moment, different human conventions."
              lines={[
                "Example moment (decimal): 9:07 PM",
                "",
                "24-hour hex hour:",
                "- 21 decimal = 15 hex",
                "- Hex time might show: 15:07:xx",
                "",
                "12-hour hex hour:",
                "- 9 decimal = 09 hex (after conversion to 12-hour)",
                "- Hex time might show: 09:07:xx PM",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fast control without hunting through UI
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The clock card is keyboard-friendly. Press <Kbd>F</Kbd> for
              fullscreen, <Kbd>C</Kbd> to copy, <Kbd>S</Kbd> to toggle seconds,
              <Kbd>M</Kbd> for milliseconds (time mode only), <Kbd>X</Kbd> to
              switch modes, and <Kbd>1</Kbd>/<Kbd>2</Kbd> to jump between
              12-hour and 24-hour output. If shortcuts do nothing, click the
              card once to give it focus.
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
                <Kbd>M</Kbd> ms
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>X</Kbd> mode
              </span>
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 ilt-surface-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Related tools (same site, different job)
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                If you need a close match for what you are doing, use the links
                below.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>F</Kbd> <Kbd>C</Kbd> <Kbd>S</Kbd> <Kbd>M</Kbd>{" "}
              <Kbd>X</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/binary-clock">Binary Clock</PillLink>
            <PillLink to="/digital-clock">Digital Clock</PillLink>
            <PillLink to="/morse-code-clock">Morse Code Clock</PillLink>
            <PillLink to="/utc-clock">UTC Clock</PillLink>
            <PillLink to="/epoch-unix-time-clock">
              Epoch / Unix Time Clock
            </PillLink>
            <PillLink to="/world-clock">World Clock</PillLink>
            <PillLink to="/time-zone-converter">Time Zone Converter</PillLink>
            <PillLink to="/milliseconds-converter">
              Milliseconds Converter
            </PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (formats, time zone, refresh rate, clipboard)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional notes if you rely on display behavior
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Hex formatting</div>
              <p className="mt-1 leading-relaxed">
                Values are rendered as uppercase hex with fixed widths (hours,
                minutes, seconds = 2 digits; milliseconds = 3 digits). This
                keeps the display stable and copy-friendly.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Refresh rate behavior
              </div>
              <p className="mt-1 leading-relaxed">
                The update interval adapts to settings: ms updates more often,
                seconds updates several times per second, and “no seconds”
                updates infrequently to reduce CPU usage.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Time zone labels
              </div>
              <p className="mt-1 leading-relaxed">
                The on-screen “Local time” label uses your device’s resolved
                time zone name when available. Copy includes an ISO timestamp
                (UTC) so the moment is unambiguous even if time zone names vary.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Clipboard notes
              </div>
              <p className="mt-1 leading-relaxed">
                Copy uses the browser clipboard API. If copying fails, it is
                usually due to permission restrictions or the page not being in
                a secure context.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Color mode mapping
              </div>
              <p className="mt-1 leading-relaxed">
                Hex color mode maps RR=hours (24h), GG=minutes, BB=seconds as
                two-digit hex components. If seconds are hidden, BB is forced to
                00 to keep the value stable.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Need UTC time?</strong> Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/utc-clock"
            >
              UTC Clock
            </Link>{" "}
            for a dedicated UTC display.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Need epoch timestamps?</strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/epoch-unix-time-clock"
            >
              Epoch / Unix Time Clock
            </Link>{" "}
            for seconds-based timestamps.
          </div>
        </div>

        {/* Small SEO anchor text without being bloggy */}
        <div className="mt-6 ilt-surface-muted px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">In one sentence:</strong> this is a
          hexadecimal clock that shows your current local time as hex HH:MM:SS
          (optionally milliseconds), lets you switch 12/24-hour display, copy a
          complete timestamp block, and view time as a hex color (#RRGGBB) in
          fullscreen when needed.
        </div>
      </div>
    </section>
  );
}
