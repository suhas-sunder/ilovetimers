import { Link, useLocation } from "react-router";
import { RELATED_TOOL_LINKS } from "~/clients/config/relatedTools.js";

type RelatedToolLink = {
  to: string;
  label: string;
};

type RelatedToolGroup = {
  heading: string;
  links: readonly RelatedToolLink[];
};

export default function RelatedTools() {
  const { pathname } = useLocation();
  const normalizedPathname =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const group =
    (RELATED_TOOL_LINKS as Record<string, RelatedToolGroup>)[normalizedPathname];

  if (!group) return null;

  return (
    <section
      aria-labelledby="related-tools-heading"
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <h2
        id="related-tools-heading"
        className="text-lg font-semibold text-[var(--ilt-text-primary)]"
      >
        {group.heading}
      </h2>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
        {group.links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="ilt-focus-ring cursor-pointer text-sm font-medium text-[var(--ilt-text-primary)] underline decoration-[var(--ilt-border-strong)] underline-offset-4 hover:decoration-[var(--ilt-accent)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
