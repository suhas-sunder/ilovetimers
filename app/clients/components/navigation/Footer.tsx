import { Link } from "react-router";

type TimerMenuLink = { to: string; label: string };
type TimerMenuSection = {
  title: string;
  links: TimerMenuLink[];
};

const SITE_URL = "https://www.ilovetimers.com";

const footerSections: TimerMenuSection[] = [
  {
    title: "Core timers",
    links: [
      { to: "/countdown-timer", label: "Countdown" },
      { to: "/online-timer", label: "Online timer" },
      { to: "/fullscreen-timer", label: "Fullscreen timer" },
      { to: "/stopwatch", label: "Stopwatch" },
      { to: "/pomodoro-timer", label: "Pomodoro" },
      { to: "/multiple-timers", label: "Multiple timers" },
    ],
  },
  {
    title: "Focus and work",
    links: [
      { to: "/focus-session-timer", label: "Focus session" },
      { to: "/study-timer", label: "Study timer" },
      { to: "/meeting-timer", label: "Meeting timer" },
      { to: "/presentation-timer", label: "Presentation timer" },
      { to: "/exam-timer", label: "Exam timer" },
      { to: "/time-blocking-clock", label: "Time blocking" },
    ],
  },
  {
    title: "Fitness and wellness",
    links: [
      { to: "/hiit-timer", label: "HIIT" },
      { to: "/tabata-timer", label: "Tabata" },
      { to: "/workout-timer", label: "Workout timer" },
      { to: "/breathing-timer", label: "Breathing timer" },
      { to: "/meditation-timer", label: "Meditation timer" },
      { to: "/sleep-timer", label: "Sleep timer" },
    ],
  },
  {
    title: "Clocks and utilities",
    links: [
      { to: "/current-local-time", label: "Current time" },
      { to: "/world-clock", label: "World clock" },
      { to: "/atomic-clock", label: "Atomic clock" },
      { to: "/retro-flip-clock", label: "Retro flip clock" },
      { to: "/time-zone-converter", label: "Time zone converter" },
      { to: "/time-calculator", label: "Time calculator" },
    ],
  },
];

function buildFooterJsonLd(baseUrl = SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "I Love Timers",
        alternateName: "iLoveTimers",
        url: `${baseUrl}/`,
      },
      {
        "@type": "WebSite",
        name: "I Love Timers",
        alternateName: "iLoveTimers",
        url: `${baseUrl}/`,
        description:
          "Free online timers, stopwatches, clocks, countdowns, interval timers, and time tools.",
      },
    ],
  };
}

function FooterSection({ title, links }: TimerMenuSection) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ilt-text-muted)]">
        {title}
      </h3>
      <ul className="mt-3 grid gap-2">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className={footerLinkClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const footerLinkClass =
  "ilt-focus-ring inline-flex cursor-pointer rounded-[var(--ilt-radius-control)] text-sm font-semibold text-[var(--ilt-text-secondary)] transition hover:text-[var(--ilt-text-primary)]";

const footerPillClass =
  "ilt-focus-ring inline-flex cursor-pointer items-center rounded-[var(--ilt-radius-control)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ilt-text-primary)] shadow-[var(--ilt-shadow-interactive)] transition hover:bg-slate-100";

export default function Footer() {
  const year = new Date().getFullYear();
  const jsonLd = buildFooterJsonLd(SITE_URL);

  return (
    <footer className="bg-[var(--ilt-bg-content)] px-[var(--ilt-page-x)] py-10 text-[var(--ilt-text-primary)]" data-nosnippet>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[112rem]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              to="/"
              className="ilt-focus-ring inline-flex cursor-pointer text-base font-bold tracking-tight text-[var(--ilt-text-primary)] transition hover:opacity-75"
            >
              iLoveTimers.com
            </Link>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ilt-text-secondary)]">
              Free online timers, stopwatches, clocks, countdowns, interval
              timers, and time tools built for quick setup, large displays, and
              predictable keyboard control.
            </p>
          </div>

          <nav
            aria-label="Popular footer links"
            className="flex flex-wrap gap-2 lg:justify-end"
          >
            <Link to="/about" className={footerPillClass}>
              About
            </Link>
            <Link to="/online-timer" className={footerPillClass}>
              Online timer
            </Link>
            <Link to="/stopwatch" className={footerPillClass}>
              Stopwatch
            </Link>
            <Link to="/pomodoro-timer" className={footerPillClass}>
              Pomodoro
            </Link>
          </nav>
        </div>

        <nav
          aria-label="Timer tools directory"
          className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {footerSections.map((section) => (
            <FooterSection key={section.title} {...section} />
          ))}
        </nav>

        <div className="mt-10 flex flex-col gap-3 text-sm text-[var(--ilt-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            Copyright {year}{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">
              iLoveTimers.com
            </span>
          </div>

          <nav
            aria-label="Legal and site links"
            className="flex flex-wrap gap-x-4 gap-y-2"
          >
            <Link to="/sitemap" className={footerLinkClass}>
              Sitemap
            </Link>
            <Link to="/privacy" className={footerLinkClass}>
              Privacy
            </Link>
            <Link to="/terms" className={footerLinkClass}>
              Terms
            </Link>
            <Link to="/cookies" className={footerLinkClass}>
              Cookies
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
