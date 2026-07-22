import { Link } from "react-router";
import { AnalyticsPreferencesButton } from "~/clients/components/analytics/AnalyticsConsent";

type TimerMenuLink = { to: string; label: string };
type TimerMenuSection = {
  title: string;
  links: TimerMenuLink[];
};

export const footerSections: TimerMenuSection[] = [
  {
    title: "Site",
    links: [
      { to: "/", label: "Home" },
      { to: "/free-online-timers", label: "Free Online Timers" },
      { to: "/guides", label: "Guides" },
      { to: "/about", label: "About" },
      { to: "/author/suhas-sunder", label: "Suhas Sunder" },
      { to: "/contact", label: "Contact" },
      { to: "/how-ilovetimers-is-made", label: "How iLoveTimers Is Made" },
      { to: "/copyright", label: "Copyright" },
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
      { to: "/timer-clock", label: "Clock and Timer" },
      { to: "/stopwatch", label: "Stopwatch" },
      { to: "/pomodoro-timer", label: "Pomodoro Timer" },
      { to: "/online-timer", label: "Online Timer" },
      { to: "/silent-timer", label: "Silent Timer" },
      { to: "/visual-timer", label: "Visual Timer" },
      { to: "/alarm-timer", label: "Alarm Timer" },
      { to: "/online-alarm-clock", label: "Online Alarm Clock" },
      { to: "/multiple-timers", label: "Multiple Timers" },
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
      { to: "/timer-stopwatch", label: "Timer and Stopwatch" },
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
      { to: "/focus-session-timer", label: "Focus Session Timer" },
      { to: "/productivity-timer", label: "Productivity Timer" },
      { to: "/study-timer", label: "Study Timer" },
      { to: "/study-stopwatch", label: "Study Stopwatch" },
      { to: "/break-timer", label: "Break Timer" },
      { to: "/meeting-timer", label: "Meeting Timer" },
      { to: "/meeting-count-up-timer", label: "Meeting Count Up Timer" },
      { to: "/presentation-timer", label: "Presentation Timer" },
      { to: "/classroom-timer", label: "Classroom Timer" },
      { to: "/meeting-agenda-timer", label: "Meeting Agenda Timer" },
      { to: "/speech-timer", label: "Speech Timer" },
      { to: "/exam-timer", label: "Exam Timer" },
    ],
  },
  {
    title: "Health & Wellness",
    links: [
      { to: "/sleep-timer", label: "Sleep Timer" },
      { to: "/breathing-timer", label: "Breathing Timer" },
      { to: "/meditation-timer", label: "Meditation Timer" },
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
      { to: "/workout-timer", label: "Workout Timer" },
      { to: "/hiit-timer", label: "HIIT Timer" },
      { to: "/tabata-timer", label: "Tabata Timer" },
      { to: "/emom-timer", label: "EMOM Timer" },
      { to: "/amrap-timer", label: "AMRAP Timer" },
      { to: "/round-timer", label: "Round Timer" },
      { to: "/pace-timer", label: "Pace Timer" },
      { to: "/rest-timer", label: "Rest Timer" },
    ],
  },
  {
    title: "Cooking & Food",
    links: [
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
    title: "Events & Tracking",
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
    title: "Finance, Work & Calculators",
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

const footerLinkClass =
  "cursor-pointer text-sm text-slate-300 transition hover:text-sky-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40";

const footerMobileRowClass =
  "cursor-pointer rounded-lg border border-slate-700/60 bg-slate-700/40 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40";

const footerPillClass =
  "inline-flex min-h-11 cursor-pointer items-center rounded-full border border-slate-700/60 bg-slate-700/40 px-3 py-1.5 text-sm font-medium text-slate-100 transition hover:border-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40";

const sectionOrder = [
  "Core Timers",
  "Focus & Productivity",
  "Health & Wellness",
  "Fitness & Training",
  "Cooking & Food",
  "Clocks & Time",
  "Events & Tracking",
  "Finance, Work & Calculators",
  "Preset Timers",
  "Stopwatch Tools",
  "Analog & Specialty Clocks",
  "World Time & Time Zones",
  "Calculators & Converters",
  "Games, Rhythm & Interaction",
];

function orderedDirectorySections() {
  const order = new Map(sectionOrder.map((title, index) => [title, index]));
  return footerSections
    .filter((section) => section.title !== "Site")
    .slice()
    .sort(
      (a, b) =>
        (order.get(a.title) ?? Number.MAX_SAFE_INTEGER) -
        (order.get(b.title) ?? Number.MAX_SAFE_INTEGER),
    );
}

function FooterSectionDesktop({ title, links }: TimerMenuSection) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-400">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
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

function FooterSectionMobile({ title, links }: TimerMenuSection) {
  return (
    <details className="rounded-xl border border-slate-700/60 bg-slate-800 px-4 py-3">
      <summary className="cursor-pointer list-none">
        <div className="flex min-h-11 items-center justify-between gap-3">
          <span className="text-sm font-semibold text-sky-400">{title}</span>
          <span className="text-slate-400" aria-hidden="true">
            v
          </span>
        </div>
      </summary>

      <div className="mt-3 grid grid-cols-1 gap-2">
        {links.map((link) => (
          <Link key={link.to} to={link.to} className={footerMobileRowClass}>
            {link.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const directorySections = orderedDirectorySections();

  return (
    <footer className="bg-slate-800" data-nosnippet>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/"
                className="cursor-pointer text-base font-semibold text-white transition hover:text-sky-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              >
                i<span className="text-amber-500">Love</span>Timers
              </Link>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400">
                Free time tools
              </span>
            </div>

            <p
              id="all-timers"
              className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300"
            >
              Free online timers, stopwatches, clocks, countdowns, interval
              timers, and time tools. Built for quick setup, fullscreen
              visibility, and clean keyboard control.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
              Built and maintained by{" "}
              <Link to="/author/suhas-sunder" className={footerLinkClass}>
                Suhas Sunder
              </Link>
              , a software engineer.
            </p>
          </div>

          <nav
            aria-label="Popular footer links"
            className="flex flex-wrap gap-2 sm:justify-end"
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
            <AnalyticsPreferencesButton className={footerPillClass} />
          </nav>
        </div>

        <div className="mt-8 border-t border-slate-700/60" />

        <div className="mt-8 hidden lg:block">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-400">
            Timer tools directory
          </h2>

          <div className="mt-5 grid gap-8 lg:grid-cols-4">
            {directorySections.map((section) => (
              <FooterSectionDesktop key={section.title} {...section} />
            ))}
          </div>
        </div>

        <div className="mt-8 lg:hidden">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-400">
            Tools directory
          </h2>
          <p className="mt-2 text-sm text-slate-400">Tap a section to expand.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {directorySections.map((section) => (
              <FooterSectionMobile key={section.title} {...section} />
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-700/60 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div>
            © {year}{" "}
            <span className="font-semibold text-white">iLoveTimers</span>
          </div>

          <nav
            aria-label="Legal and site links"
            className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium"
          >
            {footerSections
              .find((section) => section.title === "Site")
              ?.links.map((link) => (
                <Link key={link.to} to={link.to} className={footerLinkClass}>
                  {link.label.replace("HTML ", "").replace(" Policy", "").replace(" Service", "")}
                </Link>
              ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
