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
   - Meditation Timer intent: calm fullscreen countdown for meditation, breathwork blocks, yoga holds
   - Tool-focused, not a meditation guide
   - Scenario-based with concrete numbers users will see on this page
   - Technical details live in an expandable section
   - Aim: ~800–1200 words of unique, intent-matching content
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/meditation-timer",
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
    name: "How to use the Meditation Timer (fullscreen countdown, presets, optional sound, end chime, loop)",
    description:
      "Set a calm countdown for meditation, breathing exercises, or yoga. Choose a preset or set minutes and seconds, start or pause, use fullscreen for a large display, optionally enable sound, final 5-second beeps, end chime, and loop for repeated sessions.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose a duration",
        text: "Pick a meditation preset (like 10m or 20m), choose a breathing preset, or set custom minutes and extra seconds.",
      },
      {
        "@type": "HowToStep",
        name: "Choose your finish cues",
        text: "Keep the timer silent or enable Sound. If Sound is on, you can enable Final beeps (last 5 seconds) and End chime (at 0:00).",
      },
      {
        "@type": "HowToStep",
        name: "Start the countdown",
        text: "Press Start to begin. You can pause anytime and Reset to return to the full duration you set.",
      },
      {
        "@type": "HowToStep",
        name: "Use fullscreen and shortcuts",
        text: "Press F to toggle fullscreen and Esc to exit. Space starts/pauses, R resets, S toggles sound, and L toggles loop.",
      },
    ],
  };

  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-slate-900">
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
      className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
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
                Meditation Timer
              </span>{" "}
              is built for one job: a calm, easy-to-read countdown you can start
              instantly for meditation, breathing blocks, or yoga. Instead of
              complicated programs or training plans, you get a simple flow:
              pick a duration, press start, and let the countdown run. When you
              want the cleanest experience, go fullscreen and use the timer as a
              large, minimal display you can see from across the room.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              This page stays tool-focused. It does not try to teach techniques
              or tell you what to practice. It helps you run timing reliably,
              with options that match real use: quick presets, custom minutes
              plus extra seconds for precision, a reset that returns you to the
              full duration, optional sound cues, and a loop mode for repeating
              short sessions without touching controls every time.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              A practical detail: the time display automatically sizes to fit
              your screen. On a phone, it stays readable at arm’s length. On a
              laptop, it fills the card. In fullscreen, it expands so you can
              glance at it without squinting, which is useful when your device
              is on a table, a yoga mat, or a shelf.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Presets
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Custom minutes
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Extra seconds
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Fullscreen
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Loop
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Sound
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              End chime
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Final beeps
            </span>
          </div>
        </div>

        {/* Quick flow */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Quick use (what most people do)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
              <li>
                <span className="font-semibold text-slate-900">1)</span> Pick a{" "}
                <span className="font-semibold text-slate-900">preset</span>{" "}
                (for example 10m, 15m, or 20m), or set{" "}
                <span className="font-semibold text-slate-900">
                  Custom minutes
                </span>{" "}
                plus{" "}
                <span className="font-semibold text-slate-900">
                  + extra seconds
                </span>
                .
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> Decide
                whether you want it{" "}
                <span className="font-semibold text-slate-900">silent</span> or
                with an{" "}
                <span className="font-semibold text-slate-900">end cue</span>.
                If you turn Sound on, you can choose End chime, Final beeps, or
                both.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> Press{" "}
                <span className="font-semibold text-slate-900">Start</span>. You
                can pause any time and resume without losing your selected
                duration.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> For a
                clean display, press <Kbd>F</Kbd> to go fullscreen. In
                fullscreen, you can also{" "}
                <span className="font-semibold text-slate-900">
                  tap/click the time
                </span>{" "}
                to start or pause.
              </li>
              <li>
                <span className="font-semibold text-slate-900">5)</span> If you
                want repeated blocks, toggle{" "}
                <span className="font-semibold text-slate-900">Loop</span> on.
                Exit fullscreen with <Kbd>Esc</Kbd>.
              </li>
            </ol>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                What Reset does here (so there are no surprises)
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Reset stops the countdown and returns to the{" "}
                <span className="font-semibold text-slate-900">
                  full duration you set
                </span>
                . For example, if you started a 12:00 session and paused at 7:35
                remaining, Reset brings you back to{" "}
                <span className="font-semibold text-slate-900">12:00</span>{" "}
                ready to start again. Your options like Sound, End chime, Final
                beeps, and Loop remain as you set them.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Practical checklist
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>
                For a calm experience, start with Sound{" "}
                <span className="font-semibold text-slate-900">off</span>.
              </li>
              <li>
                If you want a finish cue without beeps, turn on{" "}
                <span className="font-semibold text-slate-900">Sound</span> and
                enable{" "}
                <span className="font-semibold text-slate-900">End chime</span>{" "}
                only.
              </li>
              <li>
                If you want a gentle heads-up, enable{" "}
                <span className="font-semibold text-slate-900">
                  Final beeps
                </span>{" "}
                to hear soft beeps in the last{" "}
                <span className="font-semibold text-slate-900">5 seconds</span>.
              </li>
              <li>
                If you do not hear sound cues, some browsers require a user
                gesture first. Press Start once, then try again.
              </li>
              <li>
                If shortcuts do nothing, click the timer card once so it has
                focus.
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">Shortcuts:</span>{" "}
              <Kbd>Space</Kbd> start/pause, <Kbd>R</Kbd> reset, <Kbd>F</Kbd>{" "}
              fullscreen, <Kbd>S</Kbd> sound, <Kbd>L</Kbd> loop, <Kbd>Esc</Kbd>{" "}
              exit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-sky-700">
            What this timer is optimized for
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            Meditation and breathwork usually fail for simple reasons: you are
            checking the clock too often, the display is too small, or the
            ending is unclear. This page focuses on solving those issues with
            minimal controls. You get a big readable countdown, a fullscreen
            mode that keeps the layout clean, and optional finish cues so you
            can stay present without counting minutes in your head.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            The presets are there to reduce friction. Many sessions are
            predictable: 5 minutes to settle, 10 minutes for a daily sit, 20
            minutes when you have time, or 3 to 5 minutes for a breathwork
            block. When you need precision, custom minutes plus extra seconds
            makes it easy to run{" "}
            <span className="font-semibold text-slate-900">1:30</span> holds,
            short rests, or a specific block length like{" "}
            <span className="font-semibold text-slate-900">7:45</span>.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            Loop exists for repetition. Some people repeat short windows, like a
            3-minute breathing block several times. With Loop on, the timer will
            restart automatically at{" "}
            <span className="font-semibold text-slate-900">0:00</span> using the
            same duration. If you prefer a single “one and done” session, leave
            Loop off.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-sky-700">
            Scenarios with concrete numbers (what you will experience here)
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            These examples use values you can select on this page. They are
            intentionally practical and match what you will see on screen.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: A 10-minute daily sit, silent and fullscreen"
              subtitle="Simple setup with zero distractions."
              lines={[
                "Settings:",
                "- Preset: 10m",
                "- Sound: Off",
                "- Loop: Off",
                "",
                "What you will see:",
                "- Status shows Ready, then Running",
                "- Large countdown: 10:00 → 0:00",
                "",
                "How people typically run it:",
                "- Press F to enter fullscreen",
                "- Press Space to start",
                "- Press Esc to exit when finished",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: 12 minutes with a clean finish cue (end chime only)"
              subtitle="You want silence during the session, but a clear endpoint."
              lines={[
                "Settings:",
                "- Preset: 12m",
                "- Sound: On",
                "- End chime: On",
                "- Final beeps: Off",
                "- Loop: Off",
                "",
                "What you will experience:",
                "- Silent countdown until the end",
                "- A gentle chime plays at 0:00",
                "",
                "Example timing:",
                "- Start at 12:00",
                "- If you pause at 7:20, Resume continues from 7:20",
                "- Reset returns to 12:00",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: A quick reset between meetings (2 minutes)"
              subtitle="Fast, repeatable, no setup friction."
              lines={[
                "Settings:",
                "- Preset: 2m",
                "- Sound: Off (or End chime On if you want a finish cue)",
                "",
                "What you will see:",
                "- 2:00 → 0:00 in a single clean block",
                "",
                "Real-world use:",
                "- Hit Space to start while you sit down",
                "- If interrupted, Space pauses instantly",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Box breathing practice window (5 minutes) with gentle heads-up"
              subtitle="You want to know the block is ending without watching the screen."
              lines={[
                "Settings:",
                "- Preset: Box 5m (breathing presets)",
                "- Sound: On",
                "- Final beeps: On (last 5 seconds)",
                "- End chime: On (optional)",
                "- Loop: Off",
                "",
                "What you will hear:",
                "- Soft beeps at 0:05, 0:04, 0:03, 0:02, 0:01",
                "- End chime at 0:00 (if enabled)",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Yoga hold timing (1 minute 30 seconds)"
              subtitle="Precise timing using minutes plus extra seconds."
              lines={[
                "Settings:",
                "- Custom minutes: 1",
                "- + extra seconds: 30",
                "- Sound: Off (or End chime On for a finish cue)",
                "",
                "What you will see:",
                "- 1:30 → 0:00",
                "",
                "Why it matters:",
                "- You can keep your phone on the mat and glance occasionally",
                "- Fullscreen makes 1:30 readable from farther away",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: Repeating short breathing blocks automatically (Loop on)"
              subtitle="You want the same duration over and over without touching controls."
              lines={[
                "Settings:",
                "- Preset: 3m (or Box 3m)",
                "- Loop: On",
                "- Sound: On (optional), End chime On (optional)",
                "",
                "What you will experience:",
                "- Countdown runs 3:00 → 0:00",
                "- Immediately restarts back to 3:00",
                "- Continues until you pause or turn Loop off",
              ]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Choosing the right page when your goal is slightly different
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This route is built for calm, single-block countdown sessions. If
              you want a different experience, use the closest match: a
              dedicated breathing tool, a silent-only timer, a no-frills big
              display, or multiple blocks on one screen.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              For a dedicated breathwork experience, use{" "}
              <Link
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                to="/breathing-timer"
              >
                Breathing Timer
              </Link>
              . For silence by design, use{" "}
              <Link
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                to="/silent-timer"
              >
                Silent Timer
              </Link>
              . For the largest display with minimal extras, use{" "}
              <Link
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                to="/fullscreen-timer"
              >
                Fullscreen Timer
              </Link>
              . If you want several blocks in one routine, use{" "}
              <Link
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                to="/multiple-timers"
              >
                Multiple Timers
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Related tools (same site, different job)
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Pick the closest match to what you are actually trying to do.
              </p>
            </div>
            <div className="text-xs text-slate-600">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>R</Kbd> <Kbd>F</Kbd> <Kbd>S</Kbd>{" "}
              <Kbd>L</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/breathing-timer">Breathing Timer</PillLink>
            <PillLink to="/silent-timer">Silent Timer</PillLink>
            <PillLink to="/fullscreen-timer">Fullscreen Timer</PillLink>
            <PillLink to="/multiple-timers">Multiple Timers</PillLink>
            <PillLink to="/focus-session-timer">Focus Session Timer</PillLink>
            <PillLink to="/sleep-timer">Sleep Timer</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical details (timing, sound, focus, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional notes if you rely on exact behavior
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Countdown accuracy
              </div>
              <p className="mt-1 leading-relaxed">
                The countdown targets the end time using a monotonic clock
                (performance timing) rather than relying only on setInterval.
                This helps reduce drift if the browser is busy. Visual updates
                can still stutter on a slow device, but the countdown still aims
                for the intended duration.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Audio behavior</div>
              <p className="mt-1 leading-relaxed">
                Web audio may be blocked until a user gesture occurs. If you do
                not hear sound, press Start once, then keep Sound enabled. Final
                beeps play only in the last five seconds, and the end chime
                plays when the timer hits 0:00 (when enabled).
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Keyboard focus rules
              </div>
              <p className="mt-1 leading-relaxed">
                Shortcuts are handled on the timer card. If they do not work,
                click the card once to focus it. While typing in a number input,
                shortcuts are ignored to prevent accidental starts.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen targeting
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen is applied to the timer card itself. That keeps the
                controls and time display together. In fullscreen, you can also
                tap or click the time display to start or pause. Use Esc or the
                Exit button to leave fullscreen.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Duration changes reset the run
              </div>
              <p className="mt-1 leading-relaxed">
                Changing the duration (preset, minutes, or seconds) resets the
                run state back to the full duration. This prevents confusion
                where a countdown continues with a mix of old and new values.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              Want a simple countdown only?
            </strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              to="/countdown-timer"
            >
              Countdown Timer
            </Link>{" "}
            for a no-frills one-shot timer.
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              Need multiple blocks on screen?
            </strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              to="/multiple-timers"
            >
              Multiple Timers
            </Link>{" "}
            for routines with several timed blocks.
          </div>
        </div>

        {/* Small SEO anchor text without being bloggy */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <strong className="text-slate-900">In one sentence:</strong> this
          meditation timer gives you a calm fullscreen countdown with quick
          presets, custom minutes and seconds, optional sound, final beeps, end
          chime, loop mode, and simple shortcuts so you can time meditation,
          breathwork blocks, or yoga without distractions.
        </div>

        {/* Hidden absolute URL usage so abs() is not dead-code when tree-shaken */}
        <span className="sr-only" aria-hidden="true">
          {abs("/meditation-timer")}
        </span>
      </div>
    </section>
  );
}
