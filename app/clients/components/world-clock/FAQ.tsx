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
  // World Clock defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What is the World Clock?",
      answer:
        "World Clock shows the current time in multiple cities at once, updated live. You can add or remove cities, search by city name or time zone, toggle 12/24-hour time and seconds, copy your selected list, and use fullscreen for a clean display.",
    },
    {
      question: "Which cities are available on this page?",
      answer:
        "This page includes a Popular list of commonly used cities and time zones (for example Toronto, New York, Los Angeles, London, Tokyo, and more). Use Search to filter the list by city name or region.",
    },
    {
      question: "How do I add or remove a city?",
      answer: (
        <>
          Click a city chip in{" "}
          <strong className="text-slate-900">Popular</strong> to toggle it on or
          off. You can also remove a city from its card using{" "}
          <strong className="text-slate-900">Remove</strong>.
        </>
      ),
    },
    {
      question: "How does Search work?",
      answer:
        "Search filters the Popular list as you type. You can search by city name (for example “London”), by time zone text (for example “America”), or by region (for example “Europe”).",
    },
    {
      question: "How do I switch between 24-hour and 12-hour time?",
      answer: (
        <>
          Toggle <strong className="text-slate-900">24-hour</strong> in the
          controls. You can also press{" "}
          <strong className="text-slate-900">T</strong> after clicking the world
          clock card once.
        </>
      ),
    },
    {
      question: "How do I show or hide seconds?",
      answer: (
        <>
          Toggle <strong className="text-slate-900">Seconds</strong> in the
          controls. You can also press{" "}
          <strong className="text-slate-900">S</strong> after clicking the world
          clock card once.
        </>
      ),
    },
    {
      question: "What does Copy do?",
      answer:
        "Copy copies a plain text list of your selected cities and their current times, one line per city, including the time zone. It’s useful for sharing in messages, emails, or meeting notes.",
    },
    {
      question: "What do Reset and Clear do?",
      answer:
        "Reset returns to the default set of cities for this page. Clear removes all selected cities so you can start from an empty list.",
    },
    {
      question: "How do I use fullscreen mode?",
      answer: (
        <>
          Click <strong className="text-slate-900">Fullscreen</strong> (or press{" "}
          <strong className="text-slate-900">F</strong> after clicking the card
          once). Press <strong className="text-slate-900">Esc</strong> to exit
          fullscreen.
        </>
      ),
    },
    {
      question: "What are the keyboard shortcuts?",
      answer: (
        <div className="grid gap-2">
          <div>
            <strong className="text-slate-900">F</strong>: fullscreen ·{" "}
            <strong className="text-slate-900">T</strong>: 24-hour toggle ·{" "}
            <strong className="text-slate-900">S</strong>: seconds toggle ·{" "}
            <strong className="text-slate-900">C</strong>: copy ·{" "}
            <strong className="text-slate-900">R</strong>: reset ·{" "}
            <strong className="text-slate-900">X</strong>: clear
          </div>
          <div className="text-sm text-slate-600">
            Tip: click the world clock card once so it captures keyboard input.
            Shortcuts are ignored while you are typing in the Search input.
          </div>
        </div>
      ),
    },
    {
      question: "Does the World Clock send any data anywhere?",
      answer:
        "No. The world clock runs locally in your browser. This page does not send your selected cities or display settings anywhere.",
    },
    {
      question: "Which related tool should I use instead?",
      answer: (
        <>
          Need to convert a specific time between zones?{" "}
          <Link
            to="/time-zone-converter"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Zone Converter
          </Link>
          . Want a UTC reference clock?{" "}
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
