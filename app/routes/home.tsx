import type { Route } from "./+types/home";
import {
  AdPlaceholder,
  ButtonLink,
  PageShell,
} from "~/clients/components/ui/foundation";

const SITE_URL = "https://www.ilovetimers.com";

type LinkItem = {
  title: string;
  href: string;
  description: string;
};

type Category = {
  title: string;
  description: string;
  links: LinkItem[];
};

const popularTimers: LinkItem[] = [
  {
    title: "Countdown Timer",
    href: "/countdown-timer",
    description: "Set a clear countdown for tasks and breaks.",
  },
  {
    title: "Online Timer",
    href: "/online-timer",
    description: "Start a browser timer without setup.",
  },
  {
    title: "Fullscreen Timer",
    href: "/fullscreen-timer",
    description: "Show a large timer on any screen.",
  },
  {
    title: "Stopwatch",
    href: "/stopwatch",
    description: "Measure elapsed time and laps.",
  },
  {
    title: "Pomodoro Timer",
    href: "/pomodoro-timer",
    description: "Work in focused blocks.",
  },
  {
    title: "Digital Clock",
    href: "/digital-clock",
    description: "Show the current time clearly.",
  },
  {
    title: "World Clock",
    href: "/world-clock",
    description: "Compare cities and time zones.",
  },
  {
    title: "Multiple Timers",
    href: "/multiple-timers",
    description: "Run several timers at once.",
  },
  {
    title: "Alarm Timer",
    href: "/alarm-timer",
    description: "Use a countdown with an alert.",
  },
  {
    title: "Visual Timer",
    href: "/visual-timer",
    description: "See time passing visually.",
  },
  {
    title: "Workout Timer",
    href: "/workout-timer",
    description: "Time sets and circuits.",
  },
  {
    title: "Study Timer",
    href: "/study-timer",
    description: "Keep study blocks structured.",
  },
  {
    title: "Cooking Timer",
    href: "/cooking-timer",
    description: "Time cooking and resting.",
  },
  {
    title: "Classroom Timer",
    href: "/classroom-timer",
    description: "Time activities and transitions.",
  },
  {
    title: "Exam Timer",
    href: "/exam-timer",
    description: "Run a calm exam timer.",
  },
  {
    title: "Time Zone Converter",
    href: "/time-zone-converter",
    description: "Convert time between zones.",
  },
];

