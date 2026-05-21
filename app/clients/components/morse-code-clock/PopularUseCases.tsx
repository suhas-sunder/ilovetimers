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
      title: "Practice Morse numbers with a live clock",
      description:
        "Keep seconds on so the Morse output changes often, then check each digit against the normal time.",
      forWho: "Learners practicing number patterns from 0 through 9.",
      notFor:
        "Learning letters or full messages. This page only encodes time digits.",
      links: [{ label: "Current Local Time", href: "/current-local-time" }],
    },
    {
      title: "Fullscreen demo for a class or workshop",
      description:
        "Use block view in fullscreen so dots and dashes are large enough to read across a room.",
      forWho: "Teachers, presenters, clubs, and quick demonstrations.",
      notFor:
        "A standard wall clock. Use Digital Clock or Minimalist Clock for plain time.",
      links: [
        { label: "Digital Clock", href: "/digital-clock" },
        { label: "Minimalist Clock", href: "/minimalist-clock" },
      ],
    },
    {
      title: "Copy the current time and Morse output",
      description:
        "Copy creates a paste-ready block with the normal time and its Morse digit representation.",
      forWho: "Notes, examples, chat messages, or checking a Morse exercise.",
      notFor:
        "Converting arbitrary text to Morse. This route is a clock, not a general encoder.",
      links: [{ label: "UTC Clock", href: "/utc-clock" }],
    },
    {
      title: "Switch between block and text views",
      description:
        "Block view emphasizes visual reading. Text view shows the raw dots and dashes for verification.",
      forWho:
        "Anyone comparing symbol shapes against the standard Morse text form.",
      notFor:
        "Time zone conversion. Use Time Zone Converter for cross-zone planning.",
      links: [{ label: "Time Zone Converter", href: "/time-zone-converter" }],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Morse Code Clock",
    itemListElement: scenarios.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: abs("/morse-code-clock"),
    })),
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <JsonLd data={itemListLd} />

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Use this clock when you want local time displayed as Morse digits in
            either block or text form.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {scenarios.map((s) => (
            <div key={s.title} className="ilt-surface-card p-4">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                {s.title}
              </div>
              <div className="mt-1 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                {s.description}
              </div>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    For
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    {s.forWho}
                  </div>
                </div>
                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Not for
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    {s.notFor}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {s.links.map((l) => (
                  <Link
                    key={`${s.title}-${l.href}`}
                    to={l.href}
                    className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
                  >
                    {l.label} -&gt;
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
