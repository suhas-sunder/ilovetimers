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
  // Metronome defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this online metronome do?",
      answer:
        "It plays a steady tick at your selected BPM and shows a clear visual pulse. You can change BPM, pick a time signature, choose subdivisions, enable an accented downbeat, switch click sounds, adjust volume, and use fullscreen for a big practice view.",
    },
    {
      question: "How do I start and stop the metronome quickly?",
      answer:
        "Press Start, or use Space or Enter to toggle start/stop. In fullscreen, you can also click or tap the main display to start or stop.",
    },
    {
      question: "How does Tap Tempo work?",
      answer:
        "Tap Tempo sets BPM based on your recent taps. Tap a few times in a steady rhythm and the BPM will update to match. If you pause for about 2 seconds, a new tap sequence starts automatically.",
    },
    {
      question: "What BPM range does it support?",
      answer:
        "You can set BPM from 20 to 400. Use the slider, the number box, the arrow keys (±1), or Shift + arrow keys (±5) for quick adjustments.",
    },
    {
      question: "What do time signature and subdivision change?",
      answer:
        "Time signature sets how many beats are in a bar (for example 4 beats in 4/4). Subdivision controls how many ticks happen inside each beat: quarter (1), eighth (2), triplet (3), or sixteenth (4). The display shows the current beat and subdivision count as you play.",
    },
    {
      question: "What does “Accent beat 1” do?",
      answer:
        "When Accent beat 1 is enabled, the first beat of each bar is emphasized. You’ll hear a stronger tick and see a stronger pulse on the downbeat, which helps when counting measures.",
    },
    {
      question: "What click sounds are available?",
      answer:
        "You can choose Click (bright), Wood (warm), or Beep (tone). If the sounds feel similar on small speakers, try headphones or switch between Beep and Click for the most contrast.",
    },
    {
      question: "Why don’t I hear the metronome?",
      answer:
        "Check your device volume and make sure the browser tab isn’t muted. Some browsers also require a user gesture before audio will play, so press Start once (or tap the display in fullscreen) and try again.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space or Enter starts/stops. T taps tempo. Arrow Up/Down adjusts BPM (Shift for ±5). F toggles fullscreen. C copies your current settings. Esc exits fullscreen. Shortcuts are ignored while typing in inputs or changing selects.",
    },
    {
      question: "What does Copy do?",
      answer:
        "Copy puts your current setup on the clipboard so you can share it or save it: BPM, time signature, subdivision, accent setting, sound type, volume, your time zone, and the page link.",
    },
    {
      question: "Which related tool should I use instead?",
      answer: (
        <>
          Only need to detect BPM from tapping?{" "}
          <Link
            to="/bpm-tapper"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            BPM Tapper
          </Link>
          . Want a practice block countdown?{" "}
          <Link
            to="/countdown-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Countdown Timer
          </Link>
          . Tracking total practice time?{" "}
          <Link
            to="/stopwatch"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Stopwatch
          </Link>
          . Need a big always-on display (not music-focused)?{" "}
          <Link
            to="/online-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Fullscreen Timer
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
