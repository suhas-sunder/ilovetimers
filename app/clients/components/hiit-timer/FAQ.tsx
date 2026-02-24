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
  // HIIT Timer defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this HIIT Timer do?",
      answer:
        "It runs a structured interval session: warm-up → alternating work/rest rounds → cool-down. You can set seconds and rounds, load quick presets (Tabata, Intervals, Boxing), start/pause, skip to the next phase, reset, toggle sound cues, and use fullscreen with keyboard shortcuts.",
    },
    {
      question: "What’s the exact phase order?",
      answer:
        "Warm-up runs once, then the timer alternates Work and Rest for the number of rounds you set, then finishes with Cool-down. If Warm-up or Cool-down is set to 0 seconds, that phase is skipped.",
    },
    {
      question: "How do rounds work here?",
      answer:
        "A round is one Work phase (plus an optional Rest phase after it). The round counter shows your current round during Work and Rest. After the final round completes, the timer moves to Cool-down (or completes if Cool-down is 0).",
    },
    {
      question: "What happens if I set Rest to 0?",
      answer:
        "Rest is skipped. The timer runs Work back-to-back between rounds, then goes to Cool-down after the final round.",
    },
    {
      question: "What does Next do?",
      answer:
        "Next stops the current phase and immediately advances to the next phase in sequence (for example: Warm-up → Work, Work → Rest or the next Work, Rest → next Work, Work (final) → Cool-down).",
    },
    {
      question: "What does Reset do?",
      answer:
        "Reset stops the timer and returns you to the start (Warm-up) with your current settings and preset values still in place.",
    },
    {
      question: "What sound cues are available?",
      answer:
        "When Sound is enabled, you’ll get a short cue at the end of each phase. If you enable Final 3-2-1 beeps, the timer also beeps once per second in the last 3 seconds of Work only.",
    },
    {
      question: "Why might I not hear sound cues?",
      answer:
        "Some browsers block audio until you interact with the page. If cues are silent, click/tap Start once (a user gesture), then keep Sound on and try again. Also make sure your device is not muted and your volume is up.",
    },
    {
      question: "Does fullscreen change how controls work?",
      answer:
        "Fullscreen gives you a clean, large display with a top bar (Start/Pause, Next, Reset). You can also tap/click the timer display to start or pause. Exit fullscreen with Esc.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space starts/pauses, R resets, N advances to the next phase, F toggles fullscreen, and Esc exits fullscreen. Shortcuts are ignored while you are typing in an input.",
    },
    {
      question: "Which related timer should I use instead?",
      answer: (
        <>
          Want Tabata without warm-up/cool-down controls?{" "}
          <Link
            to="/tabata-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Tabata Timer
          </Link>
          . Need EMOM or AMRAP formats?{" "}
          <Link
            to="/emom-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            EMOM Timer
          </Link>{" "}
          or{" "}
          <Link
            to="/amrap-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            AMRAP Timer
          </Link>
          . Prefer a simple round bell timer?{" "}
          <Link
            to="/round-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Round Timer
          </Link>
          . Want a no-frills big display?{" "}
          <Link
            to="/fullscreen-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Fullscreen Timer
          </Link>
          . Need multiple timers at once?{" "}
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