const categories: Category[] = [
  {
    title: "Basic timers",
    description: "Fast countdowns, stopwatches, alarms, and visual displays.",
    links: [
      popularTimers[0],
      popularTimers[1],
      popularTimers[2],
      popularTimers[3],
      popularTimers[7],
      popularTimers[8],
      popularTimers[9],
    ],
  },
  {
    title: "Focus and study",
    description: "Timers for focused work, study blocks, breaks, and planning.",
    links: [
      popularTimers[4],
      popularTimers[11],
      {
        title: "Focus Session Timer",
        href: "/focus-session-timer",
        description: "Run one clean deep-work session.",
      },
      {
        title: "Break Timer",
        href: "/break-timer",
        description: "Keep breaks intentional and visible.",
      },
      {
        title: "Time Blocking Clock",
        href: "/time-blocking-clock",
        description: "See the current block in a daily schedule.",
      },
    ],
  },
  {
    title: "Work and meetings",
    description: "Meeting, presentation, classroom, exam, and billable timing.",
    links: [
      {
        title: "Meeting Timer",
        href: "/meeting-timer",
        description: "Keep agenda blocks on schedule.",
      },
      {
        title: "Meeting Count Up Timer",
        href: "/meeting-count-up-timer",
        description: "Show how long a meeting has run.",
      },
      {
        title: "Presentation Timer",
        href: "/presentation-timer",
        description: "Track talk time and warnings.",
      },
      popularTimers[13],
      popularTimers[14],
      {
        title: "Billable Hours Calculator",
        href: "/billable-hours-calculator",
        description: "Calculate billable totals from time and rate.",
      },
    ],
  },
  {
    title: "Cooking and daily tasks",
    description: "Everyday timers for food, tea, sleep, and reminders.",
    links: [
      popularTimers[12],
      {
        title: "Egg Timer",
        href: "/egg-timer",
        description: "Time soft, medium, and hard-boiled eggs.",
      },
      {
        title: "Pizza Timer",
        href: "/pizza-timer",
        description: "Time baking, reheating, and resting.",
      },
      {
        title: "Tea Timer",
        href: "/tea-timer",
        description: "Use steeping presets for different teas.",
      },
      {
        title: "Sleep Timer",
        href: "/sleep-timer",
        description: "Set a simple wind-down countdown.",
      },
    ],
  },
  {
    title: "Workout and interval timers",
    description: "Training timers for intervals, rounds, rest, and pacing.",
    links: [
      popularTimers[10],
      {
        title: "HIIT Timer",
        href: "/hiit-timer",
        description: "Run warm-up, work, rest, and cooldown blocks.",
      },
      {
        title: "Tabata Timer",
        href: "/tabata-timer",
        description: "Use repeated high-intensity intervals.",
      },
      {
        title: "Round Timer",
        href: "/round-timer",
        description: "Time rounds for training and drills.",
      },
      {
        title: "Rest Timer",
        href: "/rest-timer",
        description: "Track recovery between sets.",
      },
    ],
  },
  {
    title: "Clocks and time zones",
    description: "Readable clocks, world time, UTC, and time conversion.",
    links: [
      popularTimers[5],
      popularTimers[6],
      popularTimers[15],
      {
        title: "UTC Clock",
        href: "/utc-clock",
        description: "Display current Coordinated Universal Time.",
      },
      {
        title: "Current Local Time",
        href: "/current-local-time",
        description: "Show your browser's local time and date.",
      },
      {
        title: "Analog Clock",
        href: "/analog-clock",
        description: "Use a classic analog clock face.",
      },
    ],
  },
  {
    title: "Specialty timers and tools",
    description: "Utilities for rhythm, games, conversions, and unusual displays.",
    links: [
      {
        title: "Metronome",
        href: "/metronome",
        description: "Set a steady beat for practice.",
      },
      {
        title: "BPM Tapper",
        href: "/bpm-tapper",
        description: "Tap to estimate beats per minute.",
      },
      {
        title: "Reaction Time Test",
        href: "/reaction-time-test",
        description: "Measure visual reaction speed.",
      },
      {
        title: "Time Calculator",
        href: "/time-calculator",
        description: "Add and subtract time values.",
      },
      {
        title: "Milliseconds Converter",
        href: "/milliseconds-converter",
        description: "Convert milliseconds into readable units.",
      },
    ],
  },
];

const valuePoints = [
  "Large readable displays",
  "Simple controls",
  "Fullscreen support",
  "No account required",
];

const faqItems = [
  {
    question: "Are the timers free to use?",
    answer:
      "Yes. The timer, clock, stopwatch, calculator, and converter pages are free to use in your browser.",
  },
  {
    question: "Do the timers work in fullscreen?",
    answer:
      "Many timer and clock pages include fullscreen controls so the display stays readable from across a room.",
  },
  {
    question: "Can I use the timers for studying, cooking, workouts, and meetings?",
    answer:
      "Yes. The site has separate pages for focus sessions, cooking, classroom use, presentations, workouts, exams, meetings, and daily reminders.",
  },
  {
    question: "Are the timers accurate?",
    answer:
      "Timer pages are built around current browser time sources instead of accumulating interval drift. Background tabs may pause visual updates, then reconcile when the browser resumes.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. The tools run directly in the browser and do not require signup.",
  },
  {
    question: "What is the difference between the timer pages?",
    answer:
      "Each page keeps the controls and display focused on a specific task, such as cooking, studying, meetings, workouts, clocks, or time conversion.",
  },
];

export function meta({}: Route.MetaArgs) {
  const title = "I Love Timers | Simple Online Timers, Clocks and Time Tools";
  const description =
    "Simple online timers for focus, work, cooking, workouts, clocks, and daily tasks. Large readable displays, clean controls, and fullscreen support.";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: SITE_URL },
    { property: "og:image", content: `${SITE_URL}/og-image.png` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { tagName: "link", rel: "canonical", href: SITE_URL },
    { name: "theme-color", content: "#ffffff" },
  ];
}

