// app/routes/morse-code-clock.tsx
import type { Route } from "./+types/morse-code-clock";
import { json } from "@remix-run/node";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router";
import HowItWorks from "~/clients/components/morse-code-clock/HowItWorks";
import Disclaimer from "~/clients/components/morse-code-clock/Disclaimer";
import FAQ from "~/clients/components/morse-code-clock/FAQ";
import KeyboardShortcuts from "~/clients/components/morse-code-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/morse-code-clock/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Morse Code Clock (Live Time Display, Fullscreen)";
  const description =
    "See the current time written in Morse code. A live, easy-to-read Morse clock that updates every minute and works fullscreen for demos or learning.";

  const url = "https://www.ilovetimers.com/morse-code-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "morse code clock",
        "time in morse code",
        "morse time",
        "morse clock",
        "morse code numbers",
        "fullscreen morse clock",
        "learn morse numbers",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },

    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    {
      property: "og:image",
      content: "https://www.ilovetimers.com/og-image.jpg",
    },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },

    { rel: "canonical", href: url },
    { name: "theme-color", content: "#ffffff" },
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

function useIsFullscreen(targetRef: RefObject<HTMLElement | null>) {
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const el = targetRef.current;
      setIsFs(!!el && document.fullscreenElement === el);
    };
    document.addEventListener("fullscreenchange", onChange);
    onChange();
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [targetRef]);

  return isFs;
}

/**
 * Fit a single-line string into its container by adjusting font size.
 * - ResizeObserver + rAF
 * - Binary search for max font-size that fits both width and height
 */
function useFitText({
  containerRef,
  textRef,
  deps,
  minPx = 44,
  maxPx = 420,
  paddingAllowancePx = 0,
}: {
  containerRef: RefObject<HTMLElement | null>;
  textRef: RefObject<HTMLElement | null>;
  deps: any[];
  minPx?: number;
  maxPx?: number;
  paddingAllowancePx?: number;
}) {
  const initialFontPx = (() => {
    const sample = deps.find(
      (dep) => typeof dep === "string" || typeof dep === "number",
    );
    const charCount = Math.max(
      1,
      String(sample ?? "00:00").replace(/\s/g, "").length,
    );
    const preferredVw = Math.min(34, Math.max(8, 84 / (charCount * 0.62)));
    return `clamp(${minPx}px, ${preferredVw.toFixed(2)}vw, ${maxPx}px)`;
  })();

  const [fontPx, setFontPx] = useState<number | string>(initialFontPx);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    let raf: number | null = null;

    const compute = () => {
      const c = containerRef.current;
      const t = textRef.current;
      if (!c || !t) return;

      const rect = c.getBoundingClientRect();
      const availW = Math.max(0, rect.width - paddingAllowancePx);
      const availH = Math.max(0, rect.height - paddingAllowancePx);

      if (availW <= 0 || availH <= 0) return;

      const originalFontSize = (t as HTMLElement).style.fontSize;

      const fits = (px: number) => {
        (t as HTMLElement).style.fontSize = `${px}px`;
        const tr = t.getBoundingClientRect();
        return tr.width <= availW && tr.height <= availH;
      };

      let lo = minPx;
      let hi = maxPx;
      let best = minPx;

      if (fits(maxPx)) {
        best = maxPx;
      } else {
        for (let i = 0; i < 16; i++) {
          const mid = Math.floor((lo + hi) / 2);
          if (fits(mid)) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
      }

      (t as HTMLElement).style.fontSize = originalFontSize;
      setFontPx(`${best}px`);
    };

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = null;
        compute();
      });
    };

    const ro = new ResizeObserver(() => schedule());
    ro.observe(container);

    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    compute();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return fontPx;
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
  return code.split("").map((ch, i) => {
    if (ch === ".") return { k: `${i}`, kind: "dot" as const };
    if (ch === "-") return { k: `${i}`, kind: "dash" as const };
    return { k: `${i}`, kind: "gap" as const };
  });
}

