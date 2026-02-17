// app/clients/components/navigation/RelatedSites.tsx
import { useMemo } from "react";

type Site = {
  href: string;
  title: string;
  blurb: string;
  tags: string[];
};

const SITES: Site[] = [
  {
    href: "https://www.focusclimber.com",
    title: "FocusClimber",
    blurb: "A focused-work game to help you stay on task.",
    tags: ["productivity", "focus", "study"],
  },
  {
    href: "https://www.typingstories.com",
    title: "TypingStories",
    blurb: "Typing practice through short stories and challenges.",
    tags: ["typing", "learning", "study"],
  },
  {
    href: "https://www.morsewords.com",
    title: "MorseWords",
    blurb: "Learn Morse code through interactive word practice.",
    tags: ["learning", "communication", "morse code"],
  },
];

function hostnameOf(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

export default function RelatedSites({
  title = "More sites you may find useful",
}: {
  title?: string;
}) {
  const items = useMemo(
    () =>
      SITES.map((s) => ({
        ...s,
        host: hostnameOf(s.href),
      })),
    [],
  );

  const preview = useMemo(() => items.map((s) => s.title).join(" • "), [items]);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-sky-700">{title}</h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {preview}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          {/* Collapsed view: clean link list (hidden when open) */}
          <div className="mt-4 group-open:hidden">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm transition hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  aria-label={`${s.title} (opens in a new tab)`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900 group-hover/link:text-slate-950">
                      {s.title}
                    </span>
                    <span className="block truncate text-xs font-medium text-slate-500">
                      {s.host}
                    </span>
                  </span>

                  <span className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition group-hover/link:border-slate-300 group-hover/link:bg-slate-50">
                    ↗
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-3 text-sm font-medium text-slate-500">
              Expand for details.
            </div>
          </div>

          {/* Expanded view: full cards (hidden when closed) */}
          <div className="mt-6 hidden group-open:block">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  aria-label={`${s.title} (opens in a new tab)`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base font-extrabold text-slate-900">
                        {s.title}
                      </div>
                      <div className="mt-1 text-sm leading-relaxed text-slate-600">
                        {s.blurb}
                      </div>
                    </div>

                    <div className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition group-hover:border-slate-300 group-hover:bg-slate-50">
                      ↗
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 text-xs font-semibold text-slate-500">
                    {s.host}
                  </div>

                  <div className="mt-4 h-px bg-slate-200/70" />

                  <div className="mt-3 text-sm font-semibold text-amber-700 group-hover:text-amber-800">
                    Visit site →
                  </div>
                </a>
              ))}
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
