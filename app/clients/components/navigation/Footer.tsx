import React from "react";
import { Link } from "react-router";

type TimerMenuLink = { to: string; label: string };
type TimerMenuSection = {
  title: string;
  links: TimerMenuLink[];
  variant?: "flat";
};

const SITE_URL = "https://www.ilovetimers.com";

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

function FooterSectionDesktop({
  title,
  links,
}: {
  title: string;
  links: TimerMenuLink[];
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-400">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className={linkFooter}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterSectionMobile({
  title,
  links,
}: {
  title: string;
  links: TimerMenuLink[];
}) {
  return (
    <details className="rounded-xl border border-slate-700/60 bg-slate-800 px-4 py-3">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-sky-400">{title}</span>
          <span className="text-slate-400">▾</span>
        </div>
      </summary>

      <div className="mt-3 grid grid-cols-1 gap-2">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className={linkMobileRow}>
            {l.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

const linkFooter =
  "cursor-pointer text-sm text-slate-300 transition hover:text-sky-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40";

const linkMobileRow =
  "cursor-pointer rounded-lg border border-slate-700/60 bg-slate-700/40 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40";

const pill =
  "cursor-pointer rounded-full border border-slate-700/60 bg-slate-700/40 px-3 py-1.5 text-sm font-medium text-slate-100 transition hover:border-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40";

export default function Footer() {
  const year = new Date().getFullYear();

  const sections: TimerMenuSection[] = [
    {
      title: "Core timers",
      links: [
        { to: "/countdown-timer", label: "Countdown Timer" },
        { to: "/count-up-timer", label: "Count Up Timer" },
        { to: "/stopwatch", label: "Stopwatch" },
        { to: "/pomodoro-timer", label: "Pomodoro Timer" },
        { to: "/online-timer", label: "Online Timer" },
        { to: "/fullscreen-timer", label: "Fullscreen Timer" },
      ],
    },
    {
      title: "Focus & productivity",
      links: [
        { to: "/focus-session-timer", label: "Focus Session Timer" },
        { to: "/productivity-timer", label: "Productivity Timer" },
        { to: "/study-timer", label: "Study Timer" },
        { to: "/break-timer", label: "Break Timer" },
        { to: "/meeting-timer", label: "Meeting Timer" },
        { to: "/meeting-count-up-timer", label: "Meeting Count Up Timer" },
        { to: "/presentation-timer", label: "Presentation Timer" },
        { to: "/exam-timer", label: "Exam Timer" },
        { to: "/classroom-timer", label: "Classroom Timer" },
        { to: "/time-blocking-clock", label: "Time-Blocking Clock" },
      ],
    },
    {
      title: "Health & wellness",
      links: [
        { to: "/sleep-timer", label: "Sleep Timer" },
        { to: "/breathing-timer", label: "Breathing Timer" },
        { to: "/meditation-timer", label: "Meditation Timer" },
        { to: "/stretch-timer", label: "Stretch Timer" },
        { to: "/drink-water-reminder-timer", label: "Water Reminder Timer" },
        { to: "/silent-timer", label: "Silent Timer" },
        { to: "/visual-timer", label: "Visual Timer" },
      ],
    },
    {
      title: "Fitness & training",
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
      title: "Cooking & food",
      links: [
        { to: "/cooking-timer", label: "Cooking Timer" },
        { to: "/tea-timer", label: "Tea Timer" },
        { to: "/egg-timer", label: "Egg Timer" },
        { to: "/pizza-timer", label: "Pizza Timer" },
      ],
    },
    {
      title: "Clocks & time",
      links: [
        { to: "/current-local-time", label: "Current Local Time" },
        { to: "/world-clock", label: "World Clock" },
        { to: "/time-zone-converter", label: "Time Zone Converter" },
        { to: "/utc-clock", label: "UTC Clock" },
        { to: "/atomic-clock", label: "Atomic Clock" },
        { to: "/retro-flip-clock", label: "Retro Flip Clock" },
        { to: "/minimalist-clock", label: "Minimalist Clock" },
        { to: "/roman-numeral-clock", label: "Roman Numeral Clock" },
        { to: "/digital-clock", label: "Digital Clock" },
        { to: "/analog-clock", label: "Analog Clock" },
        { to: "/binary-clock", label: "Binary Clock" },
        { to: "/hexadecimal-clock", label: "Hexadecimal Clock" },
        { to: "/fibonacci-clock", label: "Fibonacci Clock" },
        { to: "/sunrise-sunset-clock", label: "Sunrise Sunset Clock" },
        { to: "/morse-code-clock", label: "Morse Code Clock" },
        { to: "/golden-hour-clock", label: "Golden Hour Clock" },
        { to: "/moon-phase-clock", label: "Moon Phase Clock" },
        { to: "/astronomical-clock", label: "Astronomical Clock" },
        { to: "/epoch-unix-time-clock", label: "Epoch / Unix Time Clock" },
        {
          to: "/swatch-internet-time-clock",
          label: "Swatch Internet Time Clock",
        },
        { to: "/binary-stopwatch", label: "Binary Stopwatch" },
      ],
    },
    {
      title: "Events & tracking",
      links: [
        { to: "/event-countdown", label: "Event Countdown" },
        { to: "/alarm-timer", label: "Alarm Timer" },
        { to: "/multiple-timers", label: "Multiple Timers" },
        { to: "/reaction-time-test", label: "Reaction Time Test" },
        { to: "/metronome", label: "Metronome" },
        { to: "/bpm-tapper", label: "BPM Tapper" },
      ],
    },
    {
      title: "Finance, work & calculators",
      links: [
        { to: "/billable-hours-clock", label: "Billable Hours Clock" },
        { to: "/debt-repayment-timer", label: "Debt Repayment Timer" },
        { to: "/debt-clock", label: "Debt Clock" },
        { to: "/military-time-converter", label: "Military Time Converter" },
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
      title: "Games & niche",
      variant: "flat",
      links: [
        { to: "/speedcubing-timer", label: "Speedcubing Timer" },
        { to: "/speedrun-timer", label: "Speedrun Timer" },
        { to: "/video-game-challenge-timer", label: "Game Challenge Timer" },
        { to: "/chaos-timer", label: "Chaos Timer" },
        { to: "/lab-timer", label: "Lab Timer" },
      ],
    },
  ];

  const jsonLd = buildFooterJsonLd(SITE_URL);

  const desktopSections = sections.filter((s) => s.variant !== "flat");
  const flatSections = sections.filter((s) => s.variant === "flat");

  return (
    <footer className="bg-slate-800" data-nosnippet>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/"
                className="cursor-pointer text-base font-semibold text-white transition hover:text-sky-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              >
                i<span className="text-amber-500">💛</span>Timers
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
          </div>

          <nav
            aria-label="Popular footer links"
            className="flex flex-wrap gap-2 sm:justify-end"
          >
            <Link to="/about" className={pill}>
              About
            </Link>
            <Link to="/online-timer" className={pill}>
              Online Timer
            </Link>
            <Link to="/stopwatch" className={pill}>
              Stopwatch
            </Link>
            <Link to="/pomodoro-timer" className={pill}>
              Pomodoro
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-slate-700/60" />

        <div className="mt-8 hidden lg:block">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-400">
            Timer tools directory
          </h2>

          <div className="mt-5 grid gap-8 lg:grid-cols-4">
            {desktopSections.map((s) => (
              <FooterSectionDesktop
                key={s.title}
                title={s.title}
                links={s.links}
              />
            ))}
          </div>

          {flatSections.map((s) => (
            <div key={s.title} className="mt-8">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-400">
                {s.title}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.links.map((l) => (
                  <Link key={l.to} to={l.to} className={pill}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 lg:hidden">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-400">
            Tools directory
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Tap a section to expand.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {desktopSections.map((s) => (
              <FooterSectionMobile
                key={s.title}
                title={s.title}
                links={s.links}
              />
            ))}
          </div>

          {flatSections.map((s) => (
            <div key={s.title} className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-400">
                {s.title}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.links.map((l) => (
                  <Link key={l.to} to={l.to} className={pill}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-700/60 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div>
            © {year}{" "}
            <span className="font-semibold text-white">i💛Timers</span>
          </div>

          <nav
            aria-label="Legal and site links"
            className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium"
          >
            <Link to="/about" className={linkFooter}>
              About
            </Link>
            <Link to="/sitemap" className={linkFooter}>
              Sitemap
            </Link>
            <Link to="/privacy" className={linkFooter}>
              Privacy
            </Link>
            <Link to="/terms" className={linkFooter}>
              Terms
            </Link>
            <Link to="/cookies" className={linkFooter}>
              Cookies
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
