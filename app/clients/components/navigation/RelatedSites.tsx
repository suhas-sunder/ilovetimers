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
    href: "https://ilovesteps.com",
    title: "iLoveSteps",
    blurb: "Step goals and pacing tools for daily habits.",
    tags: ["fitness", "habits"],
  },
];

export default function RelatedSites({
  title = "More sites you may find useful",
  subtitle = "Curated to complement timers and focus tools. All open in a new tab.",
}: {
  title?: string;
  subtitle?: string;
}) {
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
          {SITES.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block cursor-pointer rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm transition-transform duration-150 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
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
