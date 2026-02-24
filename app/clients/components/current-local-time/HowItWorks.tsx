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
   - Scenario-based with concrete examples for /current-local-time.
   - Tool-focused, not a blog post.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/current-local-time",
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
    name: "How to use the Current Local Time clock (fullscreen, copy, and quick compare)",
    description:
      "See your current local time in a big, readable clock. Toggle seconds and 12/24-hour time, go fullscreen for distance viewing, copy a clean timestamp, and quickly compare common time zones.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Open the clock and confirm your local zone",
        text: "Open the page to view a large clock using your device’s local time and timezone settings.",
      },
      {
        "@type": "HowToStep",
        name: "Choose your display format",
        text: "Toggle Seconds on/off and switch 12-hour or 24-hour time (use S, 1, and 2 as shortcuts).",
      },
      {
        "@type": "HowToStep",
        name: "Use fullscreen for distance viewing",
        text: "Press F or click Fullscreen to fill the screen with large digits. Press Esc to exit. In fullscreen, tap/click the time to copy quickly.",
      },
      {
        "@type": "HowToStep",
        name: "Copy a timestamp",
        text: "Press C or click Copy to place the current time, zone label, date, and ISO week number on your clipboard.",
      },
      {
        "@type": "HowToStep",
        name: "Quick compare another city",
        text: "Switch the main display to a common city (Toronto, New York, London) and glance at tiles for additional cities.",
      },
    ],
  };

  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-slate-900">
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
      className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-base font-semibold text-slate-900">{title}</div>
      {subtitle ? (
        <div className="mt-1 text-sm text-slate-600">{subtitle}</div>
      ) : null}
      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="whitespace-pre-wrap font-mono text-xs text-slate-800">
          {lines.join("\n")}
        </div>
      </div>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <JsonLd data={howToLd} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-sky-700">How it works</h2>

            <p className="mt-2 max-w-3xl leading-relaxed text-slate-700">
              This page shows your{" "}
              <span className="font-semibold text-slate-900">
                current local time
              </span>{" "}
              in a big, readable display. It is built for one job: make “what
              time is it right now?” obvious, fast, and easy to use in real
              situations. You can toggle seconds, switch between 12-hour and
              24-hour time, go fullscreen for distance viewing, and copy a clean
              timestamp that includes the time, a zone label, the full date, and
              the ISO week number.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              It also includes a quick compare mode. If you need to coordinate
              across common cities, you can flip the main display to Toronto,
              New York, or London and glance at tiles for additional places
              (Vancouver, Milan, Beijing). This is meant for “right now”
              coordination, not for planning a future time conversion. If you
              need to convert a specific scheduled time (for example “3:30 PM in
              London to Toronto”), use{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/time-zone-converter")}
              >
                Time Zone Converter
              </a>
              .
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              If you want a different style or a different reference clock, jump
              to a better fit:{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/world-clock")}
              >
                World Clock
              </a>{" "}
              for many cities at once,{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/utc-clock")}
              >
                UTC Clock
              </a>{" "}
              for UTC,{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/atomic-clock")}
              >
                Atomic Clock
              </a>{" "}
              for a “reference time” feel, or{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/military-time-converter")}
              >
                Military Time Converter
              </a>{" "}
              if you are converting formats rather than displaying a clock.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Local clock
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Seconds
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              12/24-hour
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Fullscreen
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Copy
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Quick compare
            </span>
          </div>
        </div>

        {/* Quick flow */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Fast use (what most people do)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
              <li>
                <span className="font-semibold text-slate-900">1)</span> Choose
                your display: toggle{" "}
                <span className="font-semibold text-slate-900">Seconds</span>{" "}
                and pick{" "}
                <span className="font-semibold text-slate-900">12-hour</span> or{" "}
                <span className="font-semibold text-slate-900">24-hour</span>{" "}
                time. Shortcut keys: <Kbd>S</Kbd>, <Kbd>1</Kbd>, <Kbd>2</Kbd>.
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> If you
                need a room display, press <Kbd>F</Kbd> for fullscreen (or click
                Fullscreen). Press <Kbd>Esc</Kbd> to exit.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> When
                you need a timestamp, click{" "}
                <span className="font-semibold text-slate-900">Copy</span> or
                press <Kbd>C</Kbd>. You can paste into notes, chat, or a log.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> For a
                quick “what time is it there?” check, switch the active zone to
                a city and use the tiles for comparisons.
              </li>
            </ol>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                What “Copy” is designed for
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Copy is for moments where you want a timestamp that is already
                readable and complete. It includes a zone label plus the date
                and ISO week number so it fits into weekly reporting and
                day-based logs without you typing extra context.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Typical uses: meeting notes (“decision recorded at 09:41:12”),
                classroom timestamps (“started quiz at 10:05”), streaming
                session labels (“take 3 begins 14:22:07”), and quick
                coordination across time zones (“it’s 17:30 in London now”).
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              When to show seconds vs hide seconds
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>
                <span className="font-semibold">Seconds ON</span>: you care
                about precise cues and quick timestamps (for example 09:41:12).
              </li>
              <li>
                <span className="font-semibold">Seconds OFF</span>: you only
                care at the minute level (for example 09:41) and want a calmer
                display.
              </li>
              <li>
                <span className="font-semibold">24-hour</span>: schedules, labs,
                operations boards, or any environment where “02:00” ambiguity is
                costly.
              </li>
              <li>
                <span className="font-semibold">12-hour</span>: general
                day-to-day reading, classrooms, and casual use.
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">Focus tip:</span>{" "}
              If shortcuts do nothing, click the clock card once first.
              Shortcuts also do not fire while you are typing in an input.
            </div>

            <div className="mt-3 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">
                If you need conversions:
              </span>{" "}
              quick compare is for “right now” checks. For scheduled conversions
              across dates and daylight saving rules, use Time Zone Converter.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-sky-700">
            What you are actually controlling on this page
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            The clock is always “now.” Your controls change how “now” is shown
            and how quickly you can reuse it. Seconds and 12/24-hour toggles are
            display preferences. Fullscreen is about readability and a cleaner
            presentation. Copy is about turning “now” into text you can paste
            into another place without reformatting. Quick compare is about
            reducing the mental effort of checking another city’s current time.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            A practical way to think about it: this page is for visibility and
            frictionless timestamps. If you find yourself doing mental math
            (“wait, is London five hours ahead right now?”), quick compare helps
            in seconds. If you need an exact conversion for a future time, use
            Time Zone Converter so you are not guessing across daylight saving
            changes.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-sky-700">
            Real scenarios with examples you can paste
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            These are realistic situations where people open a “current local
            time” page. The examples below show the kind of values you will see,
            and what a copied timestamp looks like in practice.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Meeting notes with clean timestamps"
              subtitle="You want quick inserts without typing date/time by hand"
              lines={[
                "Setup:",
                "- Turn Seconds ON so your timestamps are precise.",
                "- Keep 24-hour OFF if your notes are 12-hour, or enable it if your team uses 24-hour.",
                "",
                "During the call:",
                "- At a key moment, press C (or click Copy).",
                "- Paste directly into your notes or chat.",
                "",
                "Example paste format:",
                "09:41:12 (America/Toronto) - Friday, February 20, 2026 (week 8)",
                "",
                "How it reads in a note:",
                "- 09:41:12 Decision: ship with feature flag on",
                "- 09:52:30 Follow-up: schedule customer review",
                "",
                "Why this is useful:",
                "- You can later search your doc for the timestamp.",
                "- The week number helps weekly status logs and retrospectives.",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Classroom or workshop wall clock"
              subtitle="You want a simple, readable time source for the room"
              lines={[
                "Setup:",
                "- Press F to go fullscreen on the projector or TV.",
                "- Turn Seconds OFF for a calmer display that students can read quickly.",
                "",
                "Typical flow:",
                "- Before class: display shows 08:58",
                "- Start of class: display shows 09:00",
                "- Break begins: display shows 09:45",
                "",
                "Practical choice:",
                "- Seconds ON when you need precise starts (timed quiz begins at 10:05:00).",
                "- Seconds OFF when minute-level is enough (break ends at 10:15).",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Remote coordination across time zones"
              subtitle="You want a fast ‘right now’ check before messaging"
              lines={[
                "Example problem:",
                "- You are in Toronto and want to message someone in London.",
                "- You want to avoid sending at 02:00 their time.",
                "",
                "What you do:",
                "- Click London in quick compare.",
                "- Glance at the main display and the tiles.",
                "",
                "Example values you might see:",
                "- Toronto: 15:20",
                "- London: 20:20",
                "",
                "Decision:",
                "- 20:20 is fine for a quick message, but maybe not for a long call.",
                "- If you are scheduling a call for next week, use Time Zone Converter instead.",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: 24-hour time for logs and operations"
              subtitle="You want unambiguous times that copy cleanly"
              lines={[
                "Setup:",
                "- Turn 24-hour ON.",
                "- Turn Seconds ON if you want precise incident notes.",
                "",
                "Example log style:",
                "14:03:18 (America/Vancouver) - Wednesday, March 12, 2026 (week 11)",
                "",
                "Why 24-hour helps:",
                "- 02:15 vs 14:15 confusion disappears.",
                "- It matches many shift schedules and lab notebooks.",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Streaming or recording reference clock"
              subtitle="You need a visible ‘time now’ and quick labels"
              lines={[
                "Setup:",
                "- Seconds ON.",
                "- Fullscreen ON for a clean display on a second monitor.",
                "",
                "During recording:",
                "- Press C at the start of a take to capture a label.",
                "",
                "Example:",
                "18:22:07 (Local) - Saturday, April 04, 2026 (week 14)",
                "",
                "Use:",
                "- Paste into a note: “Take 3 start 18:22:07”.",
                "- Paste into a file naming template or marker list.",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: Choosing the right time tool fast"
              subtitle="A simple decision rule so you do not fight the wrong page"
              lines={[
                "Use Current Local Time when:",
                "- You want a big ‘time now’ display.",
                "- You want quick copy/paste timestamps.",
                "- You want quick ‘right now’ checks for common cities.",
                "",
                "Switch to World Clock when:",
                "- You want multiple cities visible at the same time.",
                "",
                "Switch to Time Zone Converter when:",
                "- You need to convert a scheduled time across zones or dates.",
                "",
                "Switch to UTC Clock when:",
                "- You want UTC specifically (logs, systems, coordination).",
              ]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen and shortcuts (built for fast control)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen exists so the clock stays readable from a distance. It
              also makes copying easier in “hands-off” contexts. When the page
              is fullscreen, you can tap or click the time readout to copy
              without aiming for a button. Shortcuts are there so you can keep
              moving: <Kbd>F</Kbd> for fullscreen, <Kbd>C</Kbd> to copy,{" "}
              <Kbd>S</Kbd> for seconds, and <Kbd>1</Kbd>/<Kbd>2</Kbd> for
              12-hour or 24-hour.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>F</Kbd> fullscreen
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>C</Kbd> copy
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>S</Kbd> seconds
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>1</Kbd> 12-hour
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>2</Kbd> 24-hour
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>Esc</Kbd> exit
              </span>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Focus tip:</span>{" "}
              If shortcuts do not respond, click the clock card once so it has
              keyboard focus. Shortcuts will not fire while you are typing into
              an input.
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Related tools (same intent, different fit)
              </div>
              <p className="mt-1 text-sm text-slate-700">
                This page is optimized for a readable “time now” display, quick
                copy, and fast comparisons. If your task needs a different view,
                these are better matches.
              </p>
            </div>
            <div className="text-xs text-slate-600">
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
            <PillLink href={abs("/digital-clock")}>Digital Clock</PillLink>
            <PillLink href={abs("/minimalist-clock")}>
              Minimalist Clock
            </PillLink>
            <PillLink href={abs("/military-time-converter")}>
              Military Time Converter
            </PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical details (local time source, zones, fullscreen, copy)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Notes that matter when you rely on a browser clock
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Where “Local” time comes from
              </div>
              <p className="mt-1 leading-relaxed">
                Local time is based on your device clock and timezone settings.
                If your device time or timezone is incorrect (including daylight
                saving rules on a misconfigured device), this page will reflect
                that incorrect setting. Fix the device, and the display will
                match.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                How city times are computed
              </div>
              <p className="mt-1 leading-relaxed">
                City comparisons are formatted using the browser’s timezone
                database via{" "}
                <span className="font-semibold text-slate-900">
                  Intl.DateTimeFormat
                </span>{" "}
                with a specific timezone (for example{" "}
                <span className="font-semibold text-slate-900">
                  America/Toronto
                </span>
                ). Formatting can vary slightly across older browsers and older
                operating systems.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Update cadence and “steady” displays
              </div>
              <p className="mt-1 leading-relaxed">
                With seconds enabled, the clock updates frequently so the
                readout stays responsive. With seconds disabled, updates align
                to minute boundaries to reduce unnecessary visual change.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen and clipboard permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API and may require a
                user gesture (click/tap). Clipboard copy can be restricted by
                browser policy in some contexts. If copy fails, click the page
                once and try again.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                What “ISO week number” means here
              </div>
              <p className="mt-1 leading-relaxed">
                The week number included in Copy is the ISO week of the year
                (weeks start on Monday). It is included because many teams file
                notes and reports by week (for example “week 8”) and want a
                timestamp that already carries that context.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              Need many cities visible?
            </strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/world-clock")}
            >
              World Clock
            </a>{" "}
            for a multi-city layout.
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              Need scheduled conversions?
            </strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/time-zone-converter")}
            >
              Time Zone Converter
            </a>{" "}
            when you are converting a specific future time.
          </div>
        </div>
      </div>
    </section>
  );
}
