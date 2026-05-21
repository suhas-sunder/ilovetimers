import type { Route } from "./+types/about";
import { useMemo } from "react";
import {
  ButtonLink,
  ContentPage,
  ContentPanel,
  ContentSection,
  StatusChip,
} from "~/clients/components/ui/foundation";

const SITE_URL = "https://www.ilovetimers.com";
const PAGE_PATH = "/about";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const CREATOR_URL = "https://www.suhassunder.com";
const CREATOR_LINKEDIN = "https://www.linkedin.com/in/s-sunder";

const sectionLinks = [
  ["#what-this-is", "What this is"],
  ["#tool-categories", "Tool categories"],
  ["#design-principles", "Design principles"],
  ["#what-this-is-not", "What this is not"],
  ["#author", "Author"],
];

const featureHighlights = [
  {
    title: "Free and immediate",
    body: "No account is required for the core tools. Open a page, set the time, and start.",
  },
  {
    title: "Built for real use cases",
    body: "The site includes timers for meetings, classrooms, workouts, studying, cooking, presentations, clocks, and time calculations.",
  },
  {
    title: "Browser-based tools",
    body: "The tools are designed to run directly in your browser with clear controls, readable displays, and practical fullscreen modes where they make sense.",
  },
];

const toolCategories = [
  {
    title: "Core timers",
    href: "/online-timer",
    body: "General-purpose online timers, countdown timers, fullscreen timers, silent timers, alarm timers, multiple timers, count-up timers, and visual timers.",
  },
  {
    title: "Focus and productivity",
    href: "/pomodoro-timer",
    body: "Pomodoro timers, focus session timers, productivity timers, time-blocking tools, break timers, study timers, and work-hours calculators.",
  },
  {
    title: "Meetings, classrooms, and presentations",
    href: "/meeting-timer",
    body: "Timers for meetings, presentations, classrooms, exams, billable hours, and structured sessions where visible time helps keep people on track.",
  },
  {
    title: "Fitness and intervals",
    href: "/hiit-timer",
    body: "HIIT timers, Tabata timers, EMOM timers, AMRAP timers, round timers, rest timers, stretch timers, pace timers, and workout timers.",
  },
  {
    title: "Everyday timers",
    href: "/cooking-timer",
    body: "Cooking, tea, egg, pizza, sleep, meditation, and water reminder timers for everyday routines.",
  },
  {
    title: "Clocks and time tools",
    href: "/world-clock",
    body: "World clocks, UTC clocks, analog and digital clocks, time zone converters, military time converters, Unix time clocks, and other time formats.",
  },
];

const designPrinciples = [
  {
    title: "Clear controls",
    body: "Controls should be obvious, readable, and limited to what affects the timer. Extra settings are avoided unless they make the tool meaningfully better.",
  },
  {
    title: "Readable timing",
    body: "Large digits, simple layouts, and fullscreen options make timers easier to use across phones, laptops, TVs, classrooms, meeting rooms, and workouts.",
  },
  {
    title: "Accurate tracking",
    body: "Timer pages are designed to track elapsed time using browser timing APIs and absolute time where appropriate, reducing drift compared with naive ticking loops.",
  },
  {
    title: "No unnecessary account flow",
    body: "The core use case is immediate timing. The site should not make users create an account just to run a countdown, stopwatch, clock, or interval timer.",
  },
];

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "About I Love Timers | Free Online Timers and Clocks";
  const description =
    "Learn what I Love Timers is, who built it, and how its countdown timers, stopwatches, Pomodoro timers, interval timers, clocks, and time tools are designed.";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: PAGE_URL },
    { property: "og:image", content: `${SITE_URL}/og-image.jpg` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { rel: "canonical", href: PAGE_URL },
    { name: "theme-color", content: "#ffffff" },
  ];
}

