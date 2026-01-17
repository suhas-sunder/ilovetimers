// app/clients/components/navigation/RelatedSites.tsx
import React from "react";

type Site = {
  href: string;
  title: string;
  blurb: string;
  tags: string[];
};

const SITES: Site[] = [
  {
    href: "https://ilovesteps.com",
    title: "iLoveSteps",
    blurb:
      "Step goals and pacing tools to keep your daily movement consistent.",
    tags: ["fitness", "habits"],
  },
  {
    href: "https://focusclimber.com",
    title: "FocusClimber",
    blurb:
      "A focused-work game to help you lock in, stay steady, and finish tasks.",
    tags: ["productivity", "focus"],
  },
  {
    href: "https://typingstories.com",
    title: "TypingStories",
    blurb:
      "Practice typing by progressing through short stories and challenges.",
    tags: ["typing", "learning"],
  },
  {
    href: "https://dragontyping.com",
    title: "DragonTyping",
    blurb: "A fun typing game with quick rounds and progression.",
    tags: ["typing", "games"],
  },
  {
    href: "https://financequizzes.com",
    title: "FinanceQuizzes",
    blurb: "Quick quizzes to build money skills and financial confidence.",
    tags: ["finance", "learning"],
  },
  {
    href: "https://funmoneygames.com",
    title: "FunMoneyGames",
    blurb: "Finance concepts, but made playful with mini games.",
    tags: ["finance", "games"],
  },
  {
    href: "https://morsewords.com",
    title: "WordMythology",
    blurb:
      "A mythology-based word game with deep dives into gods, heroes, and myths across cultures.",
    tags: ["mythology", "words", "learning"],
  },
  {
    href: "https://iloveworksheets.com",
    title: "iLoveWorksheets",
    blurb:
      "Printable worksheets for practice, warmups, and classroom routines.",
    tags: ["education", "classroom"],
  },
  {
    href: "https://ilovecoloringpage.com",
    title: "iLoveColoringPage",
    blurb: "A growing library of printable coloring pages for all ages.",
    tags: ["coloring", "kids"],
  },
  {
    href: "https://coloringpets.com",
    title: "ColoringPets",
    blurb: "Cute pet-themed coloring pages that are easy and fun to print.",
    tags: ["coloring", "kids"],
  },
  {
    href: "https://ilovewordsearch.com",
    title: "iLoveWordSearch",
    blurb: "Printable word searches for quick breaks and classroom stations.",
    tags: ["word games", "classroom"],
  },
  {
    href: "https://morsewords.com",
    title: "MorseWords",
    blurb: "Learn Morse code with simple practice tools and word challenges.",
    tags: ["learning", "puzzles"],
  },
  {
    href: "https://wordmythology.com",
    title: "WordMythology",
    blurb: "Myth-inspired word fun with themed lists and learning bites.",
    tags: ["mythology", "words"],
  },
  {
    href: "https://learngreekmythology.com",
    title: "LearnGreekMythology",
    blurb: "Beginner-friendly guides to Greek myths, gods, and heroes.",
    tags: ["mythology", "learning"],
  },
  {
    href: "https://mythologyschool.com",
    title: "MythologySchool",
    blurb: "Structured mythology learning with lessons and quick review pages.",
    tags: ["mythology", "education"],
  },
  {
    href: "https://allplantcare.com",
    title: "AllPlantCare",
    blurb: "Plant-care basics, troubleshooting, and quick reference tips.",
    tags: ["plants", "guides"],
  },
  {
    href: "https://ilovesvg.com",
    title: "iLoveSVG",
    blurb: "SVG tools and helpers for working faster with vector graphics.",
    tags: ["tools", "design"],
  },
  {
    href: "https://alltextconverters.com",
    title: "AllTextConverters",
    blurb:
      "Clean text tools for formatting, converting, and transforming text.",
    tags: ["tools", "text"],
  },
];

