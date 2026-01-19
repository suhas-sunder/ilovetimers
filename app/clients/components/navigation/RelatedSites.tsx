// app/clients/components/navigation/RelatedSites.tsx
import React from "react";

type Site = {
  href: string;
  title: string;
  blurb: string;
  tags: string[];
};

const MAX_CARDS = 6;

/**
 * Keep these blurbs tight and “why it’s relevant” friendly.
 * Important: no duplicates by href.
 */
const SITES: Site[] = [
  {
    href: "https://morsewords.com",
    title: "MorseWords",
    blurb: "Morse practice, word challenges, and learning tools.",
    tags: ["morse", "learning", "puzzles", "words"],
  },
  {
    href: "https://alltextconverters.com",
    title: "AllTextConverters",
    blurb: "Quick text converters for formatting and cleanup.",
    tags: ["tools", "text", "productivity"],
  },
  {
    href: "https://iloveworksheets.com",
    title: "iLoveWorksheets",
    blurb: "Printable worksheets for classrooms and practice.",
    tags: ["education", "classroom", "learning"],
  },
  {
    href: "https://ilovewordsearch.com",
    title: "iLoveWordSearch",
    blurb: "Printable word searches for learning and breaks.",
    tags: ["words", "puzzles", "classroom", "learning"],
  },
  {
    href: "https://focusclimber.com",
    title: "FocusClimber",
    blurb: "A focused-work game to help you stay on task.",
    tags: ["productivity", "focus", "study"],
  },
  {
    href: "https://typingstories.com",
    title: "TypingStories",
    blurb: "Typing practice through short stories and challenges.",
    tags: ["typing", "learning", "study"],
  },
  {
    href: "https://dragontyping.com",
    title: "DragonTyping",
    blurb: "Fast-paced typing game for quick skill-building.",
    tags: ["typing", "games", "learning"],
  },
  {
    href: "https://financequizzes.com",
    title: "FinanceQuizzes",
    blurb: "Short quizzes to build money confidence.",
    tags: ["finance", "learning", "quizzes"],
  },
  {
    href: "https://funmoneygames.com",
    title: "FunMoneyGames",
    blurb: "Finance concepts turned into mini games.",
    tags: ["finance", "games", "learning"],
  },
  {
    href: "https://financemapped.com",
    title: "FinanceMapped",
    blurb: "Visual guides and maps for finance topics.",
    tags: ["finance", "learning", "tools"],
  },
  {
    href: "https://ilovecalm.com",
    title: "iLoveCalm",
    blurb: "Breathing and calm tools for quiet focus.",
    tags: ["calm", "meditation", "focus", "study"],
  },
  {
    href: "https://ilovesvg.com",
    title: "iLoveSVG",
    blurb: "SVG tools for working faster with vectors.",
    tags: ["tools", "design"],
  },
  {
    href: "https://wordmythology.com",
    title: "WordMythology",
    blurb: "Myth-themed word fun and learning bites.",
    tags: ["mythology", "words", "learning"],
  },
  {
    href: "https://learngreekmythology.com",
    title: "LearnGreekMythology",
    blurb: "Beginner guides to Greek myths and gods.",
    tags: ["mythology", "learning"],
  },
  {
    href: "https://mythologyschool.com",
    title: "MythologySchool",
    blurb: "Structured mythology lessons and review.",
    tags: ["mythology", "education", "learning"],
  },
  {
    href: "https://ilovesteps.com",
    title: "iLoveSteps",
    blurb: "Step goals and pacing tools for daily habits.",
    tags: ["fitness", "habits"],
  },
  {
    href: "https://allplantcare.com",
    title: "AllPlantCare",
    blurb: "Plant care basics and troubleshooting guides.",
    tags: ["plants", "guides"],
  },
  {
    href: "https://ilovecoloringpage.com",
    title: "iLoveColoringPage",
    blurb: "Printable coloring pages for all ages.",
    tags: ["coloring", "kids"],
  },
  {
    href: "https://coloringpets.com",
    title: "ColoringPets",
    blurb: "Pet-themed coloring pages that print clean.",
    tags: ["coloring", "kids"],
  },
  {
    href: "https://coloringcardgames.com",
    title: "ColoringCardGames",
    blurb: "Coloring + simple card-style activities.",
    tags: ["coloring", "kids", "games"],
  },
  {
    href: "https://sushiclicker.com",
    title: "SushiClicker",
    blurb: "A small idle clicker for quick breaks.",
    tags: ["games", "breaks"],
  },
  {
    href: "https://studyplushies.com",
    title: "StudyPlushies",
    blurb: "Cozy study vibes and learning fun.",
    tags: ["study", "learning"],
  },
];

