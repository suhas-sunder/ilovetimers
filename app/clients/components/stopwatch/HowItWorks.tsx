// app/clients/components/stopwatch/HowItWorks.tsx
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
   HOW IT WORKS (Stopwatch)
   Goal: user-intent first, SEO-friendly, unique, practical
   Target: 800 to 1200 words of real help + examples
========================================================= */
export default function HowItWorks({
  baseUrl = "https://www.ilovetimers.com",
}: {
  baseUrl?: string;
}) {
  const pageUrl = `${baseUrl}/stopwatch`;

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use an online stopwatch with laps and millisecond display",
    description:
      "Use this online stopwatch to start and pause quickly, record laps (splits), copy lap results as CSV, and use fullscreen mode with keyboard shortcuts.",
    url: pageUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Start the stopwatch",
        text: "Press Start or hit Space to begin timing immediately.",
      },
      {
        "@type": "HowToStep",
        name: "Record laps and splits",
        text: "Press Lap or hit L at key moments to capture split time (since last lap) and total time (since start).",
      },
      {
        "@type": "HowToStep",
        name: "Pause, resume, or reset",
        text: "Use Space to pause and resume. Use Reset or press R to clear the time and lap list.",
      },
      {
        "@type": "HowToStep",
        name: "Copy lap results",
        text: "Press Copy or hit C to copy lap results as CSV for spreadsheets or notes.",
      },
      {
        "@type": "HowToStep",
        name: "Use fullscreen when you need a big display",
        text: "Press Fullscreen or hit F. Press Esc to exit fullscreen. In fullscreen, you can click or tap the time to start or pause.",
      },
    ],
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <JsonLd data={howToLd} />

      <div className="ilt-surface-card p-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            This page is an online stopwatch built for fast timing, clean lap
            splits, and a readable fullscreen display. It is ideal when you want
            to measure elapsed time (counting up), mark milestones as laps, and
            export the results without screenshots or manual typing. You can run
            the stopwatch with the mouse, but it is designed to work smoothly
            with keyboard shortcuts too.
          </p>
        </div>

        {/* Core explanation (SEO + intent, no fluff) */}
        <div className="mt-4 grid gap-4">
          <div className="ilt-surface-muted p-4 text-[var(--ilt-text-secondary)]">
            <p className="leading-relaxed">
              The stopwatch shows{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                elapsed time down to milliseconds
              </span>
              . When you press Start (or Space), time begins counting up. When
              you pause, the display holds steady. When you resume, timing
              continues from the paused value rather than restarting.
            </p>
            <p className="mt-3 leading-relaxed">
              The key feature is{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">laps</span>. A lap
              records two numbers at once:
              <span className="font-semibold text-[var(--ilt-text-primary)]"> Total </span>
              (time since you started) and{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]"> Split </span>
              (time since your previous lap). That makes it easy to track
              repeating efforts like rounds, attempts, sets, segments, or event
              timestamps during an experiment.
            </p>
            <p className="mt-3 leading-relaxed">
              When you are done, you can copy your lap list as{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">CSV</span> to paste
              into a spreadsheet. That gives you a clean record like “Lap 1
              split 0:32.418, Lap 2 split 0:31.902” without retyping anything.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                1) Start / pause
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span> to
                start or pause instantly, or use the Start button.
              </p>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                2) Record laps
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Press <span className="font-semibold text-[var(--ilt-text-primary)]">L</span> to
                record a lap. Each lap captures split and total time.
              </p>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                3) Copy results
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Press <span className="font-semibold text-[var(--ilt-text-primary)]">C</span> to
                copy laps as CSV, ready for Sheets or Excel.
              </p>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                4) Fullscreen
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Press <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
                for a big display. Press Esc to exit.
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
            These examples show exactly how laps, splits, copy, and fullscreen
            fit real tasks. The times below are realistic numbers you might see
            while using the stopwatch.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Scenario A */}
            <div className="ilt-surface-card p-4">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Scenario A: Interval training with consistent splits
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You are doing 6 rounds of a drill and want to keep each round
                close to 35 seconds. Start the stopwatch once, then press Lap at
                the end of each round.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    What you do
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Press Space to start. At the end of each round, press L. If
                    you need a break, press Space to pause, then Space again to
                    resume.
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Example laps (numbers)
                  </div>
                  <div className="mt-2 ilt-surface-card px-3 py-2 font-mono text-xs text-[var(--ilt-text-primary)]">
                    Lap 1: Split 0:35.214 | Total 0:35.214
                    <br />
                    Lap 2: Split 0:34.882 | Total 1:10.096
                    <br />
                    Lap 3: Split 0:36.041 | Total 1:46.137
                    <br />
                    Lap 4: Split 0:35.007 | Total 2:21.144
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Why this helps
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Split times show consistency round to round, while Total
                    shows how long the full session has taken. When you copy
                    CSV, you can chart your split trend in a spreadsheet.
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario B */}
            <div className="ilt-surface-card p-4">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Scenario B: Speed attempts and quick logging
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You are doing 10 short attempts and want each attempt time saved
                without switching apps. Press Lap at the end of each attempt,
                then copy the CSV to paste into a notes file.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Example attempt times
                  </div>
                  <div className="mt-2 ilt-surface-card px-3 py-2 font-mono text-xs text-[var(--ilt-text-primary)]">
                    Lap 1: Split 0:12.483 | Total 0:12.483
                    <br />
                    Lap 2: Split 0:11.972 | Total 0:24.455
                    <br />
                    Lap 3: Split 0:12.201 | Total 0:36.656
                    <br />
                    Lap 4: Split 0:11.805 | Total 0:48.461
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    What to copy
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Press C to copy CSV, then paste into Sheets. You will get
                    three columns that you can sort, average, or graph.
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Better fit tool
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    If you want a solve-first layout, use{" "}
                    <Link
                      to="/speedcubing-timer"
                      className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                    >
                      Speedcubing Timer
                    </Link>
                    .
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario C */}
            <div className="ilt-surface-card p-4">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Scenario C: Fullscreen timing for a group
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You are running a classroom activity and want a large stopwatch
                visible from the back of the room. Use fullscreen to make the
                time readable at a distance.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Setup
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Press F to enter fullscreen. Click the time to start or
                    pause. Use the top bar buttons if you want quick Lap or
                    Reset access.
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Example use (numbers)
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    If the activity is “2 minutes per station”, you can run the
                    stopwatch and call out checkpoints: “at 0:30.000 switch
                    roles”, “at 1:30.000 wrap up”, “at 2:00.000 rotate”.
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Better fit tool
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    If you need a fixed countdown instead of count-up, use{" "}
                    <Link
                      to="/countdown-timer"
                      className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                    >
                      Countdown Timer
                    </Link>{" "}
                    or{" "}
                    <Link
                      to="/presentation-timer"
                      className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                    >
                      Presentation Timer
                    </Link>
                    .
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario D */}
            <div className="ilt-surface-card p-4">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Scenario D: Lab notes, mark events as laps
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You are timing an experiment and want timestamps for events
                without stopping the clock. Start once, then press Lap when each
                event happens.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Example event log (numbers)
                  </div>
                  <div className="mt-2 ilt-surface-card px-3 py-2 font-mono text-xs text-[var(--ilt-text-primary)]">
                    Lap 1: Split 0:18.640 | Total 0:18.640 (solution added)
                    <br />
                    Lap 2: Split 0:45.210 | Total 1:03.850 (color shift)
                    <br />
                    Lap 3: Split 1:12.905 | Total 2:16.755 (peak reached)
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Next step
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Copy CSV, paste into your lab notes, and add a short label
                    beside each lap row. If you need multi-stage timing, use{" "}
                    <Link
                      to="/lab-timer"
                      className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                    >
                      Lab Timer
                    </Link>
                    .
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Practical guidance */}
        <div className="mt-6 ilt-surface-card p-4">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            Small habits that improve results
          </h3>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Define what “Lap” means before you start
              </div>
              <p className="mt-2 leading-relaxed">
                Decide what you are measuring (end of a round, end of a rep, end
                of an attempt). Press Lap at the same point each time. That
                makes split comparisons meaningful.
              </p>
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Use split for pacing, total for session length
              </div>
              <p className="mt-2 leading-relaxed">
                If your splits drift from 0:35.000 to 0:41.000, you are slowing
                down. Total tells you how long the entire session took including
                pauses.
              </p>
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Copy CSV immediately after finishing
              </div>
              <p className="mt-2 leading-relaxed">
                If the lap list matters, copy it right away and paste it into a
                note or spreadsheet. It takes a few seconds and prevents losing
                your results if you reload the page.
              </p>
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen is for readability, not just looks
              </div>
              <p className="mt-2 leading-relaxed">
                Fullscreen makes the time easy to read across a room or during a
                call. It is also useful on a second monitor when you want the
                stopwatch always visible.
              </p>
            </div>
          </div>
        </div>

        {/* Technical content stays expandable */}
        <details className="group mt-6 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (timing, laps, copy, fullscreen)
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
              <div className="font-semibold text-[var(--ilt-text-primary)]">Time format</div>
              <p className="mt-1 leading-relaxed">
                Short sessions display as{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">m:ss.mmm</span>.
                Longer sessions display as{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  h:mm:ss.mmm
                </span>
                . This keeps the readout compact but still precise.
              </p>
              <p className="mt-2 leading-relaxed">
                The display includes milliseconds, but browser rendering,
                device performance, background tabs, and sleep states can affect
                perceived smoothness. Use dedicated calibrated timing equipment
                when a result has formal stakes.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Lap ordering</div>
              <p className="mt-1 leading-relaxed">
                Laps are displayed with the most recent first for quick
                scanning. Copy exports in chronological order (oldest to newest)
                so it pastes cleanly into spreadsheets.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Copy permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Copy uses the browser clipboard API. If copy fails, try clicking
                the page once and pressing Copy again. Some browsers restrict
                clipboard access in certain contexts.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen is handled by the browser. Some browsers require a
                click gesture to enter fullscreen. Press Esc to exit at any
                time. In fullscreen, clicking the time toggles start/pause for
                quick control.
              </p>
            </div>
          </div>
        </details>

        {/* Footer helper links */}
        <div className="mt-6 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
          <span className="font-semibold text-[var(--ilt-text-primary)]">
            Need a different tool?
          </span>{" "}
          For a fixed duration countdown, use{" "}
          <Link
            to="/countdown-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Countdown Timer
          </Link>
          . For interval structure, use{" "}
          <Link
            to="/hiit-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            HIIT Timer
          </Link>{" "}
          or{" "}
          <Link
            to="/tabata-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Tabata Timer
          </Link>
          . For multi-station timing, use{" "}
          <Link
            to="/multiple-timers"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Multiple Timers
          </Link>
          .
        </div>
      </div>
    </section>
  );
}
