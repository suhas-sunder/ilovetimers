import React from "react";

export function JsonLd({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/alarm-timer",
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
      {children} -&gt;
    </a>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
              How this alarm timer works
            </h2>
            <p className="mt-2 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              Alarm Timer is a countdown that can ring when it reaches zero. Set
              a quick preset or custom minutes, decide whether sound and final
              beeps should be enabled, then start the timer. The display stays
              focused on the remaining time, with Stop alarm available as soon
              as the alarm state is active.
            </p>
            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              This is still a browser timer, so keep the tab open and test audio
              before relying on it. It is useful for kitchen reminders, meeting
              breaks, classroom transitions, and other situations where you are
              near the screen. For wake-up alarms or safety-critical alerts, use
              a device alarm or another system intended for that job.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Presets
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Optional sound
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Final beeps
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fullscreen
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Quick setup
            </div>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span>{" "}
                Choose a preset or enter custom minutes.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span>{" "}
                Turn Sound on if you want the alarm to ring.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span>{" "}
                Keep Final beeps on if you want the last five seconds marked.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span>{" "}
                Start the countdown. Use Stop alarm when it rings.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              Shortcuts: <Kbd>Space</Kbd> start/pause, <Kbd>R</Kbd> reset,{" "}
              <Kbd>F</Kbd> fullscreen, <Kbd>S</Kbd> sound, <Kbd>X</Kbd> stop
              alarm.
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Sound expectations
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Browsers may block sound until the page receives a click or tap.
              If sound matters, press Start once while Sound is on and confirm
              your device volume, mute state, and output device. If you turn
              Sound off, completion remains visual and the alarm will not ring.
            </p>
          </div>
        </div>

        <div className="mt-7 ilt-surface-card p-5">
          <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
            Related timing tools
          </div>
          <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
            Use Alarm Timer when the end alert matters. Use these pages for
            adjacent timing workflows.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/countdown-timer")}>Countdown Timer</PillLink>
            <PillLink href={abs("/online-timer")}>Online Timer</PillLink>
            <PillLink href={abs("/silent-timer")}>Silent Timer</PillLink>
            <PillLink href={abs("/break-timer")}>Break Timer</PillLink>
            <PillLink href={abs("/kitchen-timer")}>Cooking Timer</PillLink>
            <PillLink href={abs("/online-timer")}>
              Fullscreen Timer
            </PillLink>
          </div>
        </div>
      </div>
    </section>
  );
}
