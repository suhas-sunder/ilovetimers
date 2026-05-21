import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (debt-repayment-timer intent)
   Schema: ItemList (scenarios -> best matching route)
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
      title: "Debt-free countdown to a specific payoff date",
      description:
        "Set a payoff date and keep a clear countdown to the finish line. The page shows time remaining plus a simple time-based progress percentage.",
      forWho:
        "Anyone who has a target payoff day and wants a visible countdown they can check quickly (especially in fullscreen).",
      notFor:
        "Precise payoff math. This tool does not calculate interest, fees, minimum payments, or lender schedules.",
      links: [
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
      ],
    },
    {
      title: "Payoff sprint (Duration mode)",
      description:
        "Use Duration (days) to run a focused payoff window like 30/60/90 days from your start date, with the same countdown + progress view.",
      forWho:
        "People who prefer a fixed-length sprint instead of a calendar deadline.",
      notFor:
        "Tracking multiple debts at once or splitting payments across accounts (this page is one countdown).",
      links: [
        { label: "Focus Session Timer", href: "/focus-session-timer" },
        { label: "Productivity Timer", href: "/productivity-timer" },
      ],
    },
    {
      title: "Simple pacing estimate (starting vs target balance)",
      description:
        "Enter a starting balance and a target balance and you’ll see “est. paid” and “est. remaining” using a straight-line, time-based estimate.",
      forWho:
        "Anyone who wants a lightweight “are we on pace by date?” signal without complicated assumptions.",
      notFor:
        "Payment planning. The estimate is tied to time elapsed, not to your actual payments.",
      links: [
        { label: "Time Calculator", href: "/time-calculator" },
        { label: "Work Hours Calculator", href: "/work-hours-calculator" },
      ],
    },
    {
      title: "Big display in fullscreen (quick start/pause)",
      description:
        "Fullscreen makes the countdown large and adds top/bottom controls. In fullscreen you can tap/click the timer area to start or pause.",
      forWho:
        "Second-monitor setups, shared rooms, or anywhere you want the countdown visible from a distance.",
      notFor: "Hands-off unattended displays where you need zero interaction.",
      links: [
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Online Timer", href: "/online-timer" },
      ],
    },
    {
      title: "Structured review sessions (check in without losing time)",
      description:
        "Use the countdown as the “north star” and run short review sessions (plan, check, adjust) while keeping the finish line visible.",
      forWho:
        "People who like doing quick weekly or daily check-ins while staying oriented to the payoff deadline.",
      notFor:
        "A budgeting app. This page is a timer and simple estimate, not a ledger.",
      links: [
        { label: "Meeting Timer", href: "/meeting-timer" },
        { label: "Pomodoro Timer", href: "/pomodoro-timer" },
      ],
    },
    {
      title: "Deadline awareness without notifications",
      description:
        "Keep the tab open and glance at time remaining. This tool is intentionally minimal and doesn’t require accounts or alerts to be useful.",
      forWho:
        "Anyone who wants passive visibility instead of reminders or notifications.",
      notFor:
        "Alarm-style alerts when you hit milestones (use an alarm tool if you need notifications).",
      links: [{ label: "Alarm Timer", href: "/alarm-timer" }],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/debt-repayment-timer"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Debt Repayment Timer",
    itemListElement: schemaList.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: s.primaryUrl,
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
            This page is built for a payoff countdown: choose a payoff date or a
            duration, see time remaining, and get a simple time-based progress
            estimate. Add starting/target balances for a lightweight pacing
            signal.
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
                  <a
                    key={`${s.title}-${l.href}`}
                    href={l.href}
                    className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
                  >
                    {l.label} →
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> Press{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">F</span> for
          fullscreen,{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span> to
          start/pause, and{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">R</span> to reset. If
          shortcuts do nothing, click the timer card once to focus it.
        </div>
      </div>
    </section>
  );
}
