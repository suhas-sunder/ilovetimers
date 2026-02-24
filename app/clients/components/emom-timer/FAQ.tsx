import { JsonLd } from "./HowItWorks";

/* =========================================================
   FAQ (SEO + UX)
   Schema: FAQPage (tool page)
========================================================= */
export type FaqItem = {
  question: string;
  answer: string;
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
  // EMOM Timer defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this EMOM Timer do?",
      answer:
        "It runs an EMOM (Every Minute On the Minute) workout timer where each round starts on the minute. You set total rounds (minutes), optionally add a prep countdown, enable/disable sound cues, optionally enable final beeps in the last seconds, and use fullscreen for a big, gym-readable display.",
    },
    {
      question: "How do I start, pause, and resume?",
      answer:
        "Press Start to begin. Press Pause to stop and hold your place. Press Resume to continue. You can also press Space to start/pause. In fullscreen, you can tap/click the time display to start, pause, or resume.",
    },
    {
      question: "What are “rounds” on this page?",
      answer:
        "Rounds are minutes. If you set 12 rounds, the timer runs for 12 minutes total. Each minute is one EMOM round and the display shows the countdown to the next minute mark.",
    },
    {
      question: "What does the prep countdown do?",
      answer:
        "Prep adds an optional 0–60 second lead-in before the EMOM begins, so you can set up or get into position. When prep ends, the timer automatically transitions into the first EMOM minute.",
    },
    {
      question: "Can I change rounds or prep while it’s running?",
      answer:
        "No. Rounds and prep are locked while the timer is active to prevent accidental changes. Pause or Reset first, then adjust settings and Start again.",
    },
    {
      question: "What does Reset do?",
      answer:
        "Reset stops the timer and returns it to a ready state while keeping your current rounds and prep settings, so you can re-run the same setup quickly.",
    },
    {
      question: "How do sound cues and final beeps work?",
      answer:
        "Sound cues play a short beep at the start of each new minute (round). Final beeps optionally add short beeps in the last 5 seconds of each minute (and during the final seconds of prep). If sound doesn’t play, interact with the page first (click/tap/press a key) since some browsers block audio until a user gesture.",
    },
    {
      question: "How do I use fullscreen mode?",
      answer:
        "Click Fullscreen (or press F). Press Esc to exit. Fullscreen gives you a larger, cleaner display, and tapping/clicking the timer display toggles start/pause/resume.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space starts/pauses · R resets · F toggles fullscreen · S toggles sound · B toggles final beeps (when sound is on) · Esc exits fullscreen. If shortcuts don’t work, click/tap the card once so it has focus.",
    },
    {
      question:
        "Will the timer keep perfect time if I switch tabs or lock my device?",
      answer:
        "It runs in your browser while the page is open. Background tabs and locked devices may throttle updates, so the display can look less smooth and may drift slightly depending on your browser and power-saving settings.",
    },
    {
      question: "Does this run when the page is closed or send notifications?",
      answer:
        "No. This tool doesn’t use system notifications and won’t keep running after you close the tab or browser.",
    },
    {
      question: "Which related timers should I use instead?",
      answer:
        "Use AMRAP Timer for AMRAP workouts, HIIT Timer for work/rest intervals, Tabata Timer for 20s/10s blocks, Round Timer for generic round structures, Workout Timer for broader workout timing, or Countdown Timer for a simple one-off countdown.",
    },
  ];

  const faqs = items?.length ? items : defaults;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
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
