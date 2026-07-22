import type { ReactNode } from "react";
import { Link } from "react-router";

const trustLinkClass =
  "ilt-focus-ring cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-[var(--ilt-border-strong)] underline-offset-4 hover:decoration-[var(--ilt-accent)]";

export type ManualReviewDate = {
  iso: string;
  label: string;
};

export type TechnicalSource = {
  href: string;
  label: string;
};

export function TechnicalMethod({
  heading,
  children,
  sources = [],
}: {
  heading: ReactNode;
  children: ReactNode;
  sources?: TechnicalSource[];
}) {
  return (
    <section className="space-y-3 py-2" data-methodology-note>
      <h2 className="text-xl font-bold tracking-tight text-[var(--ilt-text-primary)] sm:text-2xl">
        {heading}
      </h2>
      <div className="space-y-3 leading-7 text-[var(--ilt-text-secondary)]">
        {children}
        {sources.length ? (
          <p className="text-sm leading-6 text-[var(--ilt-text-muted)]">
            Sources:{" "}
            {sources.map((source, index) => (
              <span key={source.href}>
                {index ? "; " : ""}
                <a
                  className={trustLinkClass}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.label}
                </a>
              </span>
            ))}
            .
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function MaintainerLine({
  role,
  showMethodologyLink = true,
}: {
  role?: string;
  showMethodologyLink?: boolean;
}) {
  return (
    <p className="text-sm leading-6 text-[var(--ilt-text-muted)]">
      Maintained by{" "}
      <Link to="/author/suhas-sunder" className={trustLinkClass}>
        Suhas Sunder
      </Link>
      {role ? `, ${role}` : ""}.
      {showMethodologyLink ? (
        <>
          {" "}
          <Link to="/how-ilovetimers-is-made" className={trustLinkClass}>
            See how iLoveTimers is made
          </Link>
          .
        </>
      ) : null}
    </p>
  );
}

export function ReviewLine({ reviewDate }: { reviewDate: ManualReviewDate }) {
  return (
    <p className="text-sm leading-6 text-[var(--ilt-text-muted)]">
      Last reviewed <time dateTime={reviewDate.iso}>{reviewDate.label}</time>.
    </p>
  );
}

export function LimitationNote({
  heading = "Accuracy and limitations",
  children,
  showMethodologyLink = false,
}: {
  heading?: ReactNode;
  children: ReactNode;
  showMethodologyLink?: boolean;
}) {
  return (
    <section className="space-y-3 py-2" data-limitation-note>
      <h2 className="text-xl font-bold tracking-tight text-[var(--ilt-text-primary)] sm:text-2xl">
        {heading}
      </h2>
      <div className="space-y-3 leading-7 text-[var(--ilt-text-secondary)]">
        {children}
        {showMethodologyLink ? (
          <p>
            Read more about these boundaries in{" "}
            <Link to="/how-ilovetimers-is-made" className={trustLinkClass}>
              How iLoveTimers Is Made
            </Link>
            .
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function ToolTrustNote({
  children,
  reviewDate,
  heading,
  maintainerRole,
}: {
  children: ReactNode;
  reviewDate: ManualReviewDate;
  heading?: ReactNode;
  maintainerRole?: string;
}) {
  return (
    <div className="space-y-4" data-tool-trust-note>
      <LimitationNote heading={heading}>{children}</LimitationNote>
      <div className="space-y-1">
        <MaintainerLine role={maintainerRole} />
        <ReviewLine reviewDate={reviewDate} />
      </div>
    </div>
  );
}
