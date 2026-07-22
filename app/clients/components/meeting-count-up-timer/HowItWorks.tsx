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
   - Meeting Count Up Timer intent: elapsed meeting time + topic splits + fullscreen
   - Tool-focused, not meeting advice
   - Scenario-based with concrete numbers users will see on this page
   - Technical details live in an expandable section
   - Aim: ~800–1200 words of unique, intent-matching content
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/meeting-count-up-timer",
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

      <div className="ilt-surface-card p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>

            <p className="mt-2 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Meeting Count Up Timer
              </span>{" "}
              is for one simple job: show{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">elapsed time</span>{" "}
              during a meeting, clearly and without extra setup. It starts at{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">0:00</span>, counts
              upward, and stays readable even when you put it on a second screen
              or run it in fullscreen. When you want to track pacing across an
              agenda, you can press{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Topic</span> to
              record splits so you can see how long each part of the meeting
              took.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              This page is not a meeting guide and it does not try to tell you
              how to facilitate. It is a timing tool. It focuses on actions you
              need while the meeting is happening: start, pause for a break,
              reset when you are done, go fullscreen when you need a large
              display, and mark Topic transitions when you change agenda items.
              You can also rename the Topic label (for example: Agenda, Demo,
              Q&amp;A, or Wrap-up) and optionally cap the number of agenda items
              so the split button disables when you reach your plan.
              It fits standups, interviews, office hours, group discussions,
              workshops, and any open-ended meeting where elapsed time matters
              more than a countdown.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              The time display also adapts automatically. Under one hour, you
              will see a compact{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">m:ss</span> display
              like <span className="font-semibold text-[var(--ilt-text-primary)]">18:42</span>.
              After an hour, it switches to{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">h:mm:ss</span>,
              like <span className="font-semibold text-[var(--ilt-text-primary)]">1:05:09</span>
              . In fullscreen, the digits scale up to fill the screen so you can
              glance at them from across a room.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Elapsed time
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Topic splits
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Agenda cap
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Custom label
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
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Start</span> (or{" "}
                <Kbd>Space</Kbd>) when the meeting begins. The timer starts at{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">0:00</span> and
                counts up.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> When
                you switch agenda items, press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Topic</span> (or{" "}
                <Kbd>T</Kbd>). Each press records both the{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Total</span>{" "}
                elapsed time and the{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Split</span>{" "}
                since the previous Topic.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> If you
                take a break, press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Pause</span> to
                stop counting. Press Start again to resume.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> For a
                large display, press <Kbd>F</Kbd> to go fullscreen. In
                fullscreen, you can also{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  tap/click the time
                </span>{" "}
                to start or pause.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> When
                you are done, press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Reset</span> (or{" "}
                <Kbd>R</Kbd>) to clear elapsed time and Topic splits.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What Reset does here (so there are no surprises)
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Reset stops the timer, sets elapsed time back to{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">0:00</span>, and
                clears your Topic list. For example, if the meeting reached{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">27:18</span> and
                you recorded 4 Topic splits, Reset returns the display to{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">0:00</span> with
                no splits. Your optional settings like Button label and agenda
                cap stay as you set them.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Practical checklist
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                If you want the whole room to see time, use{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Fullscreen</span>{" "}
                and keep the tab visible.
              </li>
              <li>
                If shortcuts do nothing, click the timer card once so it has
                focus.
              </li>
              <li>
                If you need agenda tracking, rename the button label first, then
                press Topic at each transition.
              </li>
              <li>
                If you want a hard limit on agenda items, set “# of agenda
                topics” to your planned count.
              </li>
              <li>
                If you need time remaining instead of elapsed time, use{" "}
                <Link
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  to="/meeting-timer"
                >
                  Meeting Timer
                </Link>
                .
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Shortcuts:</span>{" "}
              <Kbd>Space</Kbd> start/pause, <Kbd>T</Kbd> topic, <Kbd>R</Kbd>{" "}
              reset, <Kbd>F</Kbd> fullscreen, <Kbd>Esc</Kbd> exit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What this page is optimized for
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            Most meeting timing problems are not about precision. They are about{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">visibility</span> and{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">pacing</span>. You
            want to know whether you are 6 minutes in or 26 minutes in without
            doing mental math. You also want a quick way to see where time went,
            especially in meetings that drift. This tool supports that workflow:
            one big elapsed timer, plus Topic splits that turn agenda
            transitions into a simple list you can scan during or after the
            meeting.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            Topic splits are intentionally minimal: they are not notes and they
            are not a transcript. They are timestamps. When you press Topic, you
            capture two useful numbers at once:
          </p>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-[var(--ilt-text-secondary)]">
            <li>
              <span className="font-semibold text-[var(--ilt-text-primary)]">Total</span>{" "}
              elapsed time: where you are in the meeting right now.
            </li>
            <li>
              <span className="font-semibold text-[var(--ilt-text-primary)]">Split</span> time:
              how long the current agenda item took since the previous Topic.
            </li>
          </ul>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            The agenda cap is optional. Some meetings have a known number of
            items (for example, 6 parts to a retrospective or 5 items in a
            client review). When you set a cap, Topic becomes a deliberate tool:
            you can press it at most that many times, and the UI stays aligned
            with the meeting plan. If you do not set a cap, Topic is unlimited.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Scenarios with concrete numbers (what you will experience here)
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            These examples use the exact behavior on this page. The timestamps
            are realistic and show the kinds of numbers you will see in the
            Topic list and the fullscreen overlay.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: 15-minute daily standup with three Topic splits"
              subtitle="Track pacing without forcing a countdown."
              lines={[
                "Setup:",
                "- Press Start at 0:00",
                "- Optional: set Button label to 'Segment'",
                "",
                "During the meeting (press Topic at transitions):",
                "- Segment 1 (Updates): Total 6:40, Split +6:40",
                "- Segment 2 (Blockers): Total 11:05, Split +4:25",
                "- Segment 3 (Wrap-up): Total 14:50, Split +3:45",
                "",
                "What you learned:",
                "- Updates used 6:40 (largest chunk)",
                "- The meeting finished at 14:50 elapsed",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Client call with a break (pause/resume)"
              subtitle="Keep elapsed meeting time clear without mental math."
              lines={[
                "Setup:",
                "- Rename Button label to 'Section'",
                "",
                "Run:",
                "- Start at 0:00",
                "- At 18:12 press Topic (Intro): Total 18:12, Split +18:12",
                "- Pause for a 5-minute break at Total 22:30",
                "- Resume after the break (elapsed continues from 22:30)",
                "- At 38:05 press Topic (Demo): Total 38:05, Split +19:53",
                "- At 47:40 press Topic (Q&A): Total 47:40, Split +9:35",
                "",
                "What you learned:",
                "- Demo ran 19:53 after the intro",
                "- Q&A ran 9:35",
                "- Break time was not counted while paused",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Workshop agenda with a hard cap of 6 items"
              subtitle="Use the cap to keep splits aligned with the plan."
              lines={[
                "Setup:",
                "- Set '# of agenda topics' to 6",
                "- Button label: 'Agenda'",
                "",
                "Example Topic list (most recent first):",
                "- Agenda 6/6: Total 1:12:10, Split +10:05",
                "- Agenda 5/6: Total 1:02:05, Split +12:40",
                "- Agenda 4/6: Total 49:25, Split +14:15",
                "- Agenda 3/6: Total 35:10, Split +9:50",
                "- Agenda 2/6: Total 25:20, Split +11:05",
                "- Agenda 1/6: Total 14:15, Split +14:15",
                "",
                "Behavior:",
                "- After Agenda 6/6, Topic is disabled until you Reset",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Fullscreen wall display during a meeting"
              subtitle="Big digits for a shared screen, quick controls for you."
              lines={[
                "Setup:",
                "- Press F for fullscreen",
                "- Top bar shows Start/Pause, Topic, Reset",
                "",
                "Typical usage:",
                "- Tap/click the time to pause for interruptions",
                "- Press Topic at each agenda change",
                "- Exit with Esc when the meeting ends",
                "",
                "What you see:",
                "- Large timer like 23:08 or 1:03:22",
                "- Up to the last 6 Topic splits shown in the overlay",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Two-person 30-minute check-in with a simple split"
              subtitle="Minimal tracking: only the major transition."
              lines={[
                "Run:",
                "- Start at 0:00",
                "- Press Topic at 12:30 (Updates): Total 12:30, Split +12:30",
                "- Press Topic at 26:10 (Decisions): Total 26:10, Split +13:40",
                "- Finish at 29:45",
                "",
                "What you learned:",
                "- Updates were 12:30",
                "- Decisions were 13:40",
                "- Wrap-up took the remaining 3:35 without needing a split",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: After-meeting recap using Topic timestamps"
              subtitle="Use the list as a quick summary of where time went."
              lines={[
                "Example recap:",
                "- Total meeting time: 52:18",
                "- Topic splits (Split times): 8:10, 12:05, 9:40, 14:20, 7:... ",
                "",
                "Practical next step:",
                "- If one split is consistently 14+ minutes, that is the section to tighten",
                "- If you need to add time across meetings, use Time Calculator",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Picking the right page when your goal is slightly different
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This route is for elapsed meeting time plus optional Topic splits.
              If you need time remaining, use a meeting countdown. If you want a
              barebones count up without agenda features, use the simple count
              up page. If you need to add up multiple durations after the fact,
              use the calculator.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Time remaining:{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/meeting-timer"
              >
                Meeting Timer
              </Link>
              . Simple count up:{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/stopwatch"
              >
                Count Up Timer
              </Link>
              . Totals and sums:{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/time-calculator"
              >
                Time Calculator
              </Link>
              . Planning blocks before the meeting:{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/time-blocking-clock"
              >
                Time Blocking Clock
              </Link>
              .
            </p>
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
                Pick the closest match to what you are trying to do.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>T</Kbd> <Kbd>R</Kbd> <Kbd>F</Kbd>{" "}
              <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/meeting-timer">Meeting Timer</PillLink>
            <PillLink to="/stopwatch">Stopwatch</PillLink>
            <PillLink to="/presentation-timer">Presentation Timer</PillLink>
            <PillLink to="/stopwatch">Stopwatch</PillLink>
            <PillLink to="/time-blocking-clock">Time Blocking Clock</PillLink>
            <PillLink to="/time-calculator">Time Calculator</PillLink>
            <PillLink to="/online-timer">Online Timer</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (timing, splits, focus, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional notes if you rely on exact behavior
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Count up timing model
              </div>
              <p className="mt-1 leading-relaxed">
                Elapsed time is tracked using a monotonic performance clock so
                it stays consistent across pauses and resumes. If the browser is
                busy, visual updates can stutter, but elapsed time still follows
                the intended clock progression.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Topic split rules
              </div>
              <p className="mt-1 leading-relaxed">
                Each Topic records the total elapsed time and a split time since
                the previous Topic. If you set an agenda cap, Topic disables
                once you reach the limit. Splits are stored most recent first in
                the list.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Keyboard focus rules
              </div>
              <p className="mt-1 leading-relaxed">
                Shortcuts are handled on the timer card. If they do not work,
                click the card once to focus it. While typing in a text or
                number field, shortcuts are ignored.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen targeting
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen is applied to the timer card itself so the controls
                and time display stay together. In fullscreen, tapping or
                clicking the time toggles start or pause. Use Esc or the Exit
                button to leave fullscreen.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Display formatting behavior
              </div>
              <p className="mt-1 leading-relaxed">
                The display shows m:ss under one hour and h:mm:ss after one
                hour. The UI rounds display to whole seconds so it is easy to
                read on a shared screen.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Want a meeting countdown instead?
            </strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/meeting-timer"
            >
              Meeting Timer
            </Link>{" "}
            for time remaining.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Need totals across sessions?
            </strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/time-calculator"
            >
              Time Calculator
            </Link>{" "}
            to add multiple durations.
          </div>
        </div>

        {/* Small SEO anchor text without being bloggy */}
        <div className="mt-6 ilt-surface-muted px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">In one sentence:</strong> this
          meeting count up timer gives you a clean elapsed time display with
          fullscreen mode, Topic splits for agenda timing, an optional agenda
          cap, a customizable Topic label, and simple shortcuts so you can run a
          meeting and track where the time went without extra tools.
        </div>

        {/* Hidden absolute URL usage so abs() is not dead-code when tree-shaken */}
        <span className="sr-only" aria-hidden="true">
          {abs("/meeting-count-up-timer")}
        </span>
      </div>
    </section>
  );
}
