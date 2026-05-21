import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (MEETING COUNT UP TIMER intent)
   Schema: ItemList (scenarios -> this route)
========================================================= */

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
      title: "Daily standup timing (simple elapsed time)",
      description:
        "Press Start as the standup begins and keep the elapsed time visible. Use Topic when you switch between updates, blockers, and wrap-up so you can see how long each segment took.",
      forWho:
        "Teams that want a lightweight way to keep standups from running long without managing a strict countdown.",
      notFor:
        "You need time remaining with a hard end time. Use Meeting Timer for a countdown-based meeting.",
      links: [
        { label: "Meeting Timer", href: "/meeting-timer" },
        { label: "Count Up Timer", href: "/count-up-timer" },
      ],
    },
    {
      title: "Agenda-driven meeting with Topic splits",
      description:
        "Use Topic at each agenda transition to capture split time per item. Optionally set “# of agenda topics” to match your plan so Topic disables after the last item.",
      forWho:
        "Meetings with a clear agenda where you want a quick record of time spent per topic.",
      notFor:
        "You need a full meeting planner or notes. This tool only tracks time and topic splits.",
      links: [
        { label: "Time Calculator", href: "/time-calculator" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
    {
      title: "Client call sections (rename Topic to match your flow)",
      description:
        "Change Button label to Section, Demo, Q&A, or Next steps. Press Topic at each transition to capture timing without juggling multiple tools.",
      forWho:
        "Anyone who runs structured calls and wants a quick breakdown of how long each section took.",
      notFor:
        "You want presenter-focused tools. Use Presentation Timer for talk and stage timing.",
      links: [
        { label: "Presentation Timer", href: "/presentation-timer" },
        { label: "Count Up Timer", href: "/count-up-timer" },
      ],
    },
    {
      title: "Room display during a meeting (fullscreen)",
      description:
        "Go fullscreen for a large, readable display. In fullscreen, tap or click the time to start or pause, and keep the top bar controls available for quick access.",
      forWho:
        "In-person meetings where the timer needs to be visible from across the room.",
      notFor:
        "You want a no-frills fullscreen countdown. Use Fullscreen Timer for a minimal large display.",
      links: [
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Online Timer", href: "/online-timer" },
      ],
    },
    {
      title: "Workshops and retros (track segments without strict limits)",
      description:
        "Run the count up for the full session and use Topic splits for discussion segments. You get a clear sense of where time went without forcing a countdown per section.",
      forWho:
        "Facilitators who want visibility into pacing and segment length without stopping the session to reset timers.",
      notFor:
        "You need multiple concurrent timers for different groups. Use Multiple Timers instead.",
      links: [
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
    {
      title: "Break handling (pause and resume cleanly)",
      description:
        "Pause when the meeting breaks, then Start again when you resume. Topic splits still work after resuming, and the elapsed time stays consistent without manual adjustment.",
      forWho:
        "Longer meetings that include breaks and need accurate elapsed time for the actual meeting time.",
      notFor:
        "You want a strict countdown that continues through breaks. Use Online Timer for a simple countdown you can leave running.",
      links: [
        { label: "Online Timer", href: "/online-timer" },
        { label: "Meeting Timer", href: "/meeting-timer" },
      ],
    },
    {
      title: "Post-meeting recap (use splits to total sections)",
      description:
        "After the meeting, glance at Topic splits to see which parts ran long. If you need to sum time across multiple meetings or blocks, use the Time Calculator.",
      forWho:
        "People who want a quick time breakdown for improvement without exporting data.",
      notFor:
        "You need billing or invoicing features. Use Billable Hours Clock for a running billable view.",
      links: [
        { label: "Time Calculator", href: "/time-calculator" },
        { label: "Billable Hours Clock", href: "/billable-hours-clock" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/meeting-count-up-timer"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Meeting Count Up Timer",
    itemListElement: schemaList.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: s.primaryUrl,
    })),
  };

  return (
    <section className="space-y-4">
      <JsonLd data={itemListLd} />

      <div className="ilt-surface-card p-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Use this page to track elapsed meeting time with a clear count-up
            display. Go fullscreen for a large clock, and press Topic to record
            agenda splits (total time plus time since the previous Topic).
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {scenarios.map((s) => (
            <div
              key={s.title}
              className="ilt-surface-card p-4"
            >
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
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">{s.forWho}</div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Not for
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">{s.notFor}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {s.links.map((l) => (
                  <Link
                    key={`${s.title}-${l.href}`}
                    to={l.href}
                    className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> Press{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span> to
          start/pause, <span className="font-semibold text-[var(--ilt-text-primary)]">T</span>{" "}
          to record a Topic split,{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">R</span> to reset,{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">F</span> for
          fullscreen, and{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> to exit
          fullscreen. If shortcuts do nothing, click the timer card once to
          focus it.
        </div>
      </div>
    </section>
  );
}