const TAG_WEIGHTS: Record<string, number> = {
  // clocks/time
  clock: 3,
  time: 3,
  timezone: 3,
  utc: 3,
  world: 2,
  convert: 2,
  converter: 2,
  date: 2,
  calendar: 2,
  math: 1,

  // learning/classroom
  learning: 2,
  classroom: 2,
  education: 2,
  study: 2,
  puzzles: 2,
  words: 2,
  typing: 2,
  morse: 4,

  // productivity
  productivity: 2,
  focus: 2,
  calm: 2,
  meditation: 2,

  // misc
  finance: 1,
  games: 1,
  breaks: 1,
};

const SAFE_FALLBACK_POOL: string[] = [
  // these are “generally safe + relevant” across many utility pages
  "https://alltextconverters.com",
  "https://focusclimber.com",
  "https://iloveworksheets.com",
  "https://ilovewordsearch.com",
  "https://morsewords.com",
  "https://ilovecalm.com",
  "https://typingstories.com",
  "https://dragontyping.com",
  "https://ilovesvg.com",
];

function dedupeByHref(list: Site[]) {
  const seen = new Set<string>();
  const out: Site[] = [];
  for (const s of list) {
    if (seen.has(s.href)) continue;
    seen.add(s.href);
    out.push(s);
  }
  return out;
}

function scoreSite(site: Site, wanted: Set<string>) {
  let score = 0;
  for (const t of site.tags) {
    if (wanted.has(t)) score += TAG_WEIGHTS[t] ?? 1;
  }
  return score;
}

/**
 * Guaranteed selection:
 * - pick relevant by tags
 * - if < MAX_CARDS, fill from SAFE_FALLBACK_POOL
 * - always return MAX_CARDS (unless you have fewer total sites)
 */
function pickSites(contextTags: string[] | undefined) {
  const sites = dedupeByHref(SITES);

  const wanted = new Set(
    (contextTags?.length ? contextTags : ["time", "learning", "productivity"])
      .map((t) => t.toLowerCase().trim())
      .filter(Boolean),
  );

  // score + sort
  const scored = sites
    .map((s) => ({ s, score: scoreSite(s, wanted) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.s);

  // start with scored
  const picked: Site[] = [];
  const used = new Set<string>();

  for (const s of scored) {
    if (picked.length >= MAX_CARDS) break;
    if (used.has(s.href)) continue;
    used.add(s.href);
    picked.push(s);
  }

  // fill from safe pool
  if (picked.length < MAX_CARDS) {
    for (const href of SAFE_FALLBACK_POOL) {
      if (picked.length >= MAX_CARDS) break;
      if (used.has(href)) continue;
      const s = sites.find((x) => x.href === href);
      if (!s) continue;
      used.add(href);
      picked.push(s);
    }
  }

  // final emergency fill (should rarely happen)
  if (picked.length < MAX_CARDS) {
    for (const s of sites) {
      if (picked.length >= MAX_CARDS) break;
      if (used.has(s.href)) continue;
      used.add(s.href);
      picked.push(s);
    }
  }

  return picked.slice(0, Math.min(MAX_CARDS, sites.length));
}

export default function RelatedSites({
  contextTags,
  title = "More sites you may find useful",
  subtitle = "Curated to match this page. All open in a new tab. Enjoy!",
}: {
  contextTags?: string[];
  title?: string;
  subtitle?: string;
}) {
  const sites = React.useMemo(() => pickSites(contextTags), [contextTags]);

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

                <div className="shrink-0 rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs font-semibold text-amber-950 transition group-hover:bg-amber-100">
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
      </div>
    </section>
  );
}
