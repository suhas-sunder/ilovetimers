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
  // Pomodoro Timer defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What is the Pomodoro Timer?",
      answer:
        "Pomodoro Timer is a focus timer that alternates work sessions and breaks for a set number of cycles. This page lets you customize work time, break time, cycles, optional long break after the last cycle, plus sound alerts, auto-advance, fullscreen, and keyboard shortcuts.",
    },
    {
      question: "What are the default Pomodoro settings here?",
      answer:
        "By default, it starts as a 25-minute work session and a 5-minute short break, repeating for 4 cycles, with an optional long break setting available.",
    },
    {
      question: "How do I start and pause the timer?",
      answer: (
        <>
          Click <strong className="text-[var(--ilt-text-primary)]">Start</strong> to begin and{" "}
          <strong className="text-[var(--ilt-text-primary)]">Pause</strong> to stop. You can
          also press <strong className="text-[var(--ilt-text-primary)]">Space</strong> after
          clicking the timer card once.
        </>
      ),
    },
    {
      question: "What does Auto do?",
      answer:
        "When Auto is on, the timer advances to the next phase automatically when a phase ends. When Auto is off, the timer stops at 0 and waits for you to press Next.",
    },
    {
      question: "What does Next do?",
      answer:
        "Next skips to the next phase in the routine. For example, it moves from Work to Short break, or from a break back to Work. It is useful if you finish early or want to move on without waiting.",
    },
    {
      question: "What does Reset do?",
      answer:
        "Reset returns you to the start of the routine: Work phase, cycle 1, and the full work duration. It also stops the timer.",
    },
    {
      question: "How do cycles work on this page?",
      answer:
        "Each cycle consists of one Work phase followed by a Short break. The cycle counter advances after each break. After the final Work session, the routine either starts a Long break (if enabled) or ends as Complete.",
    },
    {
      question: "What is the Long break option?",
      answer: (
        <>
          If enabled, a <strong className="text-[var(--ilt-text-primary)]">Long break</strong>{" "}
          starts after your final work session. If you turn long break off, the
          routine ends after the last work session and shows{" "}
          <strong className="text-[var(--ilt-text-primary)]">Complete</strong>.
        </>
      ),
    },
    {
      question: "What are “Final 3-2-1 beeps”?",
      answer:
        "If enabled (and Sound is on), the timer plays short beeps at 3, 2, and 1 seconds remaining to help you catch the end of a phase without staring at the screen.",
    },
    {
      question: "Why don’t I hear sound?",
      answer:
        "Make sure Sound is enabled, your device volume is up, and the tab is not muted. Some browsers require a user interaction before audio can play, so press Start once with Sound on.",
    },
    {
      question: "How do I use fullscreen mode?",
      answer: (
        <>
          Click <strong className="text-[var(--ilt-text-primary)]">Fullscreen</strong> (or press{" "}
          <strong className="text-[var(--ilt-text-primary)]">F</strong> after clicking the timer
          card once). Press <strong className="text-[var(--ilt-text-primary)]">Esc</strong> to
          exit fullscreen. In fullscreen, you can{" "}
          <strong className="text-[var(--ilt-text-primary)]">tap/click the time</strong> to
          start or pause.
        </>
      ),
    },
    {
      question: "What are the keyboard shortcuts?",
      answer: (
        <div className="grid gap-2">
          <div>
            <strong className="text-[var(--ilt-text-primary)]">Space</strong>: start/pause ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">N</strong>: next ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">R</strong>: reset ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">F</strong>: fullscreen
          </div>
          <div className="text-sm text-[var(--ilt-text-muted)]">
            Tip: click the timer card once so it captures keyboard input.
            Shortcuts are ignored while you are typing in an input.
          </div>
        </div>
      ),
    },
    {
      question: "What happens if I switch tabs?",
      answer:
        "The timer uses a target end time and recalculates remaining time from the device clock. Background tabs, sleeping devices, and power-saving modes can still affect animation smoothness and audio cues.",
    },
    {
      question: "Does this tool send any data anywhere?",
      answer:
        "No. The timer runs locally in your browser. This page does not send your timer settings or timer state anywhere.",
    },
    {
      question: "Which related timer should I use instead?",
      answer: (
        <>
          Want a study-focused layout?{" "}
          <Link
            to="/study-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Study Timer
          </Link>
          . Prefer a single uninterrupted focus block?{" "}
          <Link
            to="/focus-session-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Focus Session Timer
          </Link>
          . Need a simple countdown with no phases?{" "}
          <Link
            to="/countdown-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Countdown Timer
          </Link>
          . Want structured breaks without cycles?{" "}
          <Link
            to="/break-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Break Timer
          </Link>
          . Want broader work and break modes?{" "}
          <Link
            to="/productivity-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Productivity Timer
          </Link>
          . Planning several blocks in a day?{" "}
          <Link
            to="/time-blocking-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Blocking Clock
          </Link>
          . Want a pure big-screen view?{" "}
          <Link
            to="/online-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Fullscreen Timer
          </Link>
          . Prefer no audio at all?{" "}
          <Link
            to="/silent-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Silent Timer
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
