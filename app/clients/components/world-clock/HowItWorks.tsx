// app/clients/components/world-clock/HowItWorks.tsx
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
   HOW IT WORKS (World Clock)
   Goal: user-intent first, SEO-friendly, unique, practical
   Target: 800 to 1200 words of real help + examples
========================================================= */
export default function HowItWorks({
  baseUrl = "https://www.ilovetimers.com",
}: {
  baseUrl?: string;
}) {
  const pageUrl = `${baseUrl}/world-clock`;

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use a live world clock to compare cities",
    description:
      "Use World Clock to see the current time in multiple cities at once. Add or remove cities, search by city or time zone, toggle 12/24-hour time and seconds, copy a shareable list, and use fullscreen with keyboard shortcuts.",
    url: pageUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Pick the cities you care about",
        text: "Use the Popular list to select cities. Selected cities appear as cards with large live times.",
      },
      {
        "@type": "HowToStep",
        name: "Use Search to find a city or region quickly",
        text: "Type a city name or a region like America or Europe to filter the list, then click the chip to select it.",
      },
      {
        "@type": "HowToStep",
        name: "Choose your display format",
        text: "Toggle 24-hour time and seconds depending on how you prefer to read times.",
      },
      {
        "@type": "HowToStep",
        name: "Copy or go fullscreen",
        text: "Use Copy to paste a clean list into messages or notes, or use Fullscreen for a big, glanceable display.",
      },
      {
        "@type": "HowToStep",
        name: "Use shortcuts to move faster",
        text: "Press F for fullscreen, T for 24-hour, S for seconds, C for copy, R to reset, X to clear, and Esc to exit fullscreen.",
      },
    ],
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <JsonLd data={howToLd} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-sky-700">How it works</h2>
          <p className="mt-1 text-sm text-slate-600">
            World Clock is built for one job: show the current time in several
            cities, clearly, without forcing you to do mental offsets. It is
            designed for scheduling, coordination, and quick “is it a reasonable
            hour there?” checks. You can add cities, search, toggle 12/24-hour
            time and seconds, copy a clean list for sharing, and switch to
            fullscreen when you want a big, distraction-free display.
          </p>
        </div>

        {/* Core explanation (SEO + intent, no fluff) */}
        <div className="mt-4 grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
            <p className="leading-relaxed">
              This page shows your{" "}
              <span className="font-semibold text-slate-900">local time</span>{" "}
              and a set of selected city cards. Each card is tied to an official
              time zone identifier (for example{" "}
              <span className="font-semibold text-slate-900">
                America/Toronto
              </span>
              ), so the displayed time updates correctly when daylight saving
              time changes. You are not “adding or subtracting hours” here. You
              are selecting locations, and the browser formats the time for each
              location live.
            </p>
            <p className="mt-3 leading-relaxed">
              You can keep the clock lightweight by hiding seconds, or turn
              seconds on when precision matters. Either way, the display updates
              automatically. You can also copy your selected list as plain text,
              which is useful when you need to send a quick time check to a
              teammate without screenshots.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                1) Select cities
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Click chips under{" "}
                <span className="font-semibold text-slate-900">Popular</span> to
                add or remove cities. Selected cities show up as cards.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                2) Search quickly
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Type a city name or region text like{" "}
                <span className="font-semibold text-slate-900">Europe</span> or{" "}
                <span className="font-semibold text-slate-900">America</span> to
                narrow the list, then click the city chip.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                3) Set format
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Toggle{" "}
                <span className="font-semibold text-slate-900">24-hour</span>{" "}
                and{" "}
                <span className="font-semibold text-slate-900">Seconds</span>{" "}
                based on how you read times and how precise you need to be.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                4) Copy or fullscreen
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Use Copy to share your list as text, or Fullscreen for a big
                view that works well on a second monitor.
              </p>
            </div>
          </div>
        </div>

        {/* Examples with real numbers users see */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-sky-700">
            Examples with real scenarios and numbers
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            These examples mirror what people actually do with a world clock.
            The times are concrete so you can see how the page helps you avoid
            common mistakes.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Scenario A */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900">
                Scenario A: Booking a call across Toronto, London, and Tokyo
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                You are in Toronto and want to propose a time that is not
                painful for London and Tokyo. You add{" "}
                <span className="font-semibold text-slate-900">Toronto</span>,{" "}
                <span className="font-semibold text-slate-900">London</span>,
                and <span className="font-semibold text-slate-900">Tokyo</span>.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    What you do on this page
                  </div>
                  <div className="mt-1 text-slate-700">
                    Toggle{" "}
                    <span className="font-semibold text-slate-900">
                      24-hour
                    </span>{" "}
                    on to reduce AM/PM slips. Keep{" "}
                    <span className="font-semibold text-slate-900">
                      Seconds
                    </span>{" "}
                    off for a calmer display while you decide.
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Example check (numbers)
                  </div>
                  <div className="mt-1 text-slate-700">
                    If Toronto shows{" "}
                    <span className="font-semibold text-slate-900">09:30</span>,
                    London might show{" "}
                    <span className="font-semibold text-slate-900">14:30</span>,
                    and Tokyo might show{" "}
                    <span className="font-semibold text-slate-900">23:30</span>.
                    You immediately see that a “morning Toronto” meeting becomes
                    late evening in Tokyo.
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    What to do next
                  </div>
                  <div className="mt-1 text-slate-700">
                    If you need to convert a specific proposed time (for example
                    “Tuesday 10:00 Toronto”), use{" "}
                    <Link
                      to="/time-zone-converter"
                      className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                    >
                      Time Zone Converter
                    </Link>{" "}
                    to get a precise mapping.
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario B */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900">
                Scenario B: Daily coordination with a small “core” city set
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                You work with two teams and one client region every day. Instead
                of scrolling through a long list, you keep a stable set of 4 to
                6 cities that you can scan in one glance.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Example city set
                  </div>
                  <div className="mt-1 text-slate-700">
                    Toronto (you), New York (US East), Los Angeles (US West),
                    London (EU), Singapore (APAC).
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Why it helps (numbers)
                  </div>
                  <div className="mt-1 text-slate-700">
                    If Toronto reads{" "}
                    <span className="font-semibold text-slate-900">16:05</span>,
                    Los Angeles might be{" "}
                    <span className="font-semibold text-slate-900">13:05</span>.
                    That quick difference helps you avoid sending “quick end of
                    day” requests to the West Coast while they still have a full
                    afternoon.
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Presentation tip
                  </div>
                  <div className="mt-1 text-slate-700">
                    Click{" "}
                    <span className="font-semibold text-slate-900">
                      Fullscreen
                    </span>{" "}
                    for a wall-board view on a second monitor. Press{" "}
                    <span className="font-semibold text-slate-900">F</span> to
                    toggle it quickly.
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario C */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900">
                Scenario C: Copy a “right now” time snapshot into a message
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                You are trying to coordinate quickly in chat. Instead of typing
                times manually, you select the cities and copy the list.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    What Copy produces
                  </div>
                  <div className="mt-1 text-slate-700">
                    A plain-text list like:
                    <div className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900">
                      Toronto: 09:30 (America/Toronto)
                      <br />
                      London: 14:30 (Europe/London)
                      <br />
                      Tokyo: 23:30 (Asia/Tokyo)
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    When to use seconds
                  </div>
                  <div className="mt-1 text-slate-700">
                    If you are syncing a handoff (for example “start exactly at
                    10:00”), turn seconds on so you can see the boundary
                    clearly.
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario D */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900">
                Scenario D: Avoid a DST surprise without doing any math
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Daylight saving time changes are where manual offsets fail. This
                page relies on time zones, so the displayed times remain correct
                when regions shift.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    What you do
                  </div>
                  <div className="mt-1 text-slate-700">
                    Keep the cities you coordinate with selected year-round.
                    When DST changes, the displayed time relationships update
                    automatically, and you do not need to remember which region
                    changed this week.
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Useful companion
                  </div>
                  <div className="mt-1 text-slate-700">
                    If you work from a UTC schedule, keep{" "}
                    <Link
                      to="/utc-clock"
                      className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                    >
                      UTC Clock
                    </Link>{" "}
                    open and treat UTC as your anchor.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Practical clarifications */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-sky-700">
            Small choices that make the page more useful
          </h3>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Use 24-hour time for scheduling
              </div>
              <p className="mt-2 leading-relaxed">
                If you frequently message “10am or 10pm?”, 24-hour time removes
                that ambiguity. You can still switch back to 12-hour when you
                prefer it for casual checking.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Keep seconds off unless they matter
              </div>
              <p className="mt-2 leading-relaxed">
                Seconds are helpful for precision, but most people coordinate in
                minutes. Turning seconds off reduces visual noise and updates
                the display on the minute boundary.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Use Reset and Clear strategically
              </div>
              <p className="mt-2 leading-relaxed">
                Reset is useful when you want to return to a known “starter
                set.” Clear is useful when you are building a new set for a
                one-off project or a trip.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Use fullscreen as a dashboard
              </div>
              <p className="mt-2 leading-relaxed">
                Fullscreen is not just a novelty. It is a practical display mode
                for a second screen, a shared workspace monitor, or when you are
                presenting times during a call.
              </p>
            </div>
          </div>
        </div>

        {/* Technical content stays expandable */}
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (updates, formatting, copy, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional details and troubleshooting for power users
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Update timing</div>
              <p className="mt-1 leading-relaxed">
                With seconds enabled, the clock updates on the next second
                boundary so it stays visually aligned. With seconds disabled, it
                updates on the next minute boundary.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Time zone formatting
              </div>
              <p className="mt-1 leading-relaxed">
                City cards are formatted using standard IANA time zones. The
                “Zone label” line is a simplified label to help scanning. The
                full time zone remains visible for clarity.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Copy permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Copy uses the browser clipboard API. If copy does nothing, your
                browser may be blocking clipboard access. Try clicking the page
                once, then press Copy again.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Fullscreen behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser fullscreen API. Some browsers
                require a direct click gesture to enter fullscreen. Press Esc to
                exit at any time.
              </p>
            </div>
          </div>
        </details>

        {/* Footer helper links, on-intent */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <span className="font-semibold text-slate-900">
            Need a different tool?
          </span>{" "}
          For converting a specific scheduled time, use{" "}
          <Link
            to="/time-zone-converter"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Zone Converter
          </Link>
          . For a UTC anchor, use{" "}
          <Link
            to="/utc-clock"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            UTC Clock
          </Link>
          . For a single big clock view, use{" "}
          <Link
            to="/digital-clock"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Digital Clock
          </Link>
          .
        </div>
      </div>
    </section>
  );
}
