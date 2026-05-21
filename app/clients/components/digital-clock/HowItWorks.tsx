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
   - Digital Clock intent: big local time display with seconds + 12/24 + fullscreen + copy.
   - Tool-focused, not a blog post.
   - Scenario-based with concrete example numbers users will experience here.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/digital-clock",
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
    name: "How to use the Digital Clock (big fullscreen clock with seconds)",
    description:
      "Use Digital Clock to display your current local time in large, readable digits. Toggle seconds and 12/24-hour time, go fullscreen for distance viewing, and copy a paste-ready timestamp that includes timezone, date, and ISO time.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose your display format",
        text: "Toggle seconds on or off, and switch between 12-hour and 24-hour time depending on your needs.",
      },
      {
        "@type": "HowToStep",
        name: "Go fullscreen for a big display",
        text: "Toggle fullscreen to fill the screen with the clock. Exit fullscreen with Esc.",
      },
      {
        "@type": "HowToStep",
        name: "Copy the current time",
        text: "Use Copy (or press C) to copy the displayed time plus timezone, date, and ISO timestamp for pasting into notes, chat, or logs.",
      },
      {
        "@type": "HowToStep",
        name: "Use keyboard shortcuts for quick control",
        text: "Press F for fullscreen, S to toggle seconds, 1/2 for 12/24-hour, and C to copy. If shortcuts do nothing, click the clock card once to focus it.",
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
        <div className="whitespace-pre-wrap font-mono text-xs text-[var(--ilt-text-secondary)]">
          {lines.join("\n")}
        </div>
      </div>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <JsonLd data={howToLd} />

      <div className="ilt-surface-card p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>

            <p className="mt-2 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Digital Clock
              </span>{" "}
              is a big on-screen clock that shows your{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                current local time
              </span>{" "}
              in a clean, readable format. It is built for practical moments:
              putting a clock on a second monitor, projecting a clock in a room,
              keeping time visible during meetings, or quickly copying a
              timestamp into notes.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              You control three things: whether seconds are shown, whether the
              time is in 12-hour or 24-hour format, and whether the display is
              normal or fullscreen. The clock also has a{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Copy</span> action
              that gives you a paste-ready snapshot including time, timezone,
              date, and an ISO timestamp so the copied value is unambiguous.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              This digital clock is intentionally focused on hours, minutes,
              and optional seconds. It does not show milliseconds. If you need a
              live clock with milliseconds for frame timing, cue checks, or
              precise-looking screen recordings, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/atomic-clock")}
              >
                Atomic Clock
              </a>{" "}
              instead.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              The key point: this page displays{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                your device’s time
              </span>{" "}
              and detected timezone. It does not fetch “internet time” on its
              own. If your laptop clock is off by two minutes, this page will be
              off by two minutes. If you need UTC as a shared reference, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/utc-clock")}
              >
                UTC Clock
              </a>
              . If you need a millisecond display, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/atomic-clock")}
              >
                Atomic Clock
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Seconds toggle
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              12/24-hour
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fullscreen
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Copy timestamp
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
              Fast use (what most people do)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Set
                your display: toggle{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Seconds</span>{" "}
                on/off and choose{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">12/24-hour</span>
                .
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Press{" "}
                <Kbd>F</Kbd> to go fullscreen when you need a room-readable
                clock. Exit with <Kbd>Esc</Kbd>.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Press{" "}
                <Kbd>C</Kbd> or click{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Copy</span> to
                copy a clean timestamp.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> If you
                want quick toggles without hunting controls: <Kbd>S</Kbd>{" "}
                toggles seconds,
                <Kbd>1</Kbd>/<Kbd>2</Kbd> switches 12/24-hour.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What “Copy” is designed for
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                People often paste time into places where context gets lost.
                Copy includes the timezone and date (plus an ISO timestamp) so
                “3:15 PM” does not become confusing later. The copied value is
                meant to survive forwarding, screenshots, and handoffs.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              A quick checklist for accuracy
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                Confirm your device timezone is correct (especially after travel
                or VPN changes).
              </li>
              <li>
                If seconds matter, turn seconds on so you can see exact
                boundaries.
              </li>
              <li>
                If you are coordinating across time zones, keep a{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/utc-clock")}
                >
                  UTC Clock
                </a>{" "}
                tab nearby for a neutral reference.
              </li>
              <li>
                If shortcuts do nothing, click the clock card once to focus it.
                Shortcuts do not fire while typing in a form field.
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Shortcut tip:
              </span>{" "}
              <Kbd>F</Kbd> fullscreen, <Kbd>C</Kbd> copy, <Kbd>S</Kbd> seconds,{" "}
              <Kbd>1</Kbd>/<Kbd>2</Kbd> 12/24-hour, <Kbd>Esc</Kbd> exit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What you can do on this page
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            This clock is intentionally simple, but it is built for real
            workflows. Seconds mode is for precision. No-seconds mode is for
            calm readability. 24-hour mode is for environments where “13:05” is
            clearer than “1:05 PM”. Fullscreen mode is for distance viewing.
            Copy is for moving time into messages, notes, or logs without losing
            context.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            The display also shows your timezone label (when available). That
            matters when you are in a shared room or on a call with people in
            different places. If the timezone label can’t be detected, it falls
            back to “Local” and the time still displays normally.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Scenarios with examples (real outputs you will see)
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            The scenarios below are written to match what you will actually do
            with this page. Each includes concrete example outputs so you can
            recognize the behavior immediately.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Classroom display on a projector"
              subtitle="You want a wall clock students can read from the back row"
              lines={[
                "Setup:",
                "- Turn Seconds OFF for less distraction.",
                "- Press F for fullscreen.",
                "",
                "What you see (example):",
                "- 09:42 AM",
                "- Local time · America/Toronto",
                "- Monday, February 21, 2026",
                "",
                "Why it works:",
                "- Big digits, no clutter.",
                "- Easy to glance at during transitions.",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Meeting notes with a clean timestamp"
              subtitle="You want to paste time into notes without ambiguity"
              lines={[
                "During the meeting:",
                "- Press C (or click Copy).",
                "",
                "Example paste (format you will get):",
                "09:17:08 (America/Toronto) - Monday, February 21, 2026 (ISO: 2026-02-21T14:17:08.123Z)",
                "",
                "How people use it:",
                "- 'Decision recorded at 09:17:08' and the timezone is attached.",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Ops/incident log entry with ISO time"
              subtitle="You need something that is safe to paste into systems and tickets"
              lines={[
                "Recommended setup:",
                "- Turn Seconds ON.",
                "- Use 24-hour time if your team standard uses it.",
                "",
                "Example on-screen:",
                "- 21:03:44",
                "",
                "Example copy paste:",
                "21:03:44 (America/Toronto) - Monday, February 21, 2026 (ISO: 2026-02-22T02:03:44.009Z)",
                "",
                "Why ISO helps:",
                "- It stays clear even if the reader is in another timezone.",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Remote coordination with local + UTC"
              subtitle="You want a local clock plus a neutral reference for a call"
              lines={[
                "Workflow:",
                "- Keep this Digital Clock for local time.",
                "- Open UTC Clock in another tab.",
                "",
                "Example:",
                "- Local shows: 16:25:10 (24-hour mode)",
                "- UTC tab shows: 21:25:10",
                "",
                "Use case:",
                "- You can say 'Let’s start at 21:30 UTC' while still seeing your local time.",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: A shared screen during a presentation"
              subtitle="You want the time visible without changing your slide deck"
              lines={[
                "Setup:",
                "- Share this tab on the projector or a side display.",
                "- Press F for fullscreen.",
                "",
                "Presenter shortcut:",
                "- Turn Seconds ON when timing is tight.",
                "- Turn Seconds OFF when you want a calmer room display.",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: 12-hour vs 24-hour in the same space"
              subtitle="You need to match a team standard quickly"
              lines={[
                "Quick switch:",
                "- Press 1 for 12-hour time (example: 08:05 PM).",
                "- Press 2 for 24-hour time (example: 20:05).",
                "",
                "When it matters:",
                "- Shift handoffs, labs, and production environments often prefer 24-hour.",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen and shortcuts (built for quick control)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen exists so the clock stays readable at a distance.
              Shortcuts keep it fast: <Kbd>F</Kbd> fullscreen, <Kbd>C</Kbd>{" "}
              copy, <Kbd>S</Kbd> toggle seconds, and <Kbd>1</Kbd>/<Kbd>2</Kbd>{" "}
              12/24-hour. If shortcuts do nothing, click the clock card once so
              it has focus.
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
                <Kbd>1</Kbd>/<Kbd>2</Kbd> 12/24-hour
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
                Related tools (same ecosystem, different intent)
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                If you need multiple cities, time conversion, UTC, milliseconds,
                or a different display style, these are better matches.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>F</Kbd> <Kbd>C</Kbd> <Kbd>S</Kbd> <Kbd>1</Kbd>{" "}
              <Kbd>2</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/world-clock")}>World Clock</PillLink>
            <PillLink href={abs("/time-zone-converter")}>
              Time Zone Converter
            </PillLink>
            <PillLink href={abs("/utc-clock")}>UTC Clock</PillLink>
            <PillLink href={abs("/atomic-clock")}>Atomic Clock</PillLink>
            <PillLink href={abs("/current-local-time")}>
              Current Local Time
            </PillLink>
            <PillLink href={abs("/analog-clock")}>Analog Clock</PillLink>
            <PillLink href={abs("/fullscreen-timer")}>
              Fullscreen Timer
            </PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (time source, update timing, copy, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Notes that matter if you rely on seconds, timestamps, or screen
                sharing
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Time source</div>
              <p className="mt-1 leading-relaxed">
                The clock reads the current time from your browser’s Date object
                and formats it using Intl.DateTimeFormat when available. The
                timezone label uses
                Intl.DateTimeFormat().resolvedOptions().timeZone when the
                browser supports it.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Update timing</div>
              <p className="mt-1 leading-relaxed">
                When seconds are enabled, updates are scheduled on the next
                second boundary to reduce drift. When seconds are hidden, the
                clock updates close to the start of each minute to avoid
                unnecessary re-renders.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Copy format</div>
              <p className="mt-1 leading-relaxed">
                Copy includes the currently displayed time (respecting
                12/24-hour and seconds), the timezone label, the formatted date
                line, and the ISO timestamp from toISOString() for a
                machine-readable reference.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen and clipboard permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API and updates state on
                fullscreenchange. Some browsers require a user gesture
                (click/tap) to enter fullscreen. Clipboard access can also be
                restricted by browser policy and is most reliable after a user
                action.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Need a neutral reference?
            </strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/utc-clock")}
            >
              UTC Clock
            </a>{" "}
            or{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/atomic-clock")}
            >
              Atomic Clock
            </a>
            .
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Coordinating across zones?
            </strong>{" "}
            Try{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/time-zone-converter")}
            >
              Time Zone Converter
            </a>{" "}
            or{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/world-clock")}
            >
              World Clock
            </a>
            .
          </div>
        </div>
      </div>
    </section>
  );
}
