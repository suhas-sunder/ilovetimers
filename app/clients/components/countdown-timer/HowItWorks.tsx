import React from "react";
import { Link } from "react-router";

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/countdown-timer",
}: {
  canonicalUrl?: string;
}) {

  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="ilt-keycap px-2 py-1 font-mono text-[11px] font-semibold text-[var(--ilt-text-primary)]">
      {children}
    </kbd>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">

      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          How it works
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
          Countdown Timer starts from the duration you choose and counts down to
          zero. It is built for quick timing tasks where the remaining time is
          the main thing you need to see: cooking steps, meetings, study blocks,
          classroom activities, workouts, and short reminders.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
          Use this page when you need a general-purpose countdown: set a custom
          duration, press Start, pause if the task changes, then reset when you
          are done. It works for cooking, laundry, cleaning, breaks, reminders,
          workout rests, meeting buffers, and study sprints.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Set minutes and seconds.</strong>{" "}
            Seconds are kept in the normal 0 to 59 range, so a duration like 5
            minutes and 30 seconds stays easy to read.
          </div>

          <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Adjust while timing.</strong>{" "}
            Use +1:00 or -0:10 for small changes without rebuilding the timer
            from scratch.
          </div>

          <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Keep the display visible.</strong>{" "}
            Fullscreen gives you large digits for projectors, shared screens,
            and across-the-room use.
          </div>

          <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Choose quiet or audible timing.</strong>{" "}
            Use the route's sound controls when an end cue is useful, or switch
            to a dedicated quiet page when a room should stay silent.
          </div>

          <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Use shortcuts when focused.</strong>{" "}
            Click the timer once, then use <Kbd>Space</Kbd> to start or pause,{" "}
            <Kbd>R</Kbd> to reset, <Kbd>A</Kbd> to add one minute,{" "}
            <Kbd>S</Kbd> to subtract ten seconds, and <Kbd>F</Kbd> for
            fullscreen.
          </div>
        </div>

        <div className="mt-4 ilt-surface-muted p-4 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Use a specialized timer when it fits better.</strong>{" "}
          For the quickest generic setup, use{" "}
          <Link className="ilt-content-link" to="/online-timer">
            Online Timer
          </Link>
          . For a room display, use{" "}
          <Link className="ilt-content-link" to="/fullscreen-timer">
            Fullscreen Timer
          </Link>
          . For quiet rooms, use{" "}
          <Link className="ilt-content-link" to="/silent-timer">
            Silent Timer
          </Link>
          . For parallel tasks, use{" "}
          <Link className="ilt-content-link" to="/multiple-timers">
            Multiple Timers
          </Link>
          . For breaks or cooking, try{" "}
          <Link className="ilt-content-link" to="/break-timer">
            Break Timer
          </Link>{" "}
          or{" "}
          <Link className="ilt-content-link" to="/cooking-timer">
            Cooking Timer
          </Link>
          .
        </div>
      </div>
    </section>
  );
}
