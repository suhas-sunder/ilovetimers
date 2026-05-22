import { Link } from "react-router";

type TimerMenuLink = { to: string; label: string };
type TimerMenuSection = {
  title: string;
  links: TimerMenuLink[];
};

const SITE_URL = "https://www.ilovetimers.com";

const footerSections: TimerMenuSection[] = [
  {
    title: "Main pages",
    links: [
      { to: "/", label: "Home" },
      { to: "/free-online-timers", label: "Free Online Timers" },
      { to: "/about", label: "About" },
    ],
  },
  {
    title: "Core timer tools",
    links: [
      { to: "/countdown-timer", label: "Countdown Timer" },
      { to: "/stopwatch", label: "Stopwatch" },
      { to: "/pomodoro-timer", label: "Pomodoro Timer" },
      { to: "/hiit-timer", label: "HIIT Timer" },
      { to: "/fullscreen-timer", label: "Fullscreen Timer" },
      { to: "/silent-timer", label: "Silent Timer" },
      { to: "/online-timer", label: "Online Timer" },
      { to: "/interval-timer", label: "Interval Timer" },
      { to: "/millisecond-timer", label: "Millisecond Timer" },
      {
        to: "/stopwatch-with-milliseconds",
        label: "Stopwatch With Milliseconds",
      },
      { to: "/presentation-timer", label: "Presentation Timer" },
      { to: "/speech-timer", label: "Speech Timer" },
      { to: "/classroom-timer", label: "Classroom Timer" },
      { to: "/meeting-timer", label: "Meeting Timer" },
      { to: "/meeting-agenda-timer", label: "Meeting Agenda Timer" },
      { to: "/exam-timer", label: "Exam Timer" },
      { to: "/break-timer", label: "Break Timer" },
      { to: "/study-timer", label: "Study Timer" },
      { to: "/focus-session-timer", label: "Focus Session Timer" },
      { to: "/productivity-timer", label: "Productivity Timer" },
      { to: "/multiple-timers", label: "Multiple Timers" },
      { to: "/visual-timer", label: "Visual Timer" },
      { to: "/alarm-timer", label: "Alarm Timer" },
      { to: "/count-up-timer", label: "Count Up Timer" },
      { to: "/meeting-count-up-timer", label: "Meeting Count Up Timer" },
    ],
  },
  {
    title: "Workout and interval timers",
    links: [
      { to: "/workout-timer", label: "Workout Timer" },
      { to: "/rest-timer", label: "Rest Timer" },
      { to: "/tabata-timer", label: "Tabata Timer" },
      { to: "/stretch-timer", label: "Stretch Timer" },
      { to: "/emom-timer", label: "EMOM Timer" },
      { to: "/amrap-timer", label: "AMRAP Timer" },
      { to: "/round-timer", label: "Round Timer" },
      { to: "/boxing-timer", label: "Boxing Timer" },
      { to: "/pace-timer", label: "Pace Timer" },
    ],
  },
  {
    title: "Cooking and daily routine timers",
    links: [
      { to: "/cooking-timer", label: "Cooking Timer" },
      { to: "/tea-timer", label: "Tea Timer" },
      { to: "/egg-timer", label: "Egg Timer" },
      { to: "/pizza-timer", label: "Pizza Timer" },
      { to: "/meditation-timer", label: "Meditation Timer" },
      { to: "/breathing-timer", label: "Breathing Timer" },
      { to: "/sleep-timer", label: "Sleep Timer" },
      {
        to: "/drink-water-reminder-timer",
        label: "Drink Water Reminder Timer",
      },
      { to: "/lab-timer", label: "Lab Timer" },
    ],
  },
  {
    title: "Clocks and time displays",
    links: [
      { to: "/world-clock", label: "World Clock" },
      { to: "/current-local-time", label: "Current Local Time" },
      { to: "/utc-clock", label: "UTC Clock" },
      { to: "/24-hour-clock", label: "24 Hour Clock" },
      { to: "/military-time-clock", label: "Military Time Clock" },
      { to: "/analog-clock", label: "Analog Clock" },
      { to: "/smooth-second-hand-clock", label: "Smooth Second Hand Clock" },
      { to: "/digital-clock", label: "Digital Clock" },
      {
        to: "/clock-with-milliseconds",
        label: "Clock With Milliseconds",
      },
      { to: "/binary-clock", label: "Binary Clock" },
      { to: "/hexadecimal-clock", label: "Hexadecimal Clock" },
      { to: "/morse-code-clock", label: "Morse Code Clock" },
      { to: "/fibonacci-clock", label: "Fibonacci Clock" },
      { to: "/sunrise-sunset-clock", label: "Sunrise Sunset Clock" },
      { to: "/golden-hour-clock", label: "Golden Hour Clock" },
      { to: "/moon-phase-clock", label: "Moon Phase Clock" },
      { to: "/astronomical-clock", label: "Astronomical Clock" },
      { to: "/epoch-unix-time-clock", label: "Epoch Unix Time Clock" },
      {
        to: "/swatch-internet-time-clock",
        label: "Swatch Internet Time Clock",
      },
      { to: "/atomic-clock", label: "Atomic Clock" },
      { to: "/roman-numeral-clock", label: "Roman Numeral Clock" },
      { to: "/retro-flip-clock", label: "Retro Flip Clock" },
      { to: "/minimalist-clock", label: "Minimalist Clock" },
      { to: "/debt-clock", label: "Debt Clock" },
      { to: "/billable-hours-clock", label: "Billable Hours Clock" },
      { to: "/time-blocking-clock", label: "Time Blocking Clock" },
    ],
  },
  {
    title: "Calculators and converters",
    links: [
      { to: "/time-zone-converter", label: "Time Zone Converter" },
      {
        to: "/time-zone-meeting-planner",
        label: "Time Zone Meeting Planner",
      },
      { to: "/military-time-converter", label: "Military Time Converter" },
      { to: "/unix-timestamp-converter", label: "Unix Timestamp Converter" },
      { to: "/work-hours-calculator", label: "Work Hours Calculator" },
      { to: "/time-calculator", label: "Time Calculator" },
      {
        to: "/billable-hours-calculator",
        label: "Billable Hours Calculator",
      },
      { to: "/milliseconds-converter", label: "Milliseconds Converter" },
    ],
  },
  {
    title: "Games, tests, rhythm, and specialty tools",
    links: [
      { to: "/reaction-time-test", label: "Reaction Time Test" },
      { to: "/chess-clock", label: "Chess Clock" },
      { to: "/metronome", label: "Metronome" },
      { to: "/bpm-tapper", label: "BPM Tapper" },
      { to: "/speedcubing-timer", label: "Speedcubing Timer" },
      { to: "/binary-stopwatch", label: "Binary Stopwatch" },
      { to: "/chaos-timer", label: "Chaos Timer" },
      {
        to: "/video-game-challenge-timer",
        label: "Video Game Challenge Timer",
      },
      { to: "/speedrun-timer", label: "Speedrun Timer" },
      { to: "/event-countdown", label: "Event Countdown" },
      { to: "/new-year-countdown", label: "New Year Countdown" },
      { to: "/debt-repayment-timer", label: "Debt Repayment Timer" },
    ],
  },
  {
    title: "Legal and policy pages",
    links: [
      { to: "/sitemap", label: "HTML Sitemap" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms of Service" },
      { to: "/cookies", label: "Cookies Policy" },
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
  "ilt-focus-ring inline-flex cursor-pointer items-center rounded-[var(--ilt-radius-control)] bg-[var(--ilt-button-secondary-bg)] px-3 py-2 text-sm font-semibold text-[var(--ilt-text-primary)] shadow-[var(--ilt-shadow-interactive)] transition hover:bg-[var(--ilt-button-secondary-hover)]";

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
          aria-label="Global footer menu"
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
