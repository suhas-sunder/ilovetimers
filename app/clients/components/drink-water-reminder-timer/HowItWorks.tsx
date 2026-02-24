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
   - Water Reminder Timer intent: repeating interval reminders, optional sound,
     fullscreen display, "remind now", keyboard shortcuts.
   - Tool-focused, not a blog post.
   - Scenario-based with concrete example numbers users will experience here.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/water-reminder-timer",
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
    name: "How to use the Water Reminder Timer (repeating hydration reminders)",
    description:
      "Use the Water Reminder Timer to run repeating drink-water reminders at a set interval while the tab is open. Choose an interval, start/pause, toggle sound, use fullscreen for a clean display, and trigger an instant reminder with Remind now.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose a reminder interval",
        text: "Select a preset interval (15–120 minutes) or enter a custom number of minutes (5–360). Interval changes reset the current cycle and the reminders count to keep cycles consistent.",
      },
      {
        "@type": "HowToStep",
        name: "Start the repeating countdown",
        text: "Press Start to begin. When the countdown reaches zero, a reminder fires and the timer automatically restarts the next cycle.",
      },
      {
        "@type": "HowToStep",
        name: "Toggle sound and fullscreen",
        text: "Turn sound on or off depending on your environment. Use fullscreen for a big, readable display and quick tap-to-start/pause control.",
      },
      {
        "@type": "HowToStep",
        name: "Use Remind now when you need it",
        text: "While running, Remind now triggers an immediate reminder and restarts a full interval from that moment.",
      },
      {
        "@type": "HowToStep",
        name: "Use keyboard shortcuts for quick control",
        text: "Space start/pause, N remind now, R reset all, F fullscreen, S sound toggle, Esc exit fullscreen. If shortcuts do nothing, click the timer card once to focus it.",
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
              <span className="font-semibold text-slate-900">
                Water Reminder Timer
              </span>{" "}
              is a repeating countdown that keeps cycling while this tab is
              open. You pick an interval (like 30 minutes or 60 minutes), press
              Start, and the page counts down to your next reminder. When the
              timer hits zero, it fires a reminder and immediately starts the
              next cycle using the same interval.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              This page is designed for practical day-to-day use, not a long
              article about hydration. The focus is simple: set a rhythm you can
              follow while you work, study, or run errands on your computer. You
              can keep it quiet (sound off), turn on a gentle beep (sound on),
              go fullscreen for a clean display, and trigger an instant reminder
              with{" "}
              <span className="font-semibold text-slate-900">Remind now</span>{" "}
              when you want to restart your cycle from the current moment.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              The key limitation to know up front: this runs in your browser and
              is most reliable when the page stays open and active. Background
              tabs and locked devices can delay timing because browsers reduce
              update frequency to save battery and CPU. If you need reminders
              that fire even after closing the page, you want device or app
              notifications instead.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Repeating cycles
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Presets + custom
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Optional sound
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Fullscreen
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Remind now
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Shortcuts
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
                <span className="font-semibold text-slate-900">1)</span> Pick an{" "}
                <span className="font-semibold text-slate-900">Interval</span>{" "}
                (for example 45m or 60m). Presets are the fastest way to start.
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> Toggle{" "}
                <span className="font-semibold text-slate-900">Sound</span>{" "}
                depending on your environment, then press{" "}
                <span className="font-semibold text-slate-900">Start</span> (or
                press <Kbd>Space</Kbd>).
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> When a
                reminder fires, the timer automatically restarts the full
                interval. You do not need to click anything.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> If you
                want an immediate prompt, press <Kbd>N</Kbd> (or click{" "}
                <span className="font-semibold text-slate-900">Remind now</span>
                ) and the cycle restarts from that moment.
              </li>
              <li>
                <span className="font-semibold text-slate-900">5)</span> For a
                clean display, press <Kbd>F</Kbd> to go fullscreen. Press{" "}
                <Kbd>Esc</Kbd> to exit.
              </li>
            </ol>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                What “Reminders” counts
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                The{" "}
                <span className="font-semibold text-slate-900">Reminders</span>{" "}
                number is a simple counter of how many reminder events have
                fired since the last “Reset all” or interval change. It includes
                reminders from the timer reaching zero, and also includes{" "}
                <span className="font-semibold text-slate-900">Remind now</span>{" "}
                triggers. This is useful if you are trying to keep a rough pace
                across a work block without tracking anything elsewhere.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              A quick checklist for a smooth run
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>
                If sound matters, interact once (click/tap/press a key) so the
                browser allows audio playback.
              </li>
              <li>
                Keep the tab open. Background tabs can delay reminders due to
                power-saving throttling.
              </li>
              <li>
                Interval controls are disabled while running. Pause or reset
                first, then change the interval.
              </li>
              <li>
                If shortcuts do nothing, click the timer card once to focus it.
                Shortcuts do not fire while typing in a form field.
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">
                Shortcut set:
              </span>{" "}
              <Kbd>Space</Kbd> start/pause, <Kbd>N</Kbd> remind now,{" "}
              <Kbd>R</Kbd> reset all, <Kbd>F</Kbd> fullscreen, <Kbd>S</Kbd>{" "}
              sound, <Kbd>Esc</Kbd> exit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-sky-700">
            What you can control (and what stays automatic)
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            You control the interval, whether sound is on, and whether you are
            using fullscreen. Everything else is automatic. When the countdown
            hits zero, a reminder fires and the timer immediately starts the
            next interval without asking you to restart it. That repeating loop
            is the whole point of this page. It is built for ongoing reminders,
            not one-off countdowns.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            There are two reset behaviors.{" "}
            <span className="font-semibold text-slate-900">Reset cycle</span>{" "}
            restarts the countdown for the current interval without clearing the
            reminder count.{" "}
            <span className="font-semibold text-slate-900">Reset all</span>{" "}
            restarts the countdown and clears the reminder count back to zero.
            Interval changes behave like a clean restart: the page resets the
            cycle and clears the count to avoid mixing different intervals in
            the same “progress” number.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-sky-700">
            Scenarios with examples (real timing you will experience)
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            These scenarios are written to match how people actually use this
            page. The numbers are intentionally concrete so you can recognize
            the behavior immediately.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Desk work with a 60-minute loop"
              subtitle="A simple rhythm for a workday while the tab is open"
              lines={[
                "Setup:",
                "- Interval: 60m",
                "- Sound: On",
                "- Start at: 09:10",
                "",
                "What happens (example schedule):",
                "- 10:10 reminder fires (Reminders = 1), cycle restarts to 60:00",
                "- 11:10 reminder fires (Reminders = 2), cycle restarts to 60:00",
                "- 12:10 reminder fires (Reminders = 3), cycle restarts to 60:00",
                "",
                "What you see on the page:",
                "- Status: Next reminder in (running)",
                "- Countdown: 59:59 ... 00:01 ... 0:00 then resets to 60:00",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Shorter interval during focused study"
              subtitle="A tighter loop that is easy to follow without thinking"
              lines={[
                "Setup:",
                "- Interval: 30m",
                "- Sound: Off (quiet room)",
                "- Use fullscreen on a second monitor",
                "",
                "Example timing:",
                "- Start at 14:05",
                "- Reminders at 14:35, 15:05, 15:35",
                "",
                "Tip:",
                "- Press F for fullscreen",
                "- Tap/click the display to start/pause in fullscreen",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: You missed a cycle and want to restart now"
              subtitle="Using Remind now to reset the rhythm to the present"
              lines={[
                "Setup:",
                "- Interval: 45m",
                "- Running, but you stepped away",
                "",
                "Example:",
                "- It is 16:22 and you want a reminder right now",
                "- Press N (or click Remind now)",
                "",
                "Result:",
                "- Reminder fires immediately (Reminders +1)",
                "- Countdown resets to 45:00 starting from 16:22",
                "- Next reminder arrives at about 17:07",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Reset cycle vs Reset all (what changes)"
              subtitle="Two resets for two different intents"
              lines={[
                "Setup:",
                "- Interval: 60m",
                "- Reminders currently: 5",
                "",
                "Reset cycle:",
                "- Countdown returns to 60:00",
                "- Reminders stays at 5",
                "",
                "Reset all:",
                "- Countdown returns to 60:00",
                "- Reminders becomes 0",
                "",
                "Good rule:",
                "- Use Reset cycle when you want a clean countdown now.",
                "- Use Reset all when you want to restart your 'progress' counter.",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Background tab behavior (why reminders may drift)"
              subtitle="What it feels like in real browsers"
              lines={[
                "Setup:",
                "- Interval: 20m",
                "- You switch away for a long time",
                "",
                "Example:",
                "- Start at 10:00",
                "- You put the laptop to sleep at 10:05",
                "- You open the tab again at 10:40",
                "",
                "What can happen:",
                "- The reminder may fire late (when the tab becomes active again)",
                "- The timer restarts its next cycle from 'now' when it fires",
                "",
                "If you need guaranteed reminders while away:",
                "- Use device notifications, not a browser tab.",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: Pairing hydration with other habits"
              subtitle="When one loop is not enough"
              lines={[
                "Example setup:",
                "- Water Reminder: 60m",
                "- Stretch reminder: 90m",
                "",
                "Best match:",
                "- Use Multiple Timers to run both at once",
                "- Keep this page for a single simple hydration loop",
              ]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen and shortcuts (fast control, low friction)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen exists to make the timer readable at a distance, and
              shortcuts exist so you can control it without hunting for buttons.
              Use <Kbd>Space</Kbd> to start/pause, <Kbd>N</Kbd> for Remind now,
              <Kbd>S</Kbd> to toggle sound, and <Kbd>F</Kbd> for fullscreen.
              Press <Kbd>R</Kbd> for Reset all. If shortcuts do nothing, click
              the timer card once so it has focus.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>Space</Kbd> start/pause
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>N</Kbd> remind now
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>S</Kbd> sound
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>F</Kbd> fullscreen
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>R</Kbd> reset all
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>Esc</Kbd> exit
              </span>
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Related tools (same ecosystem, different intent)
              </div>
              <p className="mt-1 text-sm text-slate-700">
                If you want a different reminder style, a one-off timer, or
                multiple timers at once, these are better matches.
              </p>
            </div>
            <div className="text-xs text-slate-600">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>N</Kbd> <Kbd>S</Kbd> <Kbd>F</Kbd>{" "}
              <Kbd>R</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/silent-timer")}>Silent Timer</PillLink>
            <PillLink href={abs("/countdown-timer")}>Countdown Timer</PillLink>
            <PillLink href={abs("/multiple-timers")}>Multiple Timers</PillLink>
            <PillLink href={abs("/fullscreen-timer")}>
              Fullscreen Timer
            </PillLink>
            <PillLink href={abs("/break-timer")}>Break Timer</PillLink>
            <PillLink href={abs("/stretch-timer")}>Stretch Timer</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical details (timing, sound, fullscreen, browser limits)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Notes that matter if you rely on precise cadence or audible
                reminders
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Timing model</div>
              <p className="mt-1 leading-relaxed">
                The countdown is computed from an “end time” and the current
                high-resolution clock value. The UI updates frequently while the
                timer is running so the display feels responsive. When the timer
                hits zero, the page increments the reminder count and
                immediately schedules the next cycle from the current moment.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Background throttling
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers often throttle background tabs and timers to save
                resources. That means the displayed countdown and reminder
                firing can be delayed when the tab is not active, the device is
                locked, or the system is under power-saving constraints.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Sound behavior</div>
              <p className="mt-1 leading-relaxed">
                Sound uses a short WebAudio beep. Many browsers block audio
                until a user gesture occurs, so if you turn sound on and hear
                nothing, click/tap the page once and try again. The sound toggle
                only affects future reminders.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API and updates state on
                fullscreen changes. Most browsers require a user gesture
                (click/tap) to enter fullscreen, and <Kbd>Esc</Kbd> exits.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              Need several reminders at once?
            </strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/multiple-timers")}
            >
              Multiple Timers
            </a>{" "}
            to run hydration plus break or stretch reminders side-by-side.
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              Need a single timer that ends?
            </strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/countdown-timer")}
            >
              Countdown Timer
            </a>{" "}
            for one-off timing instead of repeating cycles.
          </div>
        </div>
      </div>
    </section>
  );
}
