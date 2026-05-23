import { Link } from "react-router";

type TimerMenuLink = { to: string; label: string };
type TimerMenuSection = {
  title: string;
  links: TimerMenuLink[];
};

const SITE_URL = "https://www.ilovetimers.com";

const footerSections: TimerMenuSection[] = [
  {
    title: "Site",
    links: [
      { to: "/", label: "Home" },
      { to: "/free-online-timers", label: "Free Online Timers" },
      { to: "/about", label: "About" },
      { to: "/sitemap", label: "HTML Sitemap" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms of Service" },
      { to: "/cookies", label: "Cookies Policy" },
    ],
  },
  {
    title: "Core Timers",
    links: [
      { to: "/countdown-timer", label: "Countdown Timer" },
      { to: "/online-timer", label: "Online Timer" },
      { to: "/fullscreen-timer", label: "Fullscreen Timer" },
      { to: "/silent-timer", label: "Silent Timer" },
      { to: "/visual-timer", label: "Visual Timer" },
      { to: "/alarm-timer", label: "Alarm Timer" },
      { to: "/online-alarm-clock", label: "Online Alarm Clock" },
      { to: "/multiple-timers", label: "Multiple Timers" },
      { to: "/count-up-timer", label: "Count Up Timer" },
      { to: "/meeting-count-up-timer", label: "Meeting Count Up Timer" },
      { to: "/millisecond-timer", label: "Millisecond Timer" },
      { to: "/interval-timer", label: "Interval Timer" },
    ],
  },
  {
    title: "Preset Timers",
    links: [
      { to: "/seconds-timer", label: "Seconds Timer" },
      { to: "/1-minute-timer", label: "1 Minute Timer" },
      { to: "/5-minute-timer", label: "5 Minute Timer" },
      { to: "/10-minute-timer", label: "10 Minute Timer" },
      { to: "/15-minute-timer", label: "15 Minute Timer" },
      { to: "/30-minute-timer", label: "30 Minute Timer" },
    ],
  },
  {
    title: "Stopwatch Tools",
    links: [
      { to: "/stopwatch", label: "Stopwatch" },
      {
        to: "/stopwatch-with-milliseconds",
        label: "Stopwatch With Milliseconds",
      },
      { to: "/binary-stopwatch", label: "Binary Stopwatch" },
    ],
  },
  {
    title: "Focus & Productivity",
    links: [
      { to: "/pomodoro-timer", label: "Pomodoro Timer" },
      { to: "/break-timer", label: "Break Timer" },
      { to: "/study-timer", label: "Study Timer" },
      { to: "/focus-session-timer", label: "Focus Session Timer" },
      { to: "/productivity-timer", label: "Productivity Timer" },
      { to: "/presentation-timer", label: "Presentation Timer" },
      { to: "/speech-timer", label: "Speech Timer" },
      { to: "/classroom-timer", label: "Classroom Timer" },
      { to: "/meeting-timer", label: "Meeting Timer" },
      { to: "/meeting-agenda-timer", label: "Meeting Agenda Timer" },
      { to: "/exam-timer", label: "Exam Timer" },
    ],
  },
  {
    title: "Health & Wellness",
    links: [
      { to: "/meditation-timer", label: "Meditation Timer" },
      { to: "/breathing-timer", label: "Breathing Timer" },
      { to: "/sleep-timer", label: "Sleep Timer" },
      { to: "/stretch-timer", label: "Stretch Timer" },
      {
        to: "/drink-water-reminder-timer",
        label: "Drink Water Reminder Timer",
      },
    ],
  },
  {
    title: "Fitness & Training",
    links: [
      { to: "/hiit-timer", label: "HIIT Timer" },
      { to: "/workout-timer", label: "Workout Timer" },
      { to: "/rest-timer", label: "Rest Timer" },
      { to: "/tabata-timer", label: "Tabata Timer" },
      { to: "/emom-timer", label: "EMOM Timer" },
      { to: "/amrap-timer", label: "AMRAP Timer" },
      { to: "/round-timer", label: "Round Timer" },
      { to: "/boxing-timer", label: "Boxing Timer" },
      { to: "/pace-timer", label: "Pace Timer" },
    ],
  },
  {
    title: "Cooking & Food",
    links: [
      { to: "/cooking-timer", label: "Cooking Timer" },
      { to: "/kitchen-timer", label: "Kitchen Timer" },
      { to: "/tea-timer", label: "Tea Timer" },
      { to: "/egg-timer", label: "Egg Timer" },
      { to: "/pizza-timer", label: "Pizza Timer" },
    ],
  },
  {
    title: "Clocks & Time",
    links: [
      { to: "/current-local-time", label: "Current Local Time" },
      { to: "/digital-clock", label: "Digital Clock" },
      { to: "/full-screen-clock", label: "Full Screen Clock" },
      { to: "/big-digital-clock", label: "Big Digital Clock" },
      { to: "/clock-with-seconds", label: "Clock With Seconds" },
      {
        to: "/clock-with-milliseconds",
        label: "Clock With Milliseconds",
      },
      { to: "/24-hour-clock", label: "24 Hour Clock" },
      { to: "/12-hour-clock", label: "12 Hour Clock" },
      { to: "/military-time-clock", label: "Military Time Clock" },
      { to: "/utc-clock", label: "UTC Clock" },
      { to: "/atomic-clock", label: "Atomic Clock" },
      { to: "/epoch-unix-time-clock", label: "Epoch Unix Time Clock" },
      { to: "/minimalist-clock", label: "Minimalist Clock" },
    ],
  },
  {
    title: "Analog & Specialty Clocks",
    links: [
      { to: "/analog-clock", label: "Analog Clock" },
      {
        to: "/analog-clock-with-second-hand",
        label: "Analog Clock With Second Hand",
      },
      {
        to: "/full-screen-analog-clock",
        label: "Full Screen Analog Clock",
      },
      { to: "/smooth-second-hand-clock", label: "Smooth Second Hand Clock" },
      { to: "/binary-clock", label: "Binary Clock" },
      { to: "/hexadecimal-clock", label: "Hexadecimal Clock" },
      { to: "/morse-code-clock", label: "Morse Code Clock" },
      { to: "/fibonacci-clock", label: "Fibonacci Clock" },
      { to: "/roman-numeral-clock", label: "Roman Numeral Clock" },
      { to: "/retro-flip-clock", label: "Retro Flip Clock" },
      { to: "/sunrise-sunset-clock", label: "Sunrise Sunset Clock" },
      { to: "/golden-hour-clock", label: "Golden Hour Clock" },
      { to: "/moon-phase-clock", label: "Moon Phase Clock" },
      { to: "/astronomical-clock", label: "Astronomical Clock" },
      {
        to: "/swatch-internet-time-clock",
        label: "Swatch Internet Time Clock",
      },
    ],
  },
  {
    title: "World Time & Time Zones",
    links: [
      { to: "/world-clock", label: "World Clock" },
      { to: "/world-clock-with-seconds", label: "World Clock With Seconds" },
      {
        to: "/world-clock-with-milliseconds",
        label: "World Clock With Milliseconds",
      },
      { to: "/time-zone-converter", label: "Time Zone Converter" },
      {
        to: "/time-zone-meeting-planner",
        label: "Time Zone Meeting Planner",
      },
      { to: "/military-time-converter", label: "Military Time Converter" },
    ],
  },
  {
    title: "Events & Countdowns",
    links: [
      { to: "/event-countdown", label: "Event Countdown" },
      { to: "/countdown-to-date", label: "Countdown To Date" },
      { to: "/new-year-countdown", label: "New Year Countdown" },
      { to: "/christmas-countdown", label: "Christmas Countdown" },
      { to: "/birthday-countdown", label: "Birthday Countdown" },
    ],
  },
  {
    title: "Calculators & Converters",
    links: [
      { to: "/time-calculator", label: "Time Calculator" },
      {
        to: "/time-duration-calculator",
        label: "Time Duration Calculator",
      },
      { to: "/date-duration-calculator", label: "Date Duration Calculator" },
      { to: "/date-calculator", label: "Date Calculator" },
      { to: "/business-days-calculator", label: "Business Days Calculator" },
      { to: "/age-calculator", label: "Age Calculator" },
      { to: "/days-until-calculator", label: "Days Until Calculator" },
      { to: "/weekday-calculator", label: "Weekday Calculator" },
      { to: "/week-number-calculator", label: "Week Number Calculator" },
      {
        to: "/months-between-dates-calculator",
        label: "Months Between Dates Calculator",
      },
      {
        to: "/weeks-between-dates-calculator",
        label: "Weeks Between Dates Calculator",
      },
      { to: "/hours-until-calculator", label: "Hours Until Calculator" },
      { to: "/milliseconds-converter", label: "Milliseconds Converter" },
      { to: "/unix-timestamp-converter", label: "Unix Timestamp Converter" },
    ],
  },
  {
    title: "Work, Billing & Date Tools",
    links: [
      { to: "/work-hours-calculator", label: "Work Hours Calculator" },
      { to: "/time-card-calculator", label: "Time Card Calculator" },
      {
        to: "/weekly-timesheet-calculator",
        label: "Weekly Timesheet Calculator",
      },
      {
        to: "/billable-hours-calculator",
        label: "Billable Hours Calculator",
      },
      { to: "/billable-hours-clock", label: "Billable Hours Clock" },
      { to: "/time-blocking-clock", label: "Time Blocking Clock" },
      { to: "/debt-clock", label: "Debt Clock" },
      { to: "/debt-repayment-timer", label: "Debt Repayment Timer" },
      { to: "/workdays-calculator", label: "Workdays Calculator" },
    ],
  },
  {
    title: "Games, Rhythm & Interaction",
    links: [
      { to: "/reaction-time-test", label: "Reaction Time Test" },
      { to: "/chess-clock", label: "Chess Clock" },
      { to: "/metronome", label: "Metronome" },
      { to: "/bpm-tapper", label: "BPM Tapper" },
      { to: "/speedcubing-timer", label: "Speedcubing Timer" },
      { to: "/chaos-timer", label: "Chaos Timer" },
      {
        to: "/video-game-challenge-timer",
        label: "Video Game Challenge Timer",
      },
      { to: "/speedrun-timer", label: "Speedrun Timer" },
      { to: "/lab-timer", label: "Lab Timer" },
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
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
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
    </section>
  );
}

const footerLinkClass =
  "ilt-focus-ring inline-flex cursor-pointer rounded-sm text-sm font-medium leading-5 text-slate-300 transition-colors hover:text-cyan-100";

const footerPillClass =
  "ilt-focus-ring inline-flex cursor-pointer items-center rounded-full bg-slate-800/80 px-3 py-1.5 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-700 hover:text-white";

export default function Footer() {
  const year = new Date().getFullYear();
  const jsonLd = buildFooterJsonLd(SITE_URL);

  return (
    <footer
      className="bg-[#0f172a] px-[var(--ilt-page-x)] py-10 text-slate-100"
      data-nosnippet
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[112rem]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/"
                className="ilt-focus-ring inline-flex cursor-pointer rounded-sm text-base font-bold tracking-tight text-white transition-colors hover:text-cyan-100"
              >
                iLoveTimers.com
              </Link>
              <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                Free time tools
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
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

        <div className="mt-8 h-px bg-slate-700/70" />

        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300">
            Timer Tools Directory
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Browse every current timer, clock, stopwatch, countdown,
            calculator, converter, and time tool.
          </p>
        </div>

        <nav
          aria-label="Global footer menu"
          className="mt-6 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5"
        >
          {footerSections.map((section) => (
            <FooterSection key={section.title} {...section} />
          ))}
        </nav>

        <div className="mt-10 h-px bg-slate-700/70" />

        <div className="mt-6 flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div>
            Copyright {year}{" "}
            <span className="font-semibold text-white">
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
