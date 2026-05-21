// app/clients/components/time-zone-converter/HowItWorks.tsx
import * as React from "react";
import { Link } from "react-router";

/* =========================================================
   JSON-LD helper (used by FAQ + PopularUseCases)
========================================================= */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* =========================================================
   HOW IT WORKS (Time Zone Converter)
   Goal: user-intent first, SEO-friendly, unique, practical
   Target: 800 to 1200 words of real help + examples
========================================================= */
export default function HowItWorks({
  baseUrl = "https://www.ilovetimers.com",
}: {
  baseUrl?: string;
}) {
  const pageUrl = `${baseUrl}/time-zone-converter`;

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to convert a specific date and time between time zones",
    description:
      "Use Time Zone Converter to convert a planned date and time from one time zone to another with DST-aware results. Swap zones, set Now, copy a clean record, create a share link, and use fullscreen with keyboard shortcuts.",
    url: pageUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Pick From and To time zones",
        text: "Choose the time zone you are starting from and the time zone you want to convert to.",
      },
      {
        "@type": "HowToStep",
        name: "Enter the date and time",
        text: "Select the date and type the time (HH:MM, or HH:MM:SS if seconds are enabled).",
      },
      {
        "@type": "HowToStep",
        name: "Read both results and the ISO timestamp",
        text: "The tool shows the time in both zones for the same instant, plus an ISO timestamp for an unambiguous reference.",
      },
      {
        "@type": "HowToStep",
        name: "Copy or share your conversion",
        text: "Use Copy to paste a clean record into a chat or ticket, or Share to copy a link that preserves your inputs.",
      },
      {
        "@type": "HowToStep",
        name: "Use shortcuts to move faster",
        text: "Press S to swap, N for now, C to copy, F for fullscreen, and Esc to exit fullscreen.",
      },
    ],
  };

  return (
    <section className="space-y-4">
      <JsonLd data={howToLd} />

      <div className="ilt-surface-card p-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Time Zone Converter is for one very specific job: convert a planned
            date and time between two time zones without guessing offsets. Pick
            a From zone, pick a To zone, enter the exact date and time you mean,
            and the page shows the corresponding local time in both places for
            the same instant. It is designed for scheduling, deadlines, travel
            plans, and “what time is that for you?” messages where being off by
            even one hour can cause real problems.
          </p>
        </div>

        {/* Core explanation (SEO + intent, no fluff) */}
        <div className="mt-4 grid gap-4">
          <div className="ilt-surface-muted p-4 text-[var(--ilt-text-secondary)]">
            <p className="leading-relaxed">
              The converter works with official IANA time zones (for example{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                America/Toronto
              </span>{" "}
              or{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Europe/London
              </span>
              ). That matters because the relationship between two places is not
              always a fixed number of hours. Daylight saving time can shift the
              offset depending on the date, and different regions change on
              different days. This tool uses the selected zones’ rules for the
              date you entered, so your result matches what people in those
              places would actually see on their clocks.
            </p>
            <p className="mt-3 leading-relaxed">
              You also get an{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                ISO timestamp
              </span>{" "}
              output. ISO represents a single instant in time in a format that
              software and humans can both interpret consistently. If you are
              coordinating work across systems, tickets, or logs, ISO helps you
              avoid ambiguous phrasing like “Tuesday at 10” without context.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                1) Choose zones
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Set <span className="font-semibold text-[var(--ilt-text-primary)]">From</span>{" "}
                and <span className="font-semibold text-[var(--ilt-text-primary)]">To</span>{" "}
                using the dropdowns. Quick pair chips help for common
                conversions.
              </p>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                2) Enter date and time
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Pick the day and type the time you mean. Use HH:MM, or enable
                Seconds for HH:MM:SS.
              </p>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                3) Read both sides
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                The result shows{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">From</span> and{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">To</span> times
                for the same instant, plus abbreviations when available.
              </p>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                4) Copy or share
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Copy creates a paste-ready record. Share copies a link that
                preserves your selections and inputs.
              </p>
            </div>
          </div>
        </div>

        {/* Examples with real numbers users see */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            Examples with real scenarios and numbers
          </h3>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            These scenarios are written the way people actually use a time zone
            converter. Each one includes concrete dates and times, plus what to
            copy or share.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Scenario 1 */}
            <div className="ilt-surface-card p-4">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Scenario 1: Scheduling a call from Toronto to London
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You want a call on{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  March 12, 2026
                </span>{" "}
                at <span className="font-semibold text-[var(--ilt-text-primary)]">09:30</span>{" "}
                Toronto time.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Setup
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    From:{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      America/Toronto
                    </span>{" "}
                    · To:{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      Europe/London
                    </span>{" "}
                    · Date:{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      2026-03-12
                    </span>{" "}
                    · Time:{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">09:30</span>
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    What you get
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    The To card shows the matching London local time for that
                    same instant. Use{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Copy</span>{" "}
                    to paste the From and To results into a chat or invite note,
                    so both sides see the same conversion.
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Speed trick
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Press{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">S</span> to
                    Swap and confirm the conversion direction quickly before you
                    send it.
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="ilt-surface-card p-4">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Scenario 2: A deadline that is “5:00 PM New York”
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                A form closes on{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  July 15, 2026
                </span>{" "}
                at <span className="font-semibold text-[var(--ilt-text-primary)]">17:00</span>{" "}
                New York time, and you are in Vancouver.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Setup
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    From:{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      America/New_York
                    </span>{" "}
                    · To:{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      America/Vancouver
                    </span>{" "}
                    · Date:{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      2026-07-15
                    </span>{" "}
                    · Time:{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">17:00</span>
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Why this matters
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    A one-hour mistake can mean missing the cutoff. Copy the
                    conversion output into your notes so you can treat the To
                    time as your personal “submit by” reminder.
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Practical tip
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Turn on Seconds if you are submitting close to the deadline
                    and want an exact boundary like{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      16:59:59
                    </span>{" "}
                    on your side.
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario 3 */}
            <div className="ilt-surface-card p-4">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Scenario 3: Travel plans, arrival time, and “what time is it at
                home?”
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Your flight lands in Tokyo on{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  October 8, 2026
                </span>{" "}
                at <span className="font-semibold text-[var(--ilt-text-primary)]">18:20</span>{" "}
                Tokyo local time and you want the matching Toronto time to plan
                a pickup message.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Setup
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    From:{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      Asia/Tokyo
                    </span>{" "}
                    · To:{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      America/Toronto
                    </span>{" "}
                    · Date:{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      2026-10-08
                    </span>{" "}
                    · Time:{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">18:20</span>
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Use Share
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    If you are coordinating with someone else, hit{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Share</span>{" "}
                    and send the link. They open it and see the same conversion
                    without you retyping anything.
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario 4 */}
            <div className="ilt-surface-card p-4">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Scenario 4: DST week confusion, solved by using the date
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You have a weekly sync, but the time relationship changes around
                daylight saving transitions. The fix is simple: convert the
                specific date, not “typical offset math”.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    What to do
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Enter the next meeting date and your usual local time. The
                    converter applies the correct rules for that week, even if
                    one region has already switched and the other has not.
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Why ISO helps
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    If there is any risk of ambiguity, copy the ISO line into
                    the invite description. It is a single instant that does not
                    change with display preferences.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copy format example */}
          <div className="mt-4 ilt-surface-card p-4">
            <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
              What “Copy” is designed to look like
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Copy is intentionally plain so it pastes cleanly into Slack,
              email, tickets, or meeting notes. It captures your intent and the
              result in one block, including the ISO timestamp. Example format:
            </p>

            <div className="mt-3 ilt-surface-muted p-3">
              <div className="font-mono text-xs text-[var(--ilt-text-primary)]">
                Time Zone Conversion
                <br />
                From: Toronto
                <br />
                To: London (UK)
                <br />
                Input: 2026-03-12 09:30
                <br />
                From time: Thu, Mar 12, 2026, 09:30 (ET)
                <br />
                To time: Thu, Mar 12, 2026, 13:30 (GMT)
                <br />
                ISO: 2026-03-12T13:30:00.000Z
              </div>
              <div className="mt-2 text-sm text-[var(--ilt-text-secondary)]">
                The exact text varies by your locale and the zones you choose,
                but the structure stays consistent: input, both outputs, and
                ISO.
              </div>
            </div>
          </div>
        </div>

        {/* Practical clarifications */}
        <div className="mt-6 ilt-surface-card p-4">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            Small choices that make conversions more reliable
          </h3>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Always set the date, even if you “know the offset”
              </div>
              <p className="mt-2 leading-relaxed">
                Offsets change across the year. When you set a concrete date,
                the tool applies the correct rule set for that day, which is
                exactly what you want for meetings and deadlines.
              </p>
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Use Now as a quick baseline
              </div>
              <p className="mt-2 leading-relaxed">
                Now is helpful when you want to convert the current moment and
                then adjust the time slightly. Tap Now, then change 09:00 to
                09:30 and you are done.
              </p>
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Use Swap to prevent “direction mistakes”
              </div>
              <p className="mt-2 leading-relaxed">
                Many errors come from converting the wrong direction. Swap is
                your one-key sanity check: if the reverse conversion does not
                match what you expect, you caught the mistake early.
              </p>
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Use Share when someone needs the exact setup
              </div>
              <p className="mt-2 leading-relaxed">
                If you are coordinating with another person, Share avoids “did
                you use the same date?” confusion. The link preserves From, To,
                date, time, and seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Technical content stays expandable */}
        <details className="group mt-6 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (DST edge cases, ISO, clipboard, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional details and troubleshooting for power users
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Ambiguous or missing local times
              </div>
              <p className="mt-1 leading-relaxed">
                During DST transitions, some local times can repeat (fall back)
                or not exist (spring forward). If you enter a time near a
                transition and the result looks unexpected, verify the date and
                time zone and consider copying the ISO value as your definitive
                reference.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                ISO is the common ground
              </div>
              <p className="mt-1 leading-relaxed">
                ISO represents one instant in time. Two people in different
                zones can render it differently, but the instant is identical,
                which is why it is useful for systems, logs, and tickets.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Clipboard permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Copy and Share use the browser clipboard API. If nothing copies,
                your browser may be blocking clipboard access. Click the page
                once, then try again.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser fullscreen API. Some browsers
                require a user gesture (a click) to enter fullscreen. Press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> to
                exit at any time.
              </p>
            </div>
          </div>
        </details>

        {/* Footer helper links, on-intent */}
        <div className="mt-6 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
          <span className="font-semibold text-[var(--ilt-text-primary)]">
            Want a different time tool?
          </span>{" "}
          For live “what time is it there right now?” across many cities, use{" "}
          <Link
            to="/world-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            World Clock
          </Link>
          . For a clean UTC reference, use{" "}
          <Link
            to="/utc-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            UTC Clock
          </Link>
          . For a large single clock display, use{" "}
          <Link
            to="/digital-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Digital Clock
          </Link>
          .
        </div>
      </div>
    </section>
  );
}
