import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

type ScenarioLink = { label: string; href: string };

type Scenario = {
  title: string;
  description: string;
  forWho: string;
  notFor: string;
  links: ScenarioLink[];
};

export default function PopularUseCases({
  baseUrl = "https://www.ilovetimers.com",
}: {
  baseUrl?: string;
}) {
  const scenarios: Scenario[] = [
    {
      title: "One batch of boiled eggs",
      description:
        "Pick Soft, Jammy, Medium, Hard, or Very hard, then start the countdown. Reset returns to the same preset for another batch.",
      forWho: "Anyone who wants a quick egg-specific timer without setting minutes by hand.",
      notFor:
        "General kitchen timing for pasta, baking, or several foods at once.",
      links: [
        { label: "Cooking Timer", href: "/cooking-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Custom egg timing",
      description:
        "Use the minutes and seconds fields when your stove, pot size, altitude, or preferred doneness needs a time that is not one of the presets.",
      forWho: "People who already know the exact timing they prefer.",
      notFor:
        "Changing time mid-run. Presets and inputs are intentionally disabled while the countdown is running.",
      links: [
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Cooking Timer", href: "/cooking-timer" },
      ],
    },
    {
      title: "Quiet kitchen timing",
      description:
        "Turn Sound off and keep the large countdown visible. Fullscreen helps when you want a visual timer without an audible finish signal.",
      forWho: "Shared spaces, late-night cooking, or quiet kitchens.",
      notFor: "A guaranteed device-level alarm after the browser is closed.",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
      ],
    },
    {
      title: "Final-second warning",
      description:
        "Leave Sound and Final beeps enabled to hear short beeps in the last few seconds before the finish signal.",
      forWho: "Anyone moving around the kitchen who still wants a short heads-up.",
      notFor: "No-audio environments. Use Sound off or Silent Timer instead.",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Alarm Timer", href: "/alarm-timer" },
      ],
    },
    {
      title: "Big counter display",
      description:
        "Use fullscreen on a phone, tablet, or laptop so the egg countdown is readable from across the kitchen.",
      forWho: "Hands-busy cooking where the timer needs to be glanceable.",
      notFor:
        "Running several dishes at once. Multiple Timers is a better fit for that.",
      links: [
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
      ],
    },
    {
      title: "Eggs plus another kitchen task",
      description:
        "Use Egg Timer for the egg countdown and Multiple Timers when you also need a second timer for tea, toast, pasta, or another dish.",
      forWho: "Cooking workflows with more than one active countdown.",
      notFor: "A single egg batch where this page already covers the job.",
      links: [
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Tea Timer", href: "/tea-timer" },
        { label: "Cooking Timer", href: "/cooking-timer" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use Egg Timer",
    itemListElement: scenarios.map((scenario, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: scenario.title,
      url: abs("/egg-timer"),
    })),
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <JsonLd data={itemListLd} />

      <div className="ilt-surface-card p-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Use this page for egg-specific presets, custom minutes and seconds,
            optional sound, final countdown beeps, and fullscreen kitchen timing.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {scenarios.map((scenario) => (
            <div key={scenario.title} className="ilt-surface-muted p-4">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                {scenario.title}
              </div>
              <div className="mt-1 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                {scenario.description}
              </div>

              <div className="mt-3 grid gap-2 text-sm">
                <div>
                  <div className="ilt-content-label">For</div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    {scenario.forWho}
                  </div>
                </div>

                <div>
                  <div className="ilt-content-label">Not for</div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    {scenario.notFor}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {scenario.links.map((link) => (
                  <Link
                    key={`${scenario.title}-${link.href}`}
                    to={link.href}
                    className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
                  >
                    {link.label} -&gt;
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
          <span className="font-semibold text-[var(--ilt-text-primary)]">
            Tip:
          </span>{" "}
          Press Space to start or pause, R to reset, F for fullscreen, and S to
          toggle sound after the timer card has focus.
        </div>
      </div>
    </section>
  );
}
