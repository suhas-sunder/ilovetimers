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
    href: "https://www.ilovesvg.com",
    title: "iLoveSVG",
    blurb:
      "Simple SVG tools for converting, editing, optimizing, inspecting, and preparing SVG files.",
    tags: ["svg", "design", "converters"],
  },
  {
    href: "https://www.morsewords.com",
    title: "MorseWords",
    blurb:
      "Translate, listen to, and practice Morse code with fast, practical learning tools.",
    tags: ["morse code", "learning", "audio"],
  },
  {
    href: "https://www.ilovecoloringpage.com",
    title: "I Love Coloring Page",
    blurb:
      "Free printable coloring pages for kids, adults, classrooms, holidays, and creative projects.",
    tags: ["coloring pages", "printables", "classroom"],
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

  return (
    <section className="mx-auto mt-6 max-w-7xl px-4 pb-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-sky-700">{title}</h2>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Related tools and creative sites from the same network.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:border-slate-300 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              aria-label={`${s.title} opens in a new tab`}
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

              <div className="mt-3 text-sm font-semibold text-amber-700 transition group-hover:text-amber-800">
                Visit site →
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
