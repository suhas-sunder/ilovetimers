import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (TIME ZONE CONVERTER intent)
   Schema: ItemList (scenarios -> this route)
========================================================= */

type ScenarioLink = { label: string; href: string };

type Scenario = {
  title: string;
  description: string;
  forWho: string;
  notFor: string;
  links: ScenarioLink[];
};

export default function PopularUseCases({
  baseUrl = "https://www.ilovetimers.com",
}: {
  baseUrl?: string;
}) {
  const scenarios: Scenario[] = [
    {
      title: "Meeting scheduling: confirm the exact local time on both sides",
      description:
        "Enter the meeting date and time in the organizer’s time zone, then convert to the attendee’s time zone. Use Swap to verify the reverse direction quickly, and Copy to paste the result into a message or invite.",
      forWho:
        "Remote teams, recruiters, clients, and anyone booking meetings across time zones.",
      notFor:
        "You want a live dashboard of many cities. Use World Clock instead.",
      links: [
        { label: "World Clock", href: "/world-clock" },
        { label: "UTC Clock", href: "/utc-clock" },
        { label: "Current Local Time", href: "/current-local-time" },
      ],
    },
    {
      title: "Deadlines and cutoffs: avoid offset mistakes",
      description:
        "Convert a specific due time (for example 17:00) from one zone to another for the correct date. Copy includes an ISO timestamp so you can keep an unambiguous reference in tickets and docs.",
      forWho:
        "Students, teams with cross-region deliverables, and support/ops workflows.",
      notFor:
        "You need a countdown timer to a fixed moment. Use Event Countdown instead.",
      links: [
        { label: "Event Countdown", href: "/event-countdown" },
        { label: "UTC Clock", href: "/utc-clock" },
        { label: "Epoch Unix Time Clock", href: "/epoch-unix-time-clock" },
      ],
    },
    {
      title: "Travel and events: convert a planned time, not “right now”",
      description:
        "Use this when you already have a date and time (departure, arrival, check-in, showtime). The converter applies the correct time zone rules for that date, including daylight saving changes.",
      forWho:
        "Travelers, event attendees, and anyone coordinating times across locations.",
      notFor:
        "You want sunrise or sunset times for a location. Use Sunrise Sunset Clock instead.",
      links: [
        { label: "Sunrise Sunset Clock", href: "/sunrise-sunset-clock" },
        { label: "World Clock", href: "/world-clock" },
        { label: "UTC Clock", href: "/utc-clock" },
      ],
    },
    {
      title: "Support and ops: capture exact timing for handoffs",
      description:
        "Convert the local time a customer reports into your team’s zone, then Copy to paste a clean record (From, To, input, both outputs, ISO). This helps reduce back-and-forth and prevents ambiguous timestamps.",
      forWho: "Support, SRE, and operations teams coordinating across regions.",
      notFor:
        "You only need the current time in one place. Use Current Local Time instead.",
      links: [
        { label: "Current Local Time", href: "/current-local-time" },
        { label: "UTC Clock", href: "/utc-clock" },
        { label: "World Clock", href: "/world-clock" },
      ],
    },
    {
      title: "UTC as an anchor: convert to or from UTC reliably",
      description:
        "When schedules are written in UTC, set From to UTC and convert to a local zone for the correct date. Or set From to local and convert to UTC for logs and systems that expect UTC timestamps.",
      forWho:
        "Teams that write schedules in UTC or use UTC in tooling and logs.",
      notFor: "You want a live UTC display only. Use UTC Clock instead.",
      links: [
        { label: "UTC Clock", href: "/utc-clock" },
        { label: "Epoch Unix Time Clock", href: "/epoch-unix-time-clock" },
        { label: "World Clock", href: "/world-clock" },
      ],
    },
    {
      title: "Sharing a conversion: send a link that preserves your inputs",
      description:
        "Use Share to copy a URL that includes From/To zones, date, time, and seconds setting. The recipient opens it and sees the same conversion instantly.",
      forWho:
        "Anyone coordinating a specific planned time by link instead of screenshots.",
      notFor:
        "You want a list of multiple cities’ current times in one message. Use World Clock instead.",
      links: [
        { label: "World Clock", href: "/world-clock" },
        { label: "Digital Clock", href: "/digital-clock" },
        { label: "UTC Clock", href: "/utc-clock" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (router-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/time-zone-converter"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use Time Zone Converter",
    itemListElement: schemaList.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: s.primaryUrl,
    })),
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <JsonLd data={itemListLd} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-sky-700">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Convert a specific date and time between two zones, with DST-aware
            results, copy-friendly output, share links, fullscreen mode, and
            keyboard shortcuts.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {scenarios.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="text-base font-semibold text-slate-900">
                {s.title}
              </div>
              <div className="mt-1 text-sm leading-relaxed text-slate-700">
                {s.description}
              </div>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    For
                  </div>
                  <div className="mt-1 text-slate-700">{s.forWho}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Not for
                  </div>
                  <div className="mt-1 text-slate-700">{s.notFor}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {s.links.map((l) => (
                  <Link
                    key={`${s.title}-${l.href}`}
                    to={l.href}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <span className="font-semibold text-slate-900">Tip:</span> If you’re
          scheduling, keep one side anchored to{" "}
          <span className="font-semibold text-slate-900">your local zone</span>{" "}
          (or <span className="font-semibold text-slate-900">UTC</span>) and use{" "}
          <span className="font-semibold text-slate-900">Swap</span> to verify
          the reverse direction. Use{" "}
          <span className="font-semibold text-slate-900">Copy</span> to paste a
          clean record, and{" "}
          <span className="font-semibold text-slate-900">Share</span> to send a
          link that preserves the conversion.
        </div>
      </div>
    </section>
  );
}
