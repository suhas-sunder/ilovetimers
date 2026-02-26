import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   FAQ (SEO + UX)
   Schema: FAQPage (tool page)
========================================================= */
export type FaqItem = {
  question: string;
  answer: string | React.ReactNode;
};

export default function FAQ({
  items,
  id = "faq",
  title = "Frequently Asked Questions",
}: {
  items?: FaqItem[];
  id?: string;
  title?: string;
}) {
  // Time Zone Converter defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does the Time Zone Converter do?",
      answer:
        "Time Zone Converter converts a specific date and time from one time zone to another instantly. Choose a From zone, a To zone, and a date and time, and you’ll see both local times plus an ISO timestamp you can copy or share.",
    },
    {
      question: "How do I use the Time Zone Converter?",
      answer: (
        <div className="grid gap-2">
          <div>
            1) Set <strong className="text-slate-900">From time zone</strong>{" "}
            and <strong className="text-slate-900">To time zone</strong>.
          </div>
          <div>
            2) Pick the <strong className="text-slate-900">date</strong> and
            enter the <strong className="text-slate-900">time</strong>.
          </div>
          <div>
            3) Read the converted time and use{" "}
            <strong className="text-slate-900">Copy</strong> or{" "}
            <strong className="text-slate-900">Share</strong> if needed.
          </div>
        </div>
      ),
    },
    {
      question: "Which time zones are available?",
      answer:
        "This page includes a curated list of common IANA time zones across North America, South America, Europe, Africa, Asia, Oceania, plus UTC. Use the From and To dropdowns to select the zones you need.",
    },
    {
      question: "What time format should I enter?",
      answer:
        "Enter time as HH:MM (for example 09:30). If Seconds is enabled, you can enter HH:MM:SS (for example 09:30:00).",
    },
    {
      question: "What does the Seconds toggle do?",
      answer: (
        <>
          When <strong className="text-slate-900">Seconds</strong> is on, the
          input and results include seconds. When it’s off, times are shown to
          the minute only.
        </>
      ),
    },
    {
      question: "Is this conversion daylight-saving-time (DST) aware?",
      answer:
        "Yes. The conversion uses the selected time zones’ rules for the chosen date, including daylight saving changes, so you don’t have to manually adjust offsets.",
    },
    {
      question: "What happens around DST changes?",
      answer:
        "Around DST transitions, some local times can be skipped or repeated depending on the zone and date. If you’re converting a time near a DST change, double-check the date and the selected time zone, and consider using Copy to capture the ISO timestamp for an unambiguous reference.",
    },
    {
      question: "What does Swap do?",
      answer: (
        <>
          <strong className="text-slate-900">Swap</strong> exchanges the From
          and To time zones, so you can convert back the other way instantly
          without reselecting.
        </>
      ),
    },
    {
      question: "What does Now do?",
      answer:
        "Now sets the date and time inputs to your current local date and time (and keeps your chosen time zones). It’s a quick way to convert the current moment between zones.",
    },
    {
      question: "What does Copy do?",
      answer:
        "Copy copies a plain-text block including the From zone, To zone, your input date/time, the rendered From time and To time (with abbreviations when available), and the ISO timestamp.",
    },
    {
      question: "What does Share do?",
      answer:
        "Share copies a link that preserves your From zone, To zone, date, time, and seconds setting. Opening the link restores the same conversion setup.",
    },
    {
      question: "What are the keyboard shortcuts?",
      answer: (
        <div className="grid gap-2">
          <div>
            <strong className="text-slate-900">F</strong>: fullscreen ·{" "}
            <strong className="text-slate-900">S</strong>: swap ·{" "}
            <strong className="text-slate-900">N</strong>: now ·{" "}
            <strong className="text-slate-900">C</strong>: copy ·{" "}
            <strong className="text-slate-900">Esc</strong>: exit fullscreen
          </div>
          <div className="text-sm text-slate-600">
            Tip: click the converter card once so it captures keyboard input.
            Shortcuts are ignored while you are typing in inputs.
          </div>
        </div>
      ),
    },
    {
      question: "Does the Time Zone Converter send my input data anywhere?",
      answer:
        "No. The converter runs locally in your browser. This page does not send your selected time zones or input date/time anywhere.",
    },
    {
      question: "Which related tool should I use instead?",
      answer: (
        <>
          Want live times across many cities?{" "}
          <Link
            to="/world-clock"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            World Clock
          </Link>
          . Need a clean UTC reference?{" "}
          <Link
            to="/utc-clock"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            UTC Clock
          </Link>
          . Want a large single clock display?{" "}
          <Link
            to="/digital-clock"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Digital Clock
          </Link>
          . Need your device’s local time only?{" "}
          <Link
            to="/current-local-time"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Current Local Time
          </Link>
          .
        </>
      ),
    },
  ];

  const faqs = items?.length ? items : defaults;

  // JSON-LD must be string-only; strip React nodes if any custom items are passed.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs
      .filter((f) => typeof f.answer === "string")
      .map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer as string },
      })),
  };

  return (
    <section id={id} className="mx-auto max-w-7xl px-4 pb-6">
      <JsonLd data={faqLd} />

      <h2 className="text-2xl font-semibold text-sky-700">{title}</h2>

      <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm">
        {faqs.map((f) => (
          <details key={f.question}>
            <summary className="cursor-pointer px-5 py-4 font-medium text-slate-900 hover:bg-slate-50">
              {f.question}
            </summary>
            <div className="px-5 pb-4 leading-relaxed text-slate-700">
              {f.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
