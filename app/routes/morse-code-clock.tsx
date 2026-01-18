// app/routes/morse-code-clock.tsx
import type { Route } from "./+types/morse-code-clock";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import RelatedSites from "~/clients/components/navigation/RelatedSites";
import TimerMenuLinks from "~/clients/components/navigation/TimerMenuLinks";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Morse Code Clock | Time in Morse (Live, Fullscreen, Readable)";
  const description =
    "Free Morse code clock that shows the current time using dots and dashes. Live updating, big fullscreen display, 12/24-hour toggle, and copy-friendly output. Great for learning Morse and classroom demos.";
  const url = "https://ilovetimers.com/morse-code-clock";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "morse code clock",
        "clock in morse code",
        "morse time",
        "morse code time",
        "morse clock",
        "morse code learning",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: `https://ilovetimers.com/og-image.jpg` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { rel: "canonical", href: url },
    { name: "theme-color", content: "#ffedd5" },
  ];
}

/* =========================================================
   LOADER
========================================================= */
export function loader() {
  return json({ nowISO: new Date().toISOString() });
}

/* =========================================================
   UTILS
========================================================= */
const pad2 = (n: number) => n.toString().padStart(2, "0");

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

async function toggleFullscreen(el: HTMLElement) {
  if (!document.fullscreenElement) {
    await el.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
}

const MORSE_DIGIT: Record<string, string> = {
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
};

function digitToMorse(d: string) {
  return MORSE_DIGIT[d] ?? "";
}

function symbolsToBlocks(code: string) {
  // Make dots and dashes feel more "clock-like" visually
  // dot: small pill, dash: long pill
  return code.split("").map((ch, i) => {
    if (ch === ".") return { k: `${i}`, kind: "dot" as const };
    if (ch === "-") return { k: `${i}`, kind: "dash" as const };
    return { k: `${i}`, kind: "gap" as const };
  });
}

/* =========================================================
   UI PRIMITIVES
========================================================= */
const Card = ({
  children,
  className = "",
  onKeyDown,
  tabIndex,
}: {
  children: React.ReactNode;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  tabIndex?: number;
}) => (
  <div
    tabIndex={tabIndex ?? 0}
    onKeyDown={onKeyDown}
    className={`rounded-2xl h-full border border-amber-400 bg-white p-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${className}`}
  >
    {children}
  </div>
);

const Btn = ({
  kind = "solid",
  children,
  onClick,
  className = "",
  disabled,
}: {
  kind?: "solid" | "ghost";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={
      kind === "solid"
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-medium text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

/* =========================================================
   MORSE CODE CLOCK CARD
========================================================= */
function MorseCodeClockCard() {
  const [now, setNow] = useState(() => new Date());
  const [use24h, setUse24h] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [style, setStyle] = useState<"blocks" | "text">("blocks");
  const [copied, setCopied] = useState(false);

  const displayWrapRef = useRef<HTMLDivElement>(null);

  // Tick on the second boundary for a stable clock feel.
  useEffect(() => {
    let t: number | null = null;

    const sync = () => {
      const n = new Date();
      setNow(n);

      const msToNext = 1000 - n.getMilliseconds();
      t = window.setTimeout(sync, msToNext);
    };

    sync();
    return () => {
      if (t) window.clearTimeout(t);
    };
  }, []);

  const parts = useMemo(() => {
    const h24 = now.getHours();
    const h = use24h ? h24 : ((h24 + 11) % 12) + 1;
    const m = now.getMinutes();
    const s = now.getSeconds();

    const hh = pad2(h);
    const mm = pad2(m);
    const ss = pad2(s);

    const timeText = showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;

    const digits = (showSeconds ? `${hh}${mm}${ss}` : `${hh}${mm}`).split("");
    const groups = digits.map((d) => ({
      digit: d,
      morse: digitToMorse(d),
    }));

    const groupsWithSeparators = [];
    for (let i = 0; i < groups.length; i++) {
      groupsWithSeparators.push(groups[i]);
      // Insert separators after HH and MM digits
      const isAfterHH = showSeconds ? i === 1 : i === 1;
      const isAfterMM = showSeconds ? i === 3 : false;
      if (isAfterHH || isAfterMM)
        groupsWithSeparators.push({ digit: ":", morse: "" });
    }

    const morseText = groups
      .map((g, idx) => {
        const sep =
          (showSeconds && (idx === 1 || idx === 3)) ||
          (!showSeconds && idx === 1)
            ? " / "
            : " ";
        return g.morse + (idx < groups.length - 1 ? sep : "");
      })
      .join("")
      .trim();

    return { timeText, morseText, groupsWithSeparators, hh, mm, ss };
  }, [now, use24h, showSeconds]);

  async function copy() {
    try {
      const payload = `Time: ${parts.timeText}\nMorse: ${parts.morseText}`;
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key.toLowerCase() === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    } else if (e.key.toLowerCase() === "t") {
      setUse24h((v) => !v);
    } else if (e.key.toLowerCase() === "s") {
      setShowSeconds((v) => !v);
    } else if (e.key.toLowerCase() === "v") {
      setStyle((v) => (v === "blocks" ? "text" : "blocks"));
    } else if (e.key.toLowerCase() === "c") {
      copy();
    }
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Morse Code Clock
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Live time shown as Morse. Great for learning, demos, and classroom
            fun.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={use24h}
              onChange={(e) => setUse24h(e.target.checked)}
            />
            24-hour
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={showSeconds}
              onChange={(e) => setShowSeconds(e.target.checked)}
            />
            Seconds
          </label>

          <Btn
            kind="ghost"
            onClick={() =>
              setStyle((v) => (v === "blocks" ? "text" : "blocks"))
            }
            className="py-2"
          >
            {style === "blocks" ? "Text view" : "Block view"}
          </Btn>

          <Btn
            kind="ghost"
            onClick={() =>
              displayWrapRef.current && toggleFullscreen(displayWrapRef.current)
            }
            className="py-2"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
        style={{ minHeight: 320 }}
        aria-live="polite"
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-fs-container] [data-shell="fullscreen"]{display:none;}
              [data-fs-container] [data-shell="normal"]{display:flex;}

              [data-fs-container]:fullscreen{
                width:100vw;
                height:100vh;
                border:0;
                border-radius:0;
                background:#0b0b0c;
                color:#ffffff;
              }

              [data-fs-container]:fullscreen [data-shell="normal"]{display:none;}
              [data-fs-container]:fullscreen [data-shell="fullscreen"]{
                display:flex;
                width:100%;
                height:100%;
                align-items:center;
                justify-content:center;
                padding:4vh 4vw;
              }

              [data-fs-container]:fullscreen .fs-inner{
                width:min(1600px, 100%);
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                gap:22px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 800 20px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.9;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(56px, 9vw, 120px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.08em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-row{
                display:flex;
                gap:18px;
                flex-wrap:wrap;
                justify-content:center;
              }

              [data-fs-container]:fullscreen .fs-help{
                font: 700 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.85;
                text-align:center;
              }
            `,
          }}
        />

        {/* Normal shell */}
        <div
          data-shell="normal"
          className="w-full p-6"
          style={{ minHeight: 320 }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-5">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              Local time
            </div>

            <div className="font-mono text-5xl font-extrabold tracking-widest sm:text-6xl md:text-7xl">
              {parts.timeText}
            </div>

            <div className="w-full max-w-4xl rounded-2xl border border-amber-200 bg-white p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-extrabold text-amber-950">
                    Morse output
                  </div>
                  <div className="flex items-center gap-2">
                    <Btn kind="ghost" onClick={copy} className="py-2">
                      {copied ? "Copied" : "Copy"}
                    </Btn>
                  </div>
                </div>

                {style === "text" ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 font-mono text-sm font-semibold text-amber-950">
                    {parts.morseText}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    {parts.groupsWithSeparators.map((g, idx) => {
                      if (g.digit === ":") {
                        return (
                          <div
                            key={`sep-${idx}`}
                            className="mx-1 text-2xl font-extrabold text-amber-900"
                            aria-hidden="true"
                          >
                            :
                          </div>
                        );
                      }
                      const blocks = symbolsToBlocks(g.morse);
                      return (
                        <div
                          key={`${g.digit}-${idx}`}
                          className="rounded-xl border border-amber-200 bg-white px-3 py-2"
                          title={`Digit ${g.digit}: ${g.morse}`}
                        >
                          <div className="text-center text-xs font-extrabold text-slate-600">
                            {g.digit}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            {blocks.map((b) => (
                              <span
                                key={b.k}
                                className={
                                  b.kind === "dot"
                                    ? "inline-block h-3 w-3 rounded-full bg-amber-800"
                                    : b.kind === "dash"
                                      ? "inline-block h-3 w-8 rounded-full bg-amber-800"
                                      : "inline-block h-3 w-2"
                                }
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="text-xs text-slate-600">
                  Shortcuts: F fullscreen · T 24-hour · S seconds · V view · C
                  copy
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Morse Code Clock</div>
            <div className="fs-time">{parts.timeText}</div>

            {style === "text" ? (
              <div className="max-w-5xl rounded-2xl border border-white/15 bg-white/5 p-5 font-mono text-lg font-bold">
                {parts.morseText}
              </div>
            ) : (
              <div className="fs-row">
                {parts.groupsWithSeparators.map((g, idx) => {
                  if (g.digit === ":") {
                    return (
                      <div
                        key={`fs-sep-${idx}`}
                        className="text-5xl font-black opacity-80"
                      >
                        :
                      </div>
                    );
                  }
                  const blocks = symbolsToBlocks(g.morse);
                  return (
                    <div
                      key={`fs-${g.digit}-${idx}`}
                      className="rounded-2xl border border-white/15 bg-white/5 px-5 py-4"
                    >
                      <div className="text-center text-sm font-extrabold opacity-80">
                        {g.digit}
                      </div>
                      <div className="mt-3 flex items-center justify-center gap-3">
                        {blocks.map((b) => (
                          <span
                            key={b.k}
                            className={
                              b.kind === "dot"
                                ? "inline-block h-5 w-5 rounded-full bg-white"
                                : b.kind === "dash"
                                  ? "inline-block h-5 w-12 rounded-full bg-white"
                                  : "inline-block h-5 w-3"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="fs-help">
              F fullscreen · T 24-hour · S seconds · V view · C copy
            </div>
          </div>
        </div>
      </div>

      {/* Learning hints */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-amber-950">How to read it</h3>
          <p className="mt-2 leading-relaxed text-amber-800">
            Each digit (0 to 9) has a fixed Morse pattern. This clock converts
            every digit in the time into dots and dashes.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-amber-950">
            Great for teaching
          </h3>
          <p className="mt-2 leading-relaxed text-amber-800">
            Use fullscreen on a projector or smartboard. Toggle seconds to slow
            it down.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-amber-950">Copy-friendly</h3>
          <p className="mt-2 leading-relaxed text-amber-800">
            Copy includes both the normal time and the Morse output so you can
            paste into notes or worksheets.
          </p>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function MorseCodeClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/morse-code-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Morse Code Clock",
        url,
        description:
          "Live Morse code clock that displays the current time using dots and dashes. Fullscreen, 12/24-hour toggle, seconds toggle, and copy output.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://ilovetimers.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Morse Code Clock",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a Morse code clock?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A Morse code clock shows the time by converting each digit into Morse code dots and dashes. For example, each digit 0 to 9 has a fixed Morse pattern.",
            },
          },
          {
            "@type": "Question",
            name: "Does this Morse clock update live?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. It updates every second based on your device’s local time.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use fullscreen for a classroom?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Fullscreen is designed for big readable shapes and text on projectors and smartboards.",
            },
          },
          {
            "@type": "Question",
            name: "Can I hide seconds or use 12-hour time?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. You can toggle seconds on or off and switch between 12-hour and 24-hour time.",
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="bg-amber-50 text-amber-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sticky Header */}
      <header className="sticky top-0 z-10 border-b border-amber-400 bg-amber-500/30/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            ⏱ i💛Timers
          </Link>
          <nav className="hidden gap-4 text-sm font-medium sm:flex">
            <Link to="/countdown-timer" className="hover:underline">
              Countdown
            </Link>
            <Link to="/stopwatch" className="hover:underline">
              Stopwatch
            </Link>
            <Link to="/pomodoro-timer" className="hover:underline">
              Pomodoro
            </Link>
            <Link to="/hiit-timer" className="hover:underline">
              HIIT
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-amber-400 bg-amber-500/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm font-medium text-amber-800">
            <Link to="/" className="hover:underline">
              Home
            </Link>{" "}
            / <span className="text-amber-950">Morse Code Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Morse Code Clock (Time in Morse)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A live <strong>Morse code clock</strong> that shows the current time
            using dots and dashes. Toggle 12/24-hour time, hide seconds, and use
            fullscreen for teaching.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <MorseCodeClockCard />
      </section>

      {/* Menu Links */}
      <TimerMenuLinks />
      <RelatedSites />

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free Morse code clock: see the time as dots and dashes
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>Morse code clock</strong> displays the current time
              by converting each digit into Morse code. Every digit from 0 to 9
              has a fixed pattern of dots and dashes, so you can learn the
              number patterns by watching the clock.
            </p>
            <p>
              Use <strong>block view</strong> for a visual representation (easy
              to read at a distance) or
              <strong>text view</strong> for copy-and-paste Morse. Fullscreen is
              designed for classrooms, projectors, and smartboards.
            </p>
            <p>
              Want a timer instead of a clock? Try{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>{" "}
              or a classroom-friendly visual timer on{" "}
              <Link
                to="/visual-timer"
                className="font-semibold hover:underline"
              >
                Visual Timer
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Morse Code Clock FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do you write numbers in Morse code?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Numbers use five symbols. For example: 1 is <strong>.----</strong>
              , 5 is <strong>.....</strong>, and 0 is <strong>-----</strong>.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this clock accurate?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              It uses your device’s clock. If your device time is correct, the
              Morse clock will match it.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I use it on a projector?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Fullscreen is built for big shapes and clear contrast.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>F</strong> fullscreen · <strong>T</strong> 24-hour ·{" "}
              <strong>S</strong> seconds · <strong>V</strong> view ·{" "}
              <strong>C</strong> copy (when focused).
            </div>
          </details>
        </div>
      </section>

      <footer className="border-t border-amber-400 bg-amber-500/30/60">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-amber-800">
          © 2026 i💛Timers - free countdown, stopwatch, Pomodoro, and HIIT
          interval timers
        </div>
      </footer>
    </main>
  );
}