export default function About() {
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          name: "I Love Timers",
          url: `${SITE_URL}/`,
          description:
            "Free online timers, stopwatches, clocks, countdowns, interval timers, and time tools.",
        },
        {
          "@type": "AboutPage",
          name: "About I Love Timers",
          url: PAGE_URL,
          description:
            "Learn what I Love Timers is, who built it, and how its countdown timers, stopwatches, Pomodoro timers, interval timers, clocks, and time tools are designed.",
          isPartOf: {
            "@type": "WebSite",
            name: "I Love Timers",
            url: `${SITE_URL}/`,
          },
          about: {
            "@type": "WebApplication",
            name: "I Love Timers",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Any",
            url: `${SITE_URL}/`,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Countdown timer",
              "Stopwatch with laps",
              "Pomodoro timer",
              "HIIT interval timer",
              "Fullscreen timer",
              "Silent timer",
              "Classroom timer",
              "Meeting timer",
              "Presentation timer",
              "World clock",
              "Time zone converter",
              "Time calculator",
            ],
          },
          author: {
            "@type": "Person",
            name: "Suhas Sunder",
            jobTitle: "Software Developer",
            url: CREATOR_URL,
            sameAs: [CREATOR_URL, CREATOR_LINKEDIN],
          },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: `${SITE_URL}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "About",
              item: PAGE_URL,
            },
          ],
        },
      ],
    }),
    [],
  );

  const breadcrumb = (
    <>
      <a href="/" className="font-medium text-slate-700 hover:underline">
        Home
      </a>{" "}
      / <span className="text-slate-950">About</span>
    </>
  );

  return (
    <ContentPage
      title="About I Love Timers"
      description="I Love Timers is a free collection of browser-based timers, stopwatches, clocks, countdowns, and time tools built for quick everyday use. The goal is simple: open the right timer, set it fast, and keep time without fighting the interface."
      meta={breadcrumb}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-wrap gap-3" data-nosnippet>
        <ButtonLink href="/online-timer" variant="primary">
          Open online timer
        </ButtonLink>
        <ButtonLink href="/stopwatch">Open stopwatch</ButtonLink>
      </div>

      <nav
        aria-label="About page sections"
        className="flex flex-wrap gap-2"
        data-nosnippet
      >
        {sectionLinks.map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="ilt-focus-ring cursor-pointer rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-amber-50 hover:text-slate-950"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="grid gap-4 md:grid-cols-3">
        {featureHighlights.map((item) => (
          <ContentPanel key={item.title}>
            <h2 className="text-base font-bold text-slate-950">
              {item.title}
            </h2>
            <p className="mt-2">{item.body}</p>
          </ContentPanel>
        ))}
      </div>

      <ContentSection id="what-this-is" title="What I Love Timers is">
        <p>
          I Love Timers is a practical toolkit for timing things online. Some
          people need a simple countdown. Others need a stopwatch with laps, a
          Pomodoro focus timer, an interval timer for workouts, a classroom
          timer, a presentation timer, a world clock, or a time converter. The
          site brings those jobs into one focused collection instead of forcing
          every use case through one generic timer.
        </p>

        <p>
          The homepage highlights the main tools: a countdown timer, stopwatch,
          Pomodoro timer, and HIIT interval timer. Separate pages cover more
          specific situations, including silent timing, fullscreen timing,
          meetings, exams, workouts, cooking, meditation, speedcubing, alarms,
          multiple timers, time zones, and clocks.
        </p>
      </ContentSection>

      <ContentSection id="tool-categories" title="What the site includes">
        <div className="grid gap-4 md:grid-cols-2">
          {toolCategories.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="ilt-focus-ring block cursor-pointer rounded-[var(--ilt-radius-card)] bg-slate-50 p-4 transition hover:bg-amber-50"
            >
              <h3 className="text-base font-bold text-slate-950">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {item.body}
              </p>
            </a>
          ))}
        </div>
      </ContentSection>

      <ContentSection id="design-principles" title="How the tools are designed">
        <p>
          The site is built around narrow, task-specific pages. A meeting timer
          should not feel like a workout timer. A stopwatch should not need the
          same controls as a Pomodoro timer. A classroom timer needs readability
          and low friction. A speedcubing timer needs fast start and stop
          behavior. Each page should match the job users came to do.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {designPrinciples.map((item) => (
            <ContentPanel key={item.title}>
              <h3 className="text-base font-bold text-slate-950">
                {item.title}
              </h3>
              <p className="mt-2">{item.body}</p>
            </ContentPanel>
          ))}
        </div>

        <p>
          For the main homepage tools, keyboard shortcuts are part of the
          workflow: start, pause, reset, lap, skip, and fullscreen actions can
          be controlled without hunting through the interface.
        </p>
      </ContentSection>

      <ContentSection id="what-this-is-not" title="What this is not">
        <p>
          I Love Timers is not intended to replace specialized, safety-critical,
          professional, or regulated timing equipment. Browser timers are useful
          for everyday planning, work, study, cooking, meetings, workouts, and
          reference, but they still depend on the device, browser, audio
          permissions, battery settings, and operating system behavior.
        </p>

        <ul className="space-y-2 pl-5">
          <li className="list-disc">
            <strong>Not emergency equipment:</strong> do not rely on the site
            for medical, safety, rescue, or life-critical timing.
          </li>
          <li className="list-disc">
            <strong>Not a replacement for native alarms:</strong> browser tabs
            can be paused, muted, closed, or affected by device sleep settings.
          </li>
          <li className="list-disc">
            <strong>Not professional measurement hardware:</strong> use proper
            instruments where exact timing has legal, scientific, athletic, or
            contractual consequences.
          </li>
          <li className="list-disc">
            <strong>Not financial advice:</strong> clocks or calculators related
            to billable hours, debt, or repayment are informational tools only.
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="author" title="Built and maintained by">
        <div className="grid gap-5 md:grid-cols-12">
          <div className="space-y-3 md:col-span-7">
            <p>
              I Love Timers is built and maintained by{" "}
              <strong>Suhas Sunder</strong>, a software developer based in the
              Toronto area. I build production web applications and focused web
              utilities with an emphasis on practical workflows, clear
              interfaces, and fast user interaction.
            </p>

            <p>
              This site exists because timing tools are often either too generic
              or cluttered with distractions. A countdown timer, presentation
              timer, HIIT timer, classroom timer, Pomodoro timer, and world
              clock all have different jobs. I Love Timers is meant to give each
              job a cleaner page without making the user work harder than
              necessary.
            </p>

            <p>
              The product direction is simple: useful timer and time tools that
              load quickly, explain their purpose clearly, and stay focused on
              the task.
            </p>
          </div>

          <ContentPanel className="md:col-span-5">
            <StatusChip>Developer profile</StatusChip>
            <p className="mt-3">
              Full-stack web development with React, TypeScript, Node.js,
              Express, Remix, PostgreSQL, Prisma, Tailwind CSS, responsive UI,
              and production web application work.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <ButtonLink href={CREATOR_URL} variant="primary">
                Portfolio
              </ButtonLink>
              <ButtonLink href={CREATOR_LINKEDIN}>LinkedIn</ButtonLink>
            </div>
          </ContentPanel>
        </div>
      </ContentSection>

      <ContentSection
        title="Start with a timer"
        className="bg-amber-50 text-slate-950"
      >
        <p className="max-w-3xl">
          The fastest way to understand the site is to use one of the core
          tools. Start a countdown, run the stopwatch, or open a focus timer and
          adjust the session to match what you are doing.
        </p>

        <div className="flex flex-wrap gap-3" data-nosnippet>
          <ButtonLink href="/countdown-timer" variant="primary">
            Countdown timer
          </ButtonLink>
          <ButtonLink href="/stopwatch">Stopwatch</ButtonLink>
          <ButtonLink href="/pomodoro-timer">Pomodoro timer</ButtonLink>
          <ButtonLink href="/hiit-timer">HIIT timer</ButtonLink>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
