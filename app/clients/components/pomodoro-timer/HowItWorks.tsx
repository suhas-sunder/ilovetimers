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
  baseUrl = "https://www.ilovetimers.com",
}: {
  baseUrl?: string;
}) {

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">

      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          How it works
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
          Pomodoro Timer alternates focused work blocks with short breaks. The
          main display shows the active phase, cycle count, and remaining time,
          so you can tell whether you are working, resting, or finished without
          reading a long setup panel.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Set the structure.</strong>{" "}
            Use Work, Break, and Cycles to define the session. A common setup is
            25 minutes of work, 5 minutes of break, and 4 cycles.
          </div>

          <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Pick automatic or manual flow.</strong>{" "}
            Auto moves to the next phase when the current phase ends. Turn it off
            when you want to pause between phases and press Next yourself.
          </div>

          <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Use sound only when helpful.</strong>{" "}
            Sound and final countdown beeps are optional. Some browsers require
            a page interaction before audio can play.
          </div>

          <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Long break is session-level.</strong>{" "}
            Enable the long break when you want a longer rest after the final
            work cycle instead of another short break.
          </div>
        </div>

        <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
          Need one work block without cycles? Try the{" "}
          <Link
            to="/focus-session-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Focus Session Timer
          </Link>
          . Want more flexible work and break modes? Use the{" "}
          <Link
            to="/productivity-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Productivity Timer
          </Link>
          . Planning a day by blocks? Use the{" "}
          <Link
            to="/time-blocking-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Blocking Clock
          </Link>
          . Need a plain countdown instead?{" "}
          <Link
            to="/countdown-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Countdown Timer
          </Link>{" "}
          is the simpler tool. For workout intervals, use{" "}
          <Link
            to="/hiit-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            HIIT Timer
          </Link>
          .
        </div>
      </div>
    </section>
  );
}