function PopularRow({ item }: { item: LinkItem }) {
  return (
    <a
      href={item.href}
      className="ilt-focus-ring group block cursor-pointer py-2"
    >
      <span className="block">
        <span className="text-sm font-bold text-[var(--ilt-text-primary)] underline decoration-[var(--ilt-accent)] decoration-1 underline-offset-4 transition group-hover:text-[var(--ilt-accent-hover)] group-hover:decoration-[var(--ilt-accent-hover)] sm:text-base">
          {item.title}
        </span>
        <span className="mt-0.5 block text-sm leading-5 text-[var(--ilt-text-secondary)]">
          {item.description}
        </span>
      </span>
    </a>
  );
}

function QuickStartLink({ item }: { item: LinkItem }) {
  return (
    <a
      href={item.href}
      className="ilt-focus-ring cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-[var(--ilt-accent)] decoration-1 underline-offset-4 transition hover:text-[var(--ilt-accent-hover)] hover:decoration-[var(--ilt-accent-hover)]"
    >
      <span>{item.title}</span>
    </a>
  );
}

function CategoryLink({ item }: { item: LinkItem }) {
  return (
    <a
      href={item.href}
      className="ilt-focus-ring inline-flex cursor-pointer items-center py-1 text-sm font-semibold text-[var(--ilt-text-primary)] underline decoration-[var(--ilt-accent)] decoration-1 underline-offset-4 transition hover:text-[var(--ilt-accent-hover)] hover:decoration-[var(--ilt-accent-hover)]"
    >
      {item.title}
    </a>
  );
}

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "I Love Timers",
        url: `${SITE_URL}/`,
        description:
          "Simple online timers, stopwatches, clocks, calculators, converters, and timing tools.",
      },
      {
        "@type": "ItemList",
        name: "Popular I Love Timers tools",
        itemListElement: popularTimers.slice(0, 8).map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.title,
          url: `${SITE_URL}${item.href}`,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="px-[var(--ilt-page-x)] pb-8 pt-12 sm:pb-10 sm:pt-16">
        <div className="mx-auto max-w-[90rem]">
          <div className="mx-auto max-w-[58rem] text-center">
            <h1 className="mx-auto max-w-[56rem] text-3xl font-extrabold leading-[1.1] tracking-tight text-[var(--ilt-text-primary)] sm:text-4xl lg:text-[2.625rem]">
              Simple online timers for focus, work, cooking, workouts, and daily tasks
            </h1>
            <p className="mx-auto mt-4 max-w-[42rem] text-base leading-7 text-[var(--ilt-text-secondary)] sm:text-lg sm:leading-8">
              Large, clean, accurate timers with fullscreen support and no
              unnecessary clutter. Pick the timing page that fits the task.
            </p>

            <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-medium text-[var(--ilt-text-secondary)]">
              {valuePoints.map((point) => (
                <li key={point}>
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/countdown-timer" variant="primary" size="lg">
                Start a countdown
              </ButtonLink>
              <ButtonLink href="/stopwatch" size="lg">
                Open stopwatch
              </ButtonLink>
            </div>

            <div className="mx-auto mt-5 max-w-[48rem] text-sm leading-6 text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Common starts:
              </span>{" "}
              {popularTimers.slice(0, 5).map((item) => (
                <span key={item.href} className="mr-3 inline-block">
                  <QuickStartLink item={item} />
                </span>
              ))}
              <a
                href="/free-online-timers"
                className="ilt-focus-ring inline-block cursor-pointer font-semibold text-[var(--ilt-text-secondary)] underline decoration-[var(--ilt-accent)] decoration-1 underline-offset-4 transition hover:text-[var(--ilt-text-primary)] hover:decoration-[var(--ilt-accent-hover)]"
              >
                Original four-timer page
              </a>
            </div>
          </div>

        </div>
      </section>

      <section className="bg-[var(--ilt-bg-content)] px-[var(--ilt-page-x)] py-9 sm:py-11">
        <div className="mx-auto max-w-[90rem]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[var(--ilt-text-primary)] sm:text-3xl">
                Popular timers
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ilt-text-secondary)] sm:text-base">
                Get to the common timer, clock, and converter pages quickly.
              </p>
            </div>
            <a
              href="/sitemap"
              className="ilt-focus-ring cursor-pointer text-sm font-semibold text-[var(--ilt-text-secondary)] underline decoration-[var(--ilt-accent)] decoration-1 underline-offset-4 transition hover:text-[var(--ilt-text-primary)] hover:decoration-[var(--ilt-accent-hover)]"
            >
              View full sitemap
            </a>
          </div>

          <div className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularTimers.map((item) => (
              <PopularRow key={item.href} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-[var(--ilt-page-x)] py-9 sm:py-11">
        <div className="mx-auto max-w-[90rem]">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--ilt-text-primary)] sm:text-3xl">
              Browse by task
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--ilt-text-secondary)] sm:text-base">
              The site is organized around real timing jobs, not one crowded
              timer with every setting visible at once.
            </p>
          </div>

          <div className="mt-7 grid gap-x-12 gap-y-7 lg:grid-cols-2">
            {categories.map((category) => (
              <section
                key={category.title}
                className="pt-1"
              >
                <h3 className="text-lg font-extrabold tracking-tight text-[var(--ilt-text-primary)]">
                  {category.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--ilt-text-secondary)]">
                  {category.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {category.links.map((item) => (
                    <CategoryLink key={item.href} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--ilt-bg-content)] px-[var(--ilt-page-x)] py-11 sm:py-12">
        <div className="mx-auto max-w-[90rem]">
          <div className="grid gap-y-10 lg:grid-cols-[minmax(0,70ch)_300px] lg:items-start lg:gap-x-16 xl:gap-x-24">
            <section>
              <h2 className="text-2xl font-extrabold tracking-tight text-[var(--ilt-text-primary)] sm:text-3xl">
                Timers that stay out of the way
              </h2>
              <div className="mt-4 space-y-4 leading-7 text-[var(--ilt-text-secondary)]">
                <p>
                  I Love Timers is a collection of simple browser-based timers,
                  stopwatches, clocks, calculators, and converters. Each page keeps
                  the main display first, then places controls and settings where
                  they support the task.
                </p>
                <p>
                  Large displays matter when a timer is used across a room, in a
                  kitchen, during a class, or beside a workout. Fullscreen support
                  helps the active time stay readable without turning the page into
                  a presentation deck.
                </p>
                <p>
                  Different tasks need different tools. A Pomodoro session, a
                  meeting agenda, a speedcubing solve, a time zone conversion, and a
                  cooking timer should not all feel like the same crowded control
                  panel.
                </p>
                <p>
                  The goal is plain: quick setup, readable time, predictable
                  controls, and no unnecessary popups or intrusive distractions.
                </p>
                <p>
                  Prefer the older all-in-one page? The original four-timer
                  homepage is still available at{" "}
                  <a
                    href="/free-online-timers"
                    className="ilt-focus-ring cursor-pointer font-bold text-[var(--ilt-text-primary)] underline decoration-[var(--ilt-accent)] decoration-1 underline-offset-4 transition hover:text-[var(--ilt-accent-hover)] hover:decoration-[var(--ilt-accent-hover)]"
                  >
                    /free-online-timers
                  </a>
                  .
                </p>
              </div>
            </section>

            <div className="lg:pt-12">
              <AdPlaceholder slot="in-content-square" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-[var(--ilt-page-x)] py-9 sm:py-11">
        <div className="mx-auto max-w-[90rem]">
          <section>
            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--ilt-text-primary)] sm:text-3xl">
              FAQ
            </h2>
            <div className="mt-6 grid gap-x-12 gap-y-7 md:grid-cols-2">
              {faqItems.map((item) => (
                <div key={item.question}>
                  <h3 className="text-base font-extrabold text-[var(--ilt-text-primary)]">
                    {item.question}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--ilt-text-secondary)]">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <div className="px-[var(--ilt-page-x)] pb-12 pt-1">
        <div className="mx-auto max-w-[90rem]">
          <AdPlaceholder slot="bottom-banner" />
        </div>
      </div>
    </PageShell>
  );
}
