// app/routes/sitemap.tsx
import type { Route } from "./+types/sitemap";
import { ContentPage } from "~/clients/components/ui/foundation";

const SITE_URL = "https://www.ilovetimers.com";

type SitemapLink = {
  title: string;
  href: string;
  description: string;
};

type SitemapSection = {
  title: string;
  description: string;
  links: SitemapLink[];
};

const SECTIONS: SitemapSection[] = [
  {
    title: "Main pages",
    description: "Core site pages and general information.",
    links: [
      {
        title: "Home",
        href: "/",
        description:
          "Browse simple online timers, clocks, calculators, converters, and time tools.",
      },
      {
        title: "Free Online Timers",
        href: "/free-online-timers",
        description:
          "Use the original four-tool timer page with countdown, stopwatch, Pomodoro, and HIIT timers.",
      },
      {
        title: "About",
        href: "/about",
        description:
          "Learn more about I Love Timers and the purpose of the site.",
      },
    ],
  },
  {
    title: "Core timer tools",
    description:
      "General-purpose online timers for countdowns, alarms, focus sessions, meetings, classrooms, and presentations.",
    links: [
      {
        title: "Countdown Timer",
        href: "/countdown-timer",
        description: "Set a simple countdown timer for any task or event.",
      },
      {
        title: "Stopwatch",
        href: "/stopwatch",
        description: "Measure elapsed time with a fast online stopwatch.",
      },
      {
        title: "Stopwatch With Milliseconds",
        href: "/stopwatch-with-milliseconds",
        description:
          "Measure elapsed time with milliseconds, laps, copy, and fullscreen support.",
      },
      {
        title: "Pomodoro Timer",
        href: "/pomodoro-timer",
        description: "Use structured work and break cycles for focused work.",
      },
      {
        title: "HIIT Timer",
        href: "/hiit-timer",
        description: "Run workout intervals with work, rest, and round timing.",
      },
      {
        title: "Fullscreen Timer",
        href: "/fullscreen-timer",
        description:
          "Display a large timer for rooms, projectors, TVs, and group sessions.",
      },
      {
        title: "Silent Timer",
        href: "/silent-timer",
        description:
          "Use a quiet visual timer for classrooms, meetings, talks, and recording.",
      },
      {
        title: "Online Timer",
        href: "/online-timer",
        description:
          "Start a browser-based timer instantly without installing anything.",
      },
      {
        title: "Seconds Timer",
        href: "/seconds-timer",
        description:
          "Run a short countdown with seconds presets, custom seconds, sound, and fullscreen support.",
      },
      {
        title: "1 Minute Timer",
        href: "/1-minute-timer",
        description:
          "Start a direct 60-second countdown that opens ready at 1:00.",
      },
      {
        title: "5 Minute Timer",
        href: "/5-minute-timer",
        description:
          "Start a direct five-minute countdown that opens ready at 5:00.",
      },
      {
        title: "10 Minute Timer",
        href: "/10-minute-timer",
        description:
          "Start a direct ten-minute countdown that opens ready at 10:00.",
      },
      {
        title: "15 Minute Timer",
        href: "/15-minute-timer",
        description:
          "Start a direct fifteen-minute countdown that opens ready at 15:00.",
      },
      {
        title: "30 Minute Timer",
        href: "/30-minute-timer",
        description:
          "Start a direct half-hour countdown that opens ready at 30:00.",
      },
      {
        title: "Interval Timer",
        href: "/interval-timer",
        description:
          "Build a custom interval timer with labeled steps, repeats, and fullscreen display.",
      },
      {
        title: "Millisecond Timer",
        href: "/millisecond-timer",
        description:
          "Run a countdown timer with visible milliseconds and custom millisecond input.",
      },
      {
        title: "Presentation Timer",
        href: "/presentation-timer",
        description:
          "Keep speeches, talks, and presentations on time with a clear timer.",
      },
      {
        title: "Speech Timer",
        href: "/speech-timer",
        description:
          "Practice or deliver a talk with visible speaking-time warning thresholds.",
      },
      {
        title: "Classroom Timer",
        href: "/classroom-timer",
        description:
          "Use a simple classroom timer for activities, transitions, and lessons.",
      },
      {
        title: "Meeting Timer",
        href: "/meeting-timer",
        description:
          "Keep meetings focused with visible timing for agendas and discussion blocks.",
      },
      {
        title: "Meeting Agenda Timer",
        href: "/meeting-agenda-timer",
        description:
          "Run meeting agenda items one by one with active item timing.",
      },
      {
        title: "Exam Timer",
        href: "/exam-timer",
        description:
          "Run a clear exam or test timer for classrooms and study sessions.",
      },
      {
        title: "Break Timer",
        href: "/break-timer",
        description:
          "Set break timers for work, study, training, and daily routines.",
      },
      {
        title: "Study Timer",
        href: "/study-timer",
        description:
          "Use structured timing for homework, exam prep, reading, and focus blocks.",
      },
      {
        title: "Focus Session Timer",
        href: "/focus-session-timer",
        description:
          "Run focused work sessions with a clean browser-based timer.",
      },
      {
        title: "Productivity Timer",
        href: "/productivity-timer",
        description:
          "Time deep work, admin tasks, writing blocks, and productivity sessions.",
      },
      {
        title: "Multiple Timers",
        href: "/multiple-timers",
        description:
          "Run multiple timers for separate tasks, rounds, reminders, or activities.",
      },
      {
        title: "Visual Timer",
        href: "/visual-timer",
        description:
          "Use a visual countdown display for easier time awareness.",
      },
      {
        title: "Alarm Timer",
        href: "/alarm-timer",
        description:
          "Set a timer with an alarm-style alert when time is finished.",
      },
      {
        title: "Online Alarm Clock",
        href: "/online-alarm-clock",
        description:
          "Set an alarm for a time of day with next occurrence labels and optional sound.",
      },
      {
        title: "Count Up Timer",
        href: "/count-up-timer",
        description:
          "Count upward from zero to track elapsed time during an activity.",
      },
      {
        title: "Meeting Count Up Timer",
        href: "/meeting-count-up-timer",
        description:
          "Track how long a meeting, call, or discussion has been running.",
      },
    ],
  },
  {
    title: "Workout and interval timers",
    description:
      "Timers for fitness, training sessions, stretching, intervals, rounds, and pacing.",
    links: [
      {
        title: "Workout Timer",
        href: "/workout-timer",
        description:
          "Time workouts, circuits, sets, rest periods, and training sessions.",
      },
      {
        title: "Rest Timer",
        href: "/rest-timer",
        description:
          "Track rest between sets, exercises, rounds, or practice attempts.",
      },
      {
        title: "Tabata Timer",
        href: "/tabata-timer",
        description:
          "Run Tabata-style intervals with repeated work and rest blocks.",
      },
      {
        title: "Stretch Timer",
        href: "/stretch-timer",
        description:
          "Time stretching routines, mobility sessions, and flexibility holds.",
      },
      {
        title: "EMOM Timer",
        href: "/emom-timer",
        description:
          "Run every-minute-on-the-minute workouts and training intervals.",
      },
      {
        title: "AMRAP Timer",
        href: "/amrap-timer",
        description:
          "Set a fixed time block for as-many-rounds-as-possible workouts.",
      },
      {
        title: "Round Timer",
        href: "/round-timer",
        description:
          "Use round-based timing for boxing, martial arts, drills, and circuits.",
      },
      {
        title: "Boxing Timer",
        href: "/boxing-timer",
        description:
          "Run boxing-style rounds with rest periods, prep time, presets, sound cues, and fullscreen support.",
      },
      {
        title: "Pace Timer",
        href: "/pace-timer",
        description:
          "Time repeated actions, pacing drills, practice reps, and rhythm work.",
      },
    ],
  },
  {
    title: "Cooking and daily routine timers",
    description:
      "Simple timers for food, drinks, sleep, hydration, meditation, breathing, and everyday reminders.",
    links: [
      {
        title: "Cooking Timer",
        href: "/cooking-timer",
        description:
          "Time cooking tasks, baking steps, simmering, resting, and prep work.",
      },
      {
        title: "Kitchen Timer",
        href: "/kitchen-timer",
        description:
          "Use a simple kitchen timer with common presets and custom minutes and seconds.",
      },
      {
        title: "Tea Timer",
        href: "/tea-timer",
        description:
          "Time tea steeping for black, green, herbal, and specialty teas.",
      },
      {
        title: "Egg Timer",
        href: "/egg-timer",
        description: "Time soft-boiled, medium-boiled, and hard-boiled eggs.",
      },
      {
        title: "Pizza Timer",
        href: "/pizza-timer",
        description: "Time pizza baking, reheating, resting, and oven checks.",
      },
      {
        title: "Meditation Timer",
        href: "/meditation-timer",
        description:
          "Use a calm timer for meditation, mindfulness, and quiet sessions.",
      },
      {
        title: "Breathing Timer",
        href: "/breathing-timer",
        description:
          "Follow timed breathing intervals for relaxation and focus.",
      },
      {
        title: "Sleep Timer",
        href: "/sleep-timer",
        description: "Set a simple sleep countdown or wind-down timer.",
      },
      {
        title: "Drink Water Reminder Timer",
        href: "/drink-water-reminder-timer",
        description:
          "Set hydration reminder intervals during work, study, or daily routines.",
      },
      {
        title: "Lab Timer",
        href: "/lab-timer",
        description:
          "Track timed lab steps, experiments, incubation, and process intervals.",
      },
    ],
  },
  {
    title: "Clocks and time displays",
    description:
      "Clock pages for local time, world time, UTC, visual clock styles, astronomy, and alternate time formats.",
    links: [
      {
        title: "World Clock",
        href: "/world-clock",
        description:
          "Check current times across cities and time zones around the world.",
      },
      {
        title: "Current Local Time",
        href: "/current-local-time",
        description:
          "View the current local time in a clean browser-based display.",
      },
      {
        title: "UTC Clock",
        href: "/utc-clock",
        description:
          "View the current Coordinated Universal Time in your browser.",
      },
      {
        title: "24 Hour Clock",
        href: "/24-hour-clock",
        description:
          "View the current time in 24-hour format with seconds, date, copy, and fullscreen support.",
      },
      {
        title: "12 Hour Clock",
        href: "/12-hour-clock",
        description:
          "View the current time in 12-hour AM/PM format with seconds, date, copy, and fullscreen support.",
      },
      {
        title: "Military Time Clock",
        href: "/military-time-clock",
        description:
          "View the current time as a live 24-hour military-style clock.",
      },
      {
        title: "Analog Clock",
        href: "/analog-clock",
        description:
          "Use a classic analog clock display with hour, minute, and second hands.",
      },
      {
        title: "Smooth Second Hand Clock",
        href: "/smooth-second-hand-clock",
        description:
          "Use an analog clock that defaults to smooth sweeping second-hand motion.",
      },
      {
        title: "Digital Clock",
        href: "/digital-clock",
        description:
          "View a clean digital clock for desktop, mobile, or fullscreen use.",
      },
      {
        title: "Clock With Seconds",
        href: "/clock-with-seconds",
        description:
          "View a live online clock with seconds visible by default.",
      },
      {
        title: "Clock With Milliseconds",
        href: "/clock-with-milliseconds",
        description:
          "View current local or UTC time with large live milliseconds.",
      },
      {
        title: "Binary Clock",
        href: "/binary-clock",
        description: "Display the current time in binary format.",
      },
      {
        title: "Hexadecimal Clock",
        href: "/hexadecimal-clock",
        description: "View time in a hexadecimal-style clock format.",
      },
      {
        title: "Morse Code Clock",
        href: "/morse-code-clock",
        description: "Display the current time using Morse code patterns.",
      },
      {
        title: "Fibonacci Clock",
        href: "/fibonacci-clock",
        description: "Show time with a Fibonacci-inspired visual clock layout.",
      },
      {
        title: "Sunrise Sunset Clock",
        href: "/sunrise-sunset-clock",
        description: "Track daylight timing around sunrise and sunset.",
      },
      {
        title: "Golden Hour Clock",
        href: "/golden-hour-clock",
        description:
          "Track golden hour timing for photography, filming, and outdoor planning.",
      },
      {
        title: "Moon Phase Clock",
        href: "/moon-phase-clock",
        description: "View moon phase timing and lunar cycle information.",
      },
      {
        title: "Astronomical Clock",
        href: "/astronomical-clock",
        description:
          "Use an astronomy-focused clock for sky and time-based reference.",
      },
      {
        title: "Epoch Unix Time Clock",
        href: "/epoch-unix-time-clock",
        description: "View the current Unix timestamp and epoch time.",
      },
      {
        title: "Swatch Internet Time Clock",
        href: "/swatch-internet-time-clock",
        description: "View time using Swatch Internet Time beats.",
      },
      {
        title: "Atomic Clock",
        href: "/atomic-clock",
        description: "Use a precise atomic-clock-style time display.",
      },
      {
        title: "Roman Numeral Clock",
        href: "/roman-numeral-clock",
        description:
          "Display the current time with Roman numeral clock styling.",
      },
      {
        title: "Retro Flip Clock",
        href: "/retro-flip-clock",
        description: "Use a retro flip-clock style time display.",
      },
      {
        title: "Minimalist Clock",
        href: "/minimalist-clock",
        description:
          "View a clean minimalist clock with reduced visual clutter.",
      },
      {
        title: "Debt Clock",
        href: "/debt-clock",
        description:
          "Track debt-related time and payoff progress in a clock-style format.",
      },
      {
        title: "Billable Hours Clock",
        href: "/billable-hours-clock",
        description: "Track billable work time with a clock-style display.",
      },
      {
        title: "Time Blocking Clock",
        href: "/time-blocking-clock",
        description:
          "Use a clock display for time blocking and daily schedule awareness.",
      },
    ],
  },
  {
    title: "Calculators and converters",
    description:
      "Time conversion and calculation tools for work hours, billable hours, time zones, and units of time.",
    links: [
      {
        title: "Time Zone Converter",
        href: "/time-zone-converter",
        description:
          "Convert times between different time zones for meetings, travel, and planning.",
      },
      {
        title: "Time Zone Meeting Planner",
        href: "/time-zone-meeting-planner",
        description:
          "Plan meeting times across multiple time zones using date, duration, and work windows.",
      },
      {
        title: "Military Time Converter",
        href: "/military-time-converter",
        description: "Convert between 12-hour time and 24-hour military time.",
      },
      {
        title: "Unix Timestamp Converter",
        href: "/unix-timestamp-converter",
        description:
          "Convert Unix timestamps to UTC, local time, ISO, seconds, and milliseconds.",
      },
      {
        title: "Work Hours Calculator",
        href: "/work-hours-calculator",
        description:
          "Calculate work hours, shifts, breaks, and total time worked.",
      },
      {
        title: "Time Calculator",
        href: "/time-calculator",
        description:
          "Add, subtract, and calculate durations using hours, minutes, and seconds.",
      },
      {
        title: "Billable Hours Calculator",
        href: "/billable-hours-calculator",
        description:
          "Calculate billable time totals for freelance, consulting, legal, or client work.",
      },
      {
        title: "Milliseconds Converter",
        href: "/milliseconds-converter",
        description:
          "Convert milliseconds to seconds, minutes, hours, and readable time formats.",
      },
    ],
  },
  {
    title: "Games, tests, rhythm, and specialty tools",
    description:
      "Timing tools for games, speedruns, rhythm, reaction time, and unusual timer formats.",
    links: [
      {
        title: "Chess Clock",
        href: "/chess-clock",
        description:
          "Use a casual two-player chess clock with presets, increment, and fullscreen mode.",
      },
      {
        title: "Reaction Time Test",
        href: "/reaction-time-test",
        description: "Test how quickly you react to a visual prompt.",
      },
      {
        title: "Metronome",
        href: "/metronome",
        description:
          "Use a steady beat for music practice, rhythm drills, or pacing.",
      },
      {
        title: "BPM Tapper",
        href: "/bpm-tapper",
        description: "Tap along to estimate beats per minute.",
      },
      {
        title: "Speedcubing Timer",
        href: "/speedcubing-timer",
        description:
          "Time Rubik's Cube solves and speedcubing practice sessions.",
      },
      {
        title: "Binary Stopwatch",
        href: "/binary-stopwatch",
        description:
          "Track elapsed time with a binary-style stopwatch display.",
      },
      {
        title: "Chaos Timer",
        href: "/chaos-timer",
        description:
          "Use an unpredictable or unusual timer for challenges and games.",
      },
      {
        title: "Video Game Challenge Timer",
        href: "/video-game-challenge-timer",
        description:
          "Time gaming challenges, practice sessions, and in-game tasks.",
      },
      {
        title: "Speedrun Timer",
        href: "/speedrun-timer",
        description:
          "Track speedrun attempts, practice segments, and challenge runs.",
      },
      {
        title: "Event Countdown",
        href: "/event-countdown",
        description:
          "Count down to a specific event, deadline, launch, or special date.",
      },
      {
        title: "New Year Countdown",
        href: "/new-year-countdown",
        description:
          "Count down to the next January 1 in your local timezone.",
      },
      {
        title: "Debt Repayment Timer",
        href: "/debt-repayment-timer",
        description: "Track debt repayment timing and payoff progress.",
      },
    ],
  },
  {
    title: "Legal and policy pages",
    description: "Sitemap, privacy, terms, and cookie information for the site.",
    links: [
      {
        title: "HTML Sitemap",
        href: "/sitemap",
        description: "Browse every public page available on I Love Timers.",
      },
      {
        title: "Privacy Policy",
        href: "/privacy",
        description:
          "Read how privacy and data handling work on I Love Timers.",
      },
      {
        title: "Terms of Service",
        href: "/terms",
        description: "Read the terms that apply when using I Love Timers.",
      },
      {
        title: "Cookies Policy",
        href: "/cookies",
        description:
          "Read how cookies and similar browser technologies are handled.",
      },
    ],
  },
];

