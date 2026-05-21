import { Link } from "react-router";
import type { ReactNode } from "react";

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
  const pageUrl = `${baseUrl}/pizza-timer`;

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use the Pizza Timer",
    description:
      "Use Pizza Timer to choose a pizza preset, set a custom time, enable an early check reminder, and run a large fullscreen countdown.",
    url: pageUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose a pizza preset or custom time",
        text: "Pick a frozen oven, air fryer, reheat, or skillet preset, or enter your own minutes and seconds.",
      },
      {
        "@type": "HowToStep",
        name: "Set an optional check reminder",
        text: "Use Check with X min left to get a reminder before the timer finishes, such as 2 minutes for oven pizza or 1 minute for skillet reheating.",
      },
      {
        "@type": "HowToStep",
        name: "Start the countdown",
        text: "Press Start or Space. Pause keeps the remaining time, and Reset returns to the selected preset or custom time.",
      },
      {
        "@type": "HowToStep",
        name: "Use sound and fullscreen when useful",
        text: "Turn Sound on for reminders, enable Final beeps if desired, and use Fullscreen for a large kitchen display.",
      },
    ],
  };

  const Kbd = ({ children }: { children: ReactNode }) => (
    <kbd className="ilt-keycap px-2 py-1 font-mono text-[11px] font-semibold text-[var(--ilt-text-primary)]">
      {children}
    </kbd>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <JsonLd data={howToLd} />

      <div className="ilt-surface-card p-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
            How this timer works
          </h2>
          <p className="mt-2 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
            Pizza Timer is a focused kitchen countdown for frozen pizza,
            reheating slices, air fryer timing, and skillet reheats. Choose a
            preset or set custom minutes and seconds, then keep the active
            countdown large and easy to read.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="ilt-surface-muted p-4">
            <h3 className="text-base font-semibold text-[var(--ilt-text-primary)]">
              Presets and custom time
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Presets fill in common pizza timings, including frozen oven,
              frozen air fryer, reheat slice, and skillet slice. Editing minutes
              or seconds switches the method to Custom and resets the countdown
              to the new value.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <h3 className="text-base font-semibold text-[var(--ilt-text-primary)]">
              Early check reminder
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The check reminder plays before the end, for example at 2 minutes
              left for oven pizza or 1 minute left for skillet reheating. Use it
              as a prompt to check browning and decide whether the pizza needs
              more time.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <h3 className="text-base font-semibold text-[var(--ilt-text-primary)]">
              Sound controls
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Sound controls the early check reminder and finish signal. Final
              beeps are optional short beeps in the last few seconds. Test
              reminder plays the selected reminder style without starting a
              timer.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <h3 className="text-base font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen kitchen display
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen keeps the countdown readable from across the kitchen.
              In fullscreen, click or tap the large time to start or pause, and
              press Esc to exit.
            </p>
          </div>
        </div>

        <div className="mt-5 ilt-surface-muted p-4 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
          <span className="font-semibold text-[var(--ilt-text-primary)]">
            Shortcuts:
          </span>{" "}
          <Kbd>Space</Kbd> starts or pauses, <Kbd>R</Kbd> resets, and{" "}
          <Kbd>F</Kbd> toggles fullscreen after the timer card has focus.
        </div>

        <div className="mt-5 text-sm text-[var(--ilt-text-secondary)]">
          Need a broader kitchen timer?{" "}
          <Link
            to="/cooking-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Cooking Timer
          </Link>{" "}
          covers general kitchen presets. Timing more than one dish?{" "}
          <Link
            to="/multiple-timers"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Multiple Timers
          </Link>{" "}
          is the better fit.
        </div>
      </div>
    </section>
  );
}
