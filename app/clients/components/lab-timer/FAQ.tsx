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
  // Lab Timer defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Lab Timer do?",
      answer:
        "It gives you two lab-focused timing tools on one page: (1) a precise stopwatch with laps for reaction timing and repeated trials, and (2) a repeatable step countdown for timed protocol steps. You can go fullscreen for a large display, enable optional sound cues, and use keyboard shortcuts for quick control.",
    },
    {
      question: "How do stopwatch laps work here?",
      answer:
        "Each Lap records two values: the split time since your previous lap, and the total elapsed time at the moment you pressed Lap. Laps are listed newest-first, and the fastest split is labeled as the best lap.",
    },
    {
      question: "What does the Max laps setting do?",
      answer:
        "Max laps caps how many lap entries are stored and shown. This keeps the list manageable during long runs. If you lower Max laps below your current lap count, existing laps remain until you reset, but new laps won’t be added once the cap is reached.",
    },
    {
      question: "What is the repeatable countdown for?",
      answer:
        "It’s for step-based protocols where you repeat the same timed step multiple times (for example: mix, wait, invert, vortex, check, transfer). Set a step duration in seconds, then turn Repeat on to automatically restart at zero.",
    },
    {
      question: "What happens when Repeat step is on?",
      answer:
        "When the countdown reaches zero, it plays the completion cue (if Sound is on) and immediately restarts a fresh countdown using your current step duration.",
    },
    {
      question: "What does Final beeps do?",
      answer:
        "If Sound is enabled and Final beeps is turned on, the countdown plays a short beep once per second during the last 5 seconds before it reaches zero. It’s meant to help you anticipate step transitions without staring at the screen.",
    },
    {
      question: "Does fullscreen change how controls work?",
      answer:
        "Fullscreen applies to the step countdown box only. It shows a top bar with Start/Pause, Reset, and Repeat On/Off. You can also tap/click the timer area to start or pause. Exit fullscreen with Esc.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space toggles the stopwatch start/pause, L records a lap (stopwatch only), C toggles the countdown start/pause, T toggles Repeat for the countdown, F toggles fullscreen for the countdown, and R resets both timers. Shortcuts are ignored while you are typing in an input.",
    },
    {
      question: "Why might I not hear sound cues?",
      answer:
        "Some browsers block audio until you interact with the page. If cues are silent, click/tap a Start button once, then try again. Also verify your device isn’t muted and volume is up.",
    },
    {
      question: "Which related timer should I use instead?",
      answer: (
        <>
          Need a simple single countdown?{" "}
          <Link
            to="/countdown-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Countdown Timer
          </Link>
          . Prefer a dedicated stopwatch page?{" "}
          <Link
            to="/stopwatch"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Stopwatch
          </Link>
          . Want a big, clean display with fewer controls?{" "}
          <Link
            to="/fullscreen-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Fullscreen Timer
          </Link>
          . Running multiple steps in parallel?{" "}
          <Link
            to="/multiple-timers"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Multiple Timers
          </Link>
          . Specifically testing reaction speed?{" "}
          <Link
            to="/reaction-time-test"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Reaction Time Test
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
    <section id={id} className="space-y-4">
      <JsonLd data={faqLd} />

      <h2 className="text-2xl font-semibold text-[var(--ilt-text-primary)]">{title}</h2>

      <div className="mt-4 divide-y divide-[var(--ilt-border-subtle)] ilt-surface-card">
        {faqs.map((f) => (
          <details key={f.question}>
            <summary className="cursor-pointer px-5 py-4 font-medium text-[var(--ilt-text-primary)] hover:bg-[var(--ilt-bg-hover)]">
              {f.question}
            </summary>
            <div className="px-5 pb-4 leading-relaxed text-[var(--ilt-text-secondary)]">
              {f.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