// Only show sites that match the current page’s likely intent.
// Keep it conservative so you don’t look like a link farm.
function pickRelevantSites(pathname: string): Site[] {
  const p = (pathname || "").toLowerCase();

  // Timer pages: focus, productivity, classroom, study, workouts, etc.
  const tags = new Set<string>();

  if (p.includes("classroom") || p.includes("visual") || p.includes("exam")) {
    tags.add("classroom");
    tags.add("education");
    tags.add("kids");
    tags.add("learning");
  }

  if (
    p.includes("study") ||
    p.includes("pomodoro") ||
    p.includes("productivity")
  ) {
    tags.add("focus");
    tags.add("productivity");
    tags.add("learning");
  }

  if (p.includes("typing")) {
    tags.add("typing");
    tags.add("learning");
  }

  if (
    p.includes("workout") ||
    p.includes("hiit") ||
    p.includes("tabata") ||
    p.includes("rest")
  ) {
    tags.add("fitness");
  }

  if (p.includes("cooking")) {
    // no great cooking site in your list, keep it minimal
  }

  if (p.includes("meditation")) {
    // you have ilovecalm.com, but you didn’t list it as something we should link here
    // (you DID list ilovecalm.com, but we’ll only include it for meditation paths)
    tags.add("calm");
  }

  if (p.includes("meeting") || p.includes("presentation")) {
    tags.add("productivity");
    tags.add("focus");
  }

  if (p.includes("alarm")) {
    // no direct match; keep conservative
  }

  // Add calm site only for meditation-ish pages
  const localSites = [...SITES];
  if (tags.has("calm")) {
    localSites.push({
      href: "https://ilovecalm.com",
      title: "iLoveCalm",
      blurb:
        "Simple calming tools for breathing, quiet focus, and reset moments.",
      tags: ["calm", "meditation"],
    });
  }

  // Score each site by tag overlap
  const scored = localSites
    .map((s) => {
      const overlap = s.tags.reduce((acc, t) => acc + (tags.has(t) ? 1 : 0), 0);
      return { site: s, score: overlap };
    })
    .filter((x) => x.score > 0);

  // Default fallback if no tags match (keep it small + relevant to timers overall)
  const fallback: Site[] = [
    localSites.find((s) => s.href.includes("focusclimber.com"))!,
    localSites.find((s) => s.href.includes("iloveworksheets.com"))!,
    localSites.find((s) => s.href.includes("ilovewordsearch.com"))!,
    localSites.find((s) => s.href.includes("alltextconverters.com"))!,
  ].filter(Boolean);

  const result = scored.sort((a, b) => b.score - a.score).map((x) => x.site);

  // Cap hard to avoid “sitewide outbound links” vibe
  return (result.length ? result : fallback).slice(0, 6);
}

export default function RelatedSites({
  title = "More tools you may find useful",
  subtitle = "A small set of related sites that may be relevant to this page.",
}: {
  title?: string;
  subtitle?: string;
}) {
  // Works in Remix on client side; if you SSR this, it will render after hydration.
  const [pathname, setPathname] = React.useState<string>("");

  React.useEffect(() => {
    setPathname(window.location.pathname || "");
  }, []);

  const sites = React.useMemo(() => pickRelevantSites(pathname), [pathname]);

  // If something goes weird (SSR/hydration), still render a minimal set.
  if (!sites.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-amber-950">{title}</h2>
            <p className="mt-1 max-w-3xl leading-relaxed text-amber-800">
              {subtitle}
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-600">
            Opens in a new tab
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm transition-transform duration-150 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label={`${s.title} (opens in a new tab)`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-extrabold text-amber-950">
                    {s.title}
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-amber-800">
                    {s.blurb}
                  </div>
                </div>

                <div
                  className="shrink-0 rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs font-semibold text-amber-950 transition group-hover:bg-amber-100"
                  title="Opens in a new tab"
                >
                  ↗
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {s.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-amber-200"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-3 text-xs font-semibold text-slate-600">
                {new URL(s.href).hostname}
              </div>
            </a>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This is a small curated set (not every site) to keep outbound links
          relevant and useful.
        </div>
      </div>
    </section>
  );
}
