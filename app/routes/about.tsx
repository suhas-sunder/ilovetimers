import type { Route } from "./+types/about";
import { useMemo } from "react";

const SITE_URL = "https://www.ilovetimers.com";
const PAGE_PATH = "/about";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const CREATOR_URL = "https://www.suhassunder.com";
const CREATOR_LINKEDIN = "https://www.linkedin.com/in/s-sunder";

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

/* =========================================================
   LIGHTWEIGHT CONTENT PRIMITIVES
========================================================= */
function SectionCard({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-sky-700 sm:text-2xl">
          {title}
        </h2>
        <div className="mt-3 space-y-3 leading-relaxed text-slate-700">
          {children}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  body,
  href,
}: {
  title: string;
  body: string;
  href?: string;
}) {
  const content = (
    <div className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:bg-amber-50/30">
      <h3 className="text-base font-semibold text-sky-700">{title}</h3>
      <p className="mt-2 leading-relaxed text-slate-700">{body}</p>
    </div>
  );

  if (!href) return content;

  return (
    <a
      href={href}
      className="block cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
    >
      {content}
    </a>
  );
}

function InlineLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="cursor-pointer font-semibold text-sky-700 underline underline-offset-2 transition hover:text-sky-900 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
    >
      {children}
    </a>
  );
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

  return (
    <main className="bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                About the site
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-sky-700 sm:text-4xl">
                About I Love Timers
              </h1>

              <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700 sm:text-lg">
                I Love Timers is a free collection of browser-based timers,
                stopwatches, clocks, countdowns, and time tools built for quick
                everyday use. The goal is simple: open the right timer, set it
                fast, and keep time without fighting the interface.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 md:justify-end">
              <a
                href="/online-timer"
                className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
              >
                Open online timer
              </a>
              <a
                href="/stopwatch"
                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
              >
                Open stopwatch
              </a>
            </div>
          </div>

          <nav
            aria-label="About page sections"
            className="mt-6 flex flex-wrap gap-2"
            data-nosnippet
          >
            {[
              ["#what-this-is", "What this is"],
              ["#tool-categories", "Tool categories"],
              ["#design-principles", "Design principles"],
              ["#what-this-is-not", "What this is not"],
              ["#author", "Author"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="cursor-pointer rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-sky-700">
              Free and immediate
            </h2>
            <p className="mt-2 leading-relaxed text-slate-700">
              No account is required for the core tools. Open a page, set the
              time, and start.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-sky-700">
              Built for real use cases
            </h2>
            <p className="mt-2 leading-relaxed text-slate-700">
              The site includes timers for meetings, classrooms, workouts,
              studying, cooking, presentations, clocks, and time calculations.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-sky-700">
              Browser-based tools
            </h2>
            <p className="mt-2 leading-relaxed text-slate-700">
              The tools are designed to run directly in your browser with clear
              controls, readable displays, and practical fullscreen modes where
              they make sense.
            </p>
          </div>
        </div>
      </section>

      <SectionCard id="what-this-is" title="What I Love Timers is">
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
      </SectionCard>

      <SectionCard id="tool-categories" title="What the site includes">
        <div className="grid gap-4 md:grid-cols-2">
          <FeatureCard
            title="Core timers"
            href="/online-timer"
            body="General-purpose online timers, countdown timers, fullscreen timers, silent timers, alarm timers, multiple timers, count-up timers, and visual timers."
          />

          <FeatureCard
            title="Focus and productivity"
            href="/pomodoro-timer"
            body="Pomodoro timers, focus session timers, productivity timers, time-blocking tools, break timers, study timers, and work-hours calculators."
          />

          <FeatureCard
            title="Meetings, classrooms, and presentations"
            href="/meeting-timer"
            body="Timers for meetings, presentations, classrooms, exams, billable hours, and structured sessions where visible time helps keep people on track."
          />

          <FeatureCard
            title="Fitness and intervals"
            href="/hiit-timer"
            body="HIIT timers, Tabata timers, EMOM timers, AMRAP timers, round timers, rest timers, stretch timers, pace timers, and workout timers."
          />

          <FeatureCard
            title="Everyday timers"
            href="/cooking-timer"
            body="Cooking, tea, egg, pizza, sleep, meditation, and water reminder timers for everyday routines."
          />

          <FeatureCard
            title="Clocks and time tools"
            href="/world-clock"
            body="World clocks, UTC clocks, analog and digital clocks, time zone converters, military time converters, Unix time clocks, and other time formats."
          />
        </div>
      </SectionCard>

      <SectionCard id="design-principles" title="How the tools are designed">
        <p>
          The site is built around narrow, task-specific pages. A meeting timer
          should not feel like a workout timer. A stopwatch should not need the
          same controls as a Pomodoro timer. A classroom timer needs readability
          and low friction. A speedcubing timer needs fast start and stop
          behavior. Each page should match the job users came to do.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-base font-semibold text-sky-700">
              Clear controls
            </h3>
            <p className="mt-2 text-slate-700">
              Controls should be obvious, readable, and limited to what affects
              the timer. Extra settings are avoided unless they make the tool
              meaningfully better.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-base font-semibold text-sky-700">
              Readable timing
            </h3>
            <p className="mt-2 text-slate-700">
              Large digits, simple layouts, and fullscreen options make timers
              easier to use across phones, laptops, TVs, classrooms, meeting
              rooms, and workouts.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-base font-semibold text-sky-700">
              Accurate tracking
            </h3>
            <p className="mt-2 text-slate-700">
              Timer pages are designed to track elapsed time using browser
              timing APIs and absolute time where appropriate, reducing drift
              compared with naive ticking loops.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-base font-semibold text-sky-700">
              No unnecessary account flow
            </h3>
            <p className="mt-2 text-slate-700">
              The core use case is immediate timing. The site should not make
              users create an account just to run a countdown, stopwatch, clock,
              or interval timer.
            </p>
          </div>
        </div>

        <p>
          For the main homepage tools, keyboard shortcuts are part of the
          workflow: start, pause, reset, lap, skip, and fullscreen actions can
          be controlled without hunting through the interface.
        </p>
      </SectionCard>

      <SectionCard id="what-this-is-not" title="What this is not">
        <p>
          I Love Timers is not intended to replace specialized, safety-critical,
          professional, or regulated timing equipment. Browser timers are useful
          for everyday planning, work, study, cooking, meetings, workouts, and
          reference, but they still depend on the device, browser, audio
          permissions, battery settings, and operating system behavior.
        </p>

        <ul className="mt-3 space-y-2 pl-5 text-slate-700">
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
      </SectionCard>

      <SectionCard id="author" title="Built and maintained by">
        <div className="grid gap-5 md:grid-cols-12">
          <div className="md:col-span-7">
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

          <div className="md:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-base font-semibold text-sky-700">
                Developer profile
              </h3>
              <p className="mt-2 text-slate-700">
                Full-stack web development with React, TypeScript, Node.js,
                Express, Remix, PostgreSQL, Prisma, Tailwind CSS, responsive UI,
                and production web application work.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={CREATOR_URL}
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
                >
                  Portfolio
                </a>
                <a
                  href={CREATOR_LINKEDIN}
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight text-sky-700">
            Start with a timer
          </h2>
          <p className="mt-2 max-w-3xl leading-relaxed text-slate-700">
            The fastest way to understand the site is to use one of the core
            tools. Start a countdown, run the stopwatch, or open a focus timer
            and adjust the session to match what you are doing.
          </p>

          <div className="mt-4 flex flex-wrap gap-3" data-nosnippet>
            <a
              href="/countdown-timer"
              className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
            >
              Countdown timer
            </a>
            <a
              href="/stopwatch"
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
            >
              Stopwatch
            </a>
            <a
              href="/pomodoro-timer"
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
            >
              Pomodoro timer
            </a>
            <a
              href="/hiit-timer"
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
            >
              HIIT timer
            </a>
          </div>
        </div>
      </section>

      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-7xl px-4 pb-10 text-sm text-slate-600"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <a
              href="/"
              className="cursor-pointer underline underline-offset-2 transition hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
            >
              Home
            </a>
          </li>
          <li>/</li>
          <li className="font-semibold text-slate-900">About</li>
        </ol>
      </nav>
    </main>
  );
}
