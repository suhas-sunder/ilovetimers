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
  // Golden Hour Clock defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Golden Hour Clock do?",
      answer:
        "It shows golden hour start and end times (morning and evening) for a chosen date and location, plus sunrise and sunset. It also includes a live countdown to the next transition and a fullscreen view for on-site use.",
    },
    {
      question: "How do I set my location?",
      answer:
        "You can either type latitude and longitude directly or press Use GPS to autofill your current coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180.",
    },
    {
      question: "What time zone are the results shown in?",
      answer:
        "Times are shown in your device’s current time zone (local time on your phone/computer). If you are planning for a different time zone, convert the displayed time afterward using a time zone converter.",
    },
    {
      question:
        "What is the difference between the two golden hour definitions?",
      answer:
        "Classic (60 minutes) defines golden hour as the first 60 minutes after sunrise and the last 60 minutes before sunset. Solar-angle (0° to 6°) defines golden hour as when the sun is between the horizon and 6 degrees above it, which can be longer or shorter depending on latitude and season.",
    },
    {
      question: "Why do the solar-angle times sometimes look unusual?",
      answer:
        "At some latitudes and dates, the sun’s angle changes faster or slower than expected, so the 0° to 6° window can be much shorter or longer than 60 minutes. In rare cases where the calculation produces an invalid window, the page falls back to a safe 60-minute estimate and shows a note.",
    },
    {
      question: "How does the live countdown work?",
      answer:
        "The countdown targets the next upcoming event for your selected date and location (golden hour start/end, sunrise, or sunset). When an event passes, it automatically switches to the next one.",
    },
    {
      question: "Does this page support fullscreen and shortcuts?",
      answer:
        "Yes. Press F to toggle fullscreen and Esc to exit fullscreen. Press G to request GPS. If shortcuts do not work, click/tap the clock card once so it has focus.",
    },
    {
      question: "What do Sound and Final beeps do?",
      answer:
        "Sound enables short audio beeps. Final beeps plays quick beeps during the last 5 seconds before a golden hour boundary (start or end). Some browsers require a click/tap before they allow audio.",
    },
    {
      question: "I pressed Use GPS but nothing happened. Why?",
      answer:
        "Location access requires permission. If you denied it, enable location permissions for your browser/site and try again. GPS can also fail on devices with location services disabled, weak signal, or strict privacy settings.",
    },
    {
      question:
        "What if there is no sunrise or sunset for my date and location?",
      answer:
        "Near the poles, some dates have continuous daylight or darkness, which means sunrise/sunset may not occur. If that happens, the page shows a note and golden hour windows may not be available for that date/location.",
    },
    {
      question: "Which related tool should I use instead?",
      answer: (
        <>
          If you only need sunrise and sunset, use{" "}
          <Link
            to="/sunrise-sunset-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Sunrise &amp; Sunset Clock
          </Link>
          . If you are coordinating across time zones, use{" "}
          <Link
            to="/time-zone-converter"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Zone Converter
          </Link>
          . If you need current time context, use{" "}
          <Link
            to="/current-local-time"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Current Local Time
          </Link>{" "}
          or{" "}
          <Link
            to="/world-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            World Clock
          </Link>
          . If you want to time a setup window or a segment, use{" "}
          <Link
            to="/countdown-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Countdown Timer
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

      <div className="mt-4 divide-y divide-[var(--ilt-border-subtle)]">
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
