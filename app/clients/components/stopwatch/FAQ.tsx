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
  // Stopwatch defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What is this stopwatch?",
      answer:
        "This is a fast online stopwatch with millisecond precision and lap tracking. You can start/pause instantly, record lap splits, copy laps as CSV, and use fullscreen for a clean large display.",
    },
    {
      question: "How do I start and pause?",
      answer: (
        <>
          Click <strong className="text-slate-900">Start</strong> /{" "}
          <strong className="text-slate-900">Pause</strong>, or press{" "}
          <strong className="text-slate-900">Space</strong> after clicking the
          stopwatch card once.
        </>
      ),
    },
    {
      question: "How do laps work (split vs total)?",
      answer:
        "Each lap records two times: Total is the elapsed time since you started, and Split is the time since your previous lap. Laps are shown most-recent first.",
    },
    {
      question: "Why is Lap disabled sometimes?",
      answer:
        "Lap is disabled until the stopwatch has started (elapsed time is greater than 0). Start the stopwatch first, then record laps.",
    },
    {
      question: "How do I record a lap quickly?",
      answer: (
        <>
          Click <strong className="text-slate-900">Lap</strong> or press{" "}
          <strong className="text-slate-900">L</strong>. This records a split
          time (since your last lap) and the current total time.
        </>
      ),
    },
    {
      question: "What does Copy laps do?",
      answer:
        "Copy laps copies a CSV you can paste into Sheets, Excel, or notes. The CSV includes a header and one row per lap: Lap number, Split Time, and Total Time.",
    },
    {
      question: "What format are the times in?",
      answer:
        "Times include milliseconds. For shorter sessions the format is m:ss.mmm (for example 2:05.123). For longer sessions it becomes h:mm:ss.mmm (for example 1:02:05.123).",
    },
    {
      question: "How do I reset everything?",
      answer: (
        <>
          Click <strong className="text-slate-900">Reset</strong> or press{" "}
          <strong className="text-slate-900">R</strong>. This clears elapsed
          time and removes all laps.
        </>
      ),
    },
    {
      question: "How do I use fullscreen mode?",
      answer: (
        <>
          Click <strong className="text-slate-900">Fullscreen</strong> (or press{" "}
          <strong className="text-slate-900">F</strong> after clicking the card
          once). Press <strong className="text-slate-900">Esc</strong> to exit.
          In fullscreen, you can also tap/click the time display to start or
          pause.
        </>
      ),
    },
    {
      question: "What are the keyboard shortcuts?",
      answer: (
        <div className="grid gap-2">
          <div>
            <strong className="text-slate-900">Space</strong>: start/pause ·{" "}
            <strong className="text-slate-900">L</strong>: lap ·{" "}
            <strong className="text-slate-900">C</strong>: copy laps ·{" "}
            <strong className="text-slate-900">R</strong>: reset ·{" "}
            <strong className="text-slate-900">F</strong>: fullscreen ·{" "}
            <strong className="text-slate-900">Esc</strong>: exit fullscreen
          </div>
          <div className="text-sm text-slate-600">
            Tip: click the stopwatch card once so it captures keyboard input.
            Shortcuts are ignored while you’re typing in an input.
          </div>
        </div>
      ),
    },
    {
      question: "Does this stopwatch send any data anywhere?",
      answer:
        "No. The stopwatch runs locally in your browser. This page does not send your lap data or timing state anywhere.",
    },
    {
      question: "Which related tool should I use instead?",
      answer: (
        <>
          Need a countdown instead of count-up?{" "}
          <Link
            to="/countdown-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Countdown Timer
          </Link>
          . Want structured intervals?{" "}
          <Link
            to="/hiit-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            HIIT Timer
          </Link>{" "}
          or{" "}
          <Link
            to="/tabata-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Tabata Timer
          </Link>
          . Timing speed solves?{" "}
          <Link
            to="/speedcubing-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Speedcubing Timer
          </Link>
          . Need multiple stations at once?{" "}
          <Link
            to="/multiple-timers"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Multiple Timers
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