const allLinks = SECTIONS.flatMap((section) => section.links);

export function meta({}: Route.MetaArgs) {
  const title = "HTML Sitemap | I Love Timers";
  const description =
    "Browse every timer, stopwatch, clock, calculator, converter, and policy page on I Love Timers.";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `${SITE_URL}/sitemap` },
    { property: "og:image", content: `${SITE_URL}/og-image.png` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { rel: "canonical", href: `${SITE_URL}/sitemap` },
    { name: "theme-color", content: "#ffffff" },
  ];
}

export default function Sitemap() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "HTML Sitemap",
        url: `${SITE_URL}/sitemap`,
        description: "Browse every public page available on I Love Timers.",
        isPartOf: {
          "@type": "WebSite",
          name: "I Love Timers",
          url: SITE_URL,
        },
      },
      {
        "@type": "ItemList",
        name: "I Love Timers HTML Sitemap",
        numberOfItems: allLinks.length,
        itemListElement: allLinks.map((link, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: link.title,
          url: `${SITE_URL}${link.href === "/" ? "" : link.href}`,
        })),
      },
    ],
  };

  return (
    <ContentPage
      title="HTML Sitemap"
      description="Browse every public page on I Love Timers, including countdown timers, stopwatches, Pomodoro tools, workout timers, clocks, calculators, converters, and policy pages."
      meta={`${allLinks.length} pages. Updated May 22, 2026`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section>
          <h2 className="text-xl font-bold text-[var(--ilt-text-primary)]">Jump to a section</h2>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {SECTIONS.map((section) => (
              <a
                key={section.title}
                href={`#${slugify(section.title)}`}
                className="ilt-focus-ring cursor-pointer text-sm font-semibold text-[var(--ilt-text-primary)] underline decoration-[var(--ilt-border-strong)] underline-offset-4 hover:decoration-[var(--ilt-accent)]"
              >
                {section.title}
              </a>
            ))}
          </div>
      </section>

      <div className="space-y-10">
          {SECTIONS.map((section) => (
            <section
              key={section.title}
              id={slugify(section.title)}
              className="scroll-mt-8"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--ilt-text-primary)]">
                    {section.title}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                    {section.description}
                  </p>
                </div>

                <span className="w-fit text-xs font-bold uppercase tracking-[0.16em] text-[var(--ilt-text-muted)]">
                  {section.links.length} pages
                </span>
              </div>

              <div className="mt-5 grid gap-x-8 gap-y-5 md:grid-cols-2 lg:grid-cols-3">
                {section.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="ilt-focus-ring group block cursor-pointer"
                  >
                    <h3 className="text-base font-bold text-[var(--ilt-text-primary)] underline decoration-[var(--ilt-border-strong)] underline-offset-4 group-hover:decoration-[var(--ilt-accent)]">
                      {link.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                      {link.description}
                    </p>
                    <div className="mt-2 text-xs font-semibold text-[var(--ilt-text-muted)]">
                      {link.href}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
      </div>
    </ContentPage>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
