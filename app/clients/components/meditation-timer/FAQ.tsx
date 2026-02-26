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
  // Meditation Timer defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Meditation Timer do?",
      answer:
        "It runs a calm countdown for meditation, breathing exercises, or yoga. Choose a preset or set a custom time (minutes plus extra seconds), then start or pause. You can go fullscreen for a large display, optionally enable sound, enable final beeps in the last 5 seconds, enable an end chime, and loop the session to restart automatically.",
    },
    {
      question: "How do I set a custom duration?",
      answer:
        "Use Custom minutes to set the main duration, then use + extra seconds to add 0 to 59 seconds. The timer updates immediately and Reset returns you to the full duration you set.",
    },
    {
      question: "What are the breathing presets on this page?",
      answer:
        "They are ready-to-use timed blocks for breathwork. You can pick a Box breathing preset (practice block breathing) or a calm breathing block, then adjust the time if you want.",
    },
    {
      question: "What does Loop do?",
      answer:
        "Loop restarts the countdown automatically when it reaches 0:00, using your current duration. This is useful for repeating short breathing blocks without touching controls each time.",
    },
    {
      question: "What sound options are available?",
      answer:
        "Sound is optional. When Sound is on, you can enable Final beeps to hear soft beeps during the last 5 seconds, and enable End chime to hear a gentle chime when the timer completes. If Sound is off, those sound options are disabled.",
    },
    {
      question: "Why might I not hear sound?",
      answer:
        "Some browsers block audio until you interact with the page. If you do not hear cues, click or tap Start once, then turn Sound on and try again. Also confirm your device is not muted and your volume is up.",
    },
    {
      question: "How does fullscreen work on this timer?",
      answer:
        "Fullscreen gives you a clean, large display with a top bar for Start/Pause and Reset, plus Loop and Sound toggles. In fullscreen, you can tap or click the time display to start or pause. Exit fullscreen with Esc or the Exit button.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space starts or pauses, R resets, F toggles fullscreen, S toggles sound, L toggles loop, and Esc exits fullscreen. Shortcuts are ignored while you are typing in an input.",
    },
    {
      question: "Does Reset change my selected time?",
      answer:
        "No. Reset stops the timer and returns to the full duration you currently have set. Your selected preset and settings like Sound, Loop, Final beeps, and End chime stay as they are.",
    },
    {
      question: "Which related timer should I use instead?",
      answer: (
        <>
          Want guided breathing intervals as a dedicated tool?{" "}
          <Link
            to="/breathing-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Breathing Timer
          </Link>
          . Prefer a timer that stays silent by design?{" "}
          <Link
            to="/silent-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Silent Timer
          </Link>
          . Want a no-frills large display?{" "}
          <Link
            to="/fullscreen-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Fullscreen Timer
          </Link>
          . Need multiple countdowns at once (for routines)?{" "}
          <Link
            to="/multiple-timers"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Multiple Timers
          </Link>
          . Want a focus-style session timer?{" "}
          <Link
            to="/focus-session-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Focus Session Timer
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