function safeClipboardWriteText(text: string) {
  if (typeof navigator === "undefined") return Promise.reject();
  if (
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  )
    return navigator.clipboard.writeText(text);

  // Fallback for older browsers / non-secure contexts
  return new Promise<void>((resolve, reject) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      ok ? resolve() : reject();
    } catch {
      reject();
    }
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
  cardRef,
  isFullscreen,
}: {
  children: React.ReactNode;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  tabIndex?: number;
  cardRef?: React.Ref<HTMLDivElement>;
  isFullscreen?: boolean;
}) => (
  <div
    ref={cardRef}
    tabIndex={tabIndex ?? 0}
    onKeyDown={onKeyDown}
    className={[
      "relative bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60",
      isFullscreen
        ? "h-screen w-screen rounded-none border-0 p-0 shadow-none"
        : "timer-tool-card h-full rounded-2xl bg-white p-4 sm:p-6",
      className,
    ].join(" ")}
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
        ? `cursor-pointer rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer timer-control-shadow rounded-lg bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

function FullscreenTopBar({
  show,
  title,
  right,
  onExit,
}: {
  show: boolean;
  title: string;
  right?: React.ReactNode;
  onExit: () => void;
}) {
  if (!show) return null;
  return (
    <div className="absolute left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/92 px-2 py-2 backdrop-blur sm:px-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900">
            {title}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {right}
          <Btn kind="ghost" onClick={onExit} className="py-1 text-sm">
            Exit (Esc)
          </Btn>
        </div>
      </div>
    </div>
  );
}

function FullscreenBottomBar({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  if (!show) return null;
  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/92 px-2 py-2 backdrop-blur sm:px-3">
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}

/* =========================================================
   MORSE CODE CLOCK CARD
========================================================= */
function MorseCodeClockCard() {
  const [now, setNow] = useState(() => new Date());
  const [use24h, setUse24h] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [style, setStyle] = useState<"blocks" | "text">("blocks");
  const [copied, setCopied] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

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
    const groups = digits.map((d) => ({ digit: d, morse: digitToMorse(d) }));

    const groupsWithSeparators: Array<{ digit: string; morse: string }> = [];
    for (let i = 0; i < groups.length; i++) {
      groupsWithSeparators.push(groups[i]);
      const isAfterHH = i === 1;
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

    return { timeText, morseText, groupsWithSeparators };
  }, [now, use24h, showSeconds]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [parts.timeText, isFs, use24h, showSeconds],
    minPx: 56,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 72 : 64,
  });

  async function copy() {
    const payload = `Time: ${parts.timeText}\nMorse: ${parts.morseText}`;
    try {
      await safeClipboardWriteText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "t") {
      setUse24h((v) => !v);
    } else if (k === "s") {
      setShowSeconds((v) => !v);
    } else if (k === "v") {
      setStyle((v) => (v === "blocks" ? "text" : "blocks"));
    } else if (k === "c") {
      copy();
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Morse Code Clock"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <label className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900">
              <input
                type="checkbox"
                checked={use24h}
                onChange={(e) => setUse24h(e.target.checked)}
              />
              24-hour (T)
            </label>

            <label className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900">
              <input
                type="checkbox"
                checked={showSeconds}
                onChange={(e) => setShowSeconds(e.target.checked)}
              />
              Seconds (S)
            </label>

            <Btn
              kind="ghost"
              onClick={() =>
                setStyle((v) => (v === "blocks" ? "text" : "blocks"))
              }
              className="py-1 text-sm"
            >
              {style === "blocks" ? "Text (V)" : "Blocks (V)"}
            </Btn>

            <Btn kind="ghost" onClick={copy} className="py-1 text-sm">
              {copied ? "Copied" : "Copy (C)"}
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                Morse Code Clock (Live Time Display)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Live local time shown as Morse code digits.
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={use24h}
                  onChange={(e) => setUse24h(e.target.checked)}
                />
                24-hour
              </label>

              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
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
                onClick={copy}
                className="py-2"
                disabled={copied}
              >
                {copied ? "Copied" : "Copy"}
              </Btn>

              <Btn
                kind="ghost"
                onClick={() =>
                  cardRef.current && toggleFullscreen(cardRef.current)
                }
                className="py-2"
              >
                Fullscreen
              </Btn>
            </div>
          </div>
        )}

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 320,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            Local time
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center font-mono font-extrabold tracking-widest",
              isFs ? "sm:tracking-widest" : "",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {parts.timeText}
          </span>

          {/* Output */}
          <div
            className={[
              "mt-5 w-full max-w-6xl rounded-2xl border border-slate-200 bg-white p-4",
              isFs ? "sm:p-6" : "",
            ].join(" ")}
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-extrabold text-slate-900">
                  Morse output
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Btn
                    kind="ghost"
                    onClick={() =>
                      setStyle((v) => (v === "blocks" ? "text" : "blocks"))
                    }
                    className="py-2"
                  >
                    {style === "blocks" ? "Text view" : "Block view"}
                  </Btn>
                  <Btn kind="ghost" onClick={copy} className="py-2">
                    {copied ? "Copied" : "Copy"}
                  </Btn>
                </div>
              </div>

              {style === "text" ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm font-semibold text-slate-900">
                  {parts.morseText}
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {parts.groupsWithSeparators.map((g, idx) => {
                    if (g.digit === ":") {
                      return (
                        <div
                          key={`sep-${idx}`}
                          className={[
                            "mx-1 font-extrabold text-slate-700",
                            isFs ? "text-4xl sm:text-5xl" : "text-3xl",
                          ].join(" ")}
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
                        className={[
                          "rounded-xl border border-slate-200 bg-white",
                          isFs ? "px-5 py-4 sm:px-6" : "px-4 py-3",
                        ].join(" ")}
                        title={`Digit ${g.digit}: ${g.morse}`}
                      >
                        <div className="text-center text-xs font-extrabold text-slate-600">
                          {g.digit}
                        </div>

                        <div
                          className={[
                            "mt-2 flex items-center justify-center",
                            isFs ? "gap-3" : "gap-2",
                          ].join(" ")}
                        >
                          {blocks.map((b) => {
                            const dot = isFs
                              ? "inline-block h-5 w-5 rounded-full bg-slate-900"
                              : "inline-block h-4 w-4 rounded-full bg-slate-900";

                            const dash = isFs
                              ? "inline-block h-5 w-14 rounded-full bg-slate-900"
                              : "inline-block h-4 w-10 rounded-full bg-slate-900";

                            const gap = isFs
                              ? "inline-block h-5 w-3"
                              : "inline-block h-4 w-2";

                            return (
                              <span
                                key={b.k}
                                className={
                                  b.kind === "dot"
                                    ? dot
                                    : b.kind === "dash"
                                      ? dash
                                      : gap
                                }
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {!isFs && (
          <div className="mt-4 timer-control-shadow rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700">
            Shortcuts: F fullscreen · T 24-hour · S seconds · V view · C copy
          </div>
        )}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              F fullscreen · T 24-hour · S seconds · V view · C copy · Esc exit
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {use24h ? "24-hour" : "12-hour"} ·{" "}
              {showSeconds ? "Seconds on" : "Seconds off"} ·{" "}
              {style === "blocks" ? "Blocks" : "Text"}
            </div>
          </div>
        </FullscreenBottomBar>
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
  const url = "https://www.ilovetimers.com/morse-code-clock";

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
            item: "https://www.ilovetimers.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Morse Code Clock",
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <main className="timer-page-shell bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <MorseCodeClockCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Morse Code Clock</span>
        </p>
      </section>

      <HowItWorks />
      <KeyboardShortcuts />
      <PopularUseCases />
      <FAQ />
      <Disclaimer />
    </main>
  );
}
