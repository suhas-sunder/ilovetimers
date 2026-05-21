type Site = {
  href: string;
  title: string;
  blurb: string;
};

const SITES: Site[] = [
  {
    href: "https://www.ilovesvg.com",
    title: "iLoveSVG",
    blurb:
      "Simple SVG tools for converting, editing, optimizing, inspecting, and preparing SVG files.",
  },
  {
    href: "https://www.morsewords.com",
    title: "MorseWords",
    blurb:
      "Translate, listen to, and practice Morse code with fast, practical learning tools.",
  },
  {
    href: "https://www.ilovecoloringpage.com",
    title: "I Love Coloring Page",
    blurb:
      "Free printable coloring pages for kids, adults, classrooms, holidays, and creative projects.",
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
  title = "More useful sites",
}: {
  title?: string;
}) {
  return (
    <section className="bg-[var(--ilt-bg-content)] px-[var(--ilt-page-x)] py-10">
      <div className="mx-auto max-w-[112rem]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--ilt-text-primary)]">
              {title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--ilt-text-secondary)]">
              Related practical tools from the same network.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {SITES.map((site) => (
            <a
              key={site.href}
              href={site.href}
              target="_blank"
              rel="noopener noreferrer"
              className="ilt-focus-ring group block cursor-pointer rounded-[var(--ilt-radius-control)] bg-[var(--ilt-bg-panel)] p-4 transition hover:bg-[var(--ilt-bg-hover)]"
              aria-label={`${site.title} opens in a new tab`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-[var(--ilt-text-primary)]">
                    {site.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--ilt-text-secondary)]">
                    {site.blurb}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="text-sm font-bold text-[var(--ilt-text-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--ilt-text-primary)]"
                >
                  &gt;
                </span>
              </div>
              <div className="mt-3 text-xs font-semibold text-[var(--ilt-text-muted)]">
                {hostnameOf(site.href)}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
