// app/routes/smooth-second-hand-clock.tsx
import type { Route } from "./+types/smooth-second-hand-clock";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  Button as Btn,
  ContentSection,
  DisplayStage,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  SecondaryActionRow,
  SeoBand,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolFrame as Card,
  ToolHero,
  Toggle,
} from "~/clients/components/ui/foundation";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_PATH = "/smooth-second-hand-clock";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export function meta({}: Route.MetaArgs) {
  const title = "Smooth Second Hand Clock (Online Analog Clock)";
  const description =
    "Use a large online analog clock with a smooth sweeping second hand, ticking mode, second-hand toggle, digital context, copy, and fullscreen support.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "smooth second hand clock",
        "smooth seconds clock",
        "smooth clock",
        "analog clock with second hand",
        "online analog clock full screen",
        "clock face online",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: ROUTE_URL },
    { property: "og:image", content: OG_IMAGE },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: OG_IMAGE },
    { rel: "canonical", href: ROUTE_URL },
  ];
}

export function loader() {
  return json({ nowISO: new Date().toISOString() });
}

function isTypingTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return (
    !!element &&
    (element.tagName === "INPUT" ||
      element.tagName === "TEXTAREA" ||
      element.tagName === "SELECT" ||
      element.isContentEditable)
  );
}

function calcAngles(date: Date, smooth: boolean) {
  const second = date.getSeconds() + (smooth ? date.getMilliseconds() / 1000 : 0);
  const minute = date.getMinutes() + second / 60;
  const hour = (date.getHours() % 12) + minute / 60;
  return {
    hour: hour * 30,
    minute: minute * 6,
    second: second * 6,
  };
}

function formatDigital(date: Date) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .format(date)
      .replace(/\u200e/g, "")
      .trim();
  } catch {
    return date.toLocaleTimeString();
  }
}

function SmoothSecondHandClockTool({ initialNowISO }: { initialNowISO: string }) {
  const [now, setNow] = useState(() => new Date(initialNowISO));
  const [smooth, setSmooth] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [showDigital, setShowDigital] = useState(true);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  useEffect(() => {
    let raf = 0;
    let interval = 0;
    let timeout = 0;

    if (smooth && showSeconds) {
      const tick = () => {
        setNow(new Date());
        raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);
      return () => window.cancelAnimationFrame(raf);
    }

    const update = () => setNow(new Date());
    update();
    timeout = window.setTimeout(() => {
      update();
      interval = window.setInterval(update, 1000);
    }, 1000 - new Date().getMilliseconds());

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [showSeconds, smooth]);

  const angles = useMemo(() => calcAngles(now, smooth && showSeconds), [now, showSeconds, smooth]);
  const digital = useMemo(() => formatDigital(now), [now]);
  const modeLabel = showSeconds ? (smooth ? "Smooth sweep" : "Ticking second hand") : "Second hand hidden";

  async function copyTime() {
    try {
      await navigator.clipboard.writeText(`${digital} - ${modeLabel}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (key === "f") {
      void fullscreen.toggle();
    } else if (key === "s") {
      setSmooth((value) => !value);
    } else if (key === "h") {
      setShowSeconds((value) => !value);
    } else if (key === "c") {
      void copyTime();
    } else if (key === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const marks = Array.from({ length: 60 }, (_, index) => {
    const major = index % 5 === 0;
    const angle = index * 6;
    return (
      <line
        key={index}
        x1="0"
        y1={major ? "-128" : "-134"}
        x2="0"
        y2="-144"
        stroke="currentColor"
        strokeWidth={major ? 3 : 1.5}
        opacity={major ? 0.78 : 0.32}
        transform={`rotate(${angle})`}
      />
    );
  });

  return (
    <Card
      cardRef={cardRef}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
      className={isFs ? "" : "px-4 pb-4 pt-0 sm:px-6 sm:pb-6"}
    >
      <FullscreenTopBar
        show={isFs}
        title="Smooth Second Hand Clock"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="ghost" size="sm" onClick={() => setSmooth((value) => !value)} disabled={!showSeconds}>
              {smooth ? "Tick" : "Smooth"}
            </Btn>
            <Btn kind="ghost" size="sm" onClick={() => setShowSeconds((value) => !value)}>
              {showSeconds ? "Hide seconds" : "Show seconds"}
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-specialty-clock-stack flex h-full flex-col"}>
        <DisplayStage
          isFullscreen={isFs}
          className="timer-display-surface mt-4 flex flex-col items-center justify-center p-4 sm:p-6"
          style={{
            minHeight: isFs ? 0 : 440,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            overflow: "hidden",
          }}
          aria-live="off"
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
            {modeLabel}
          </div>
          <div className="mt-4 aspect-square w-[min(82vw,28rem)] max-w-full text-[var(--ilt-text-primary)] sm:w-[min(58vw,34rem)]">
            <svg viewBox="-160 -160 320 320" role="img" aria-label="Analog clock with smooth second hand" className="h-full w-full">
              <circle cx="0" cy="0" r="150" fill="var(--ilt-bg-panel)" stroke="currentColor" strokeWidth="2" opacity="0.98" />
              <g>{marks}</g>
              {[12, 3, 6, 9].map((number) => {
                const positions: Record<number, [number, number]> = {
                  12: [0, -106],
                  3: [106, 8],
                  6: [0, 118],
                  9: [-106, 8],
                };
                const [x, y] = positions[number];
                return (
                  <text
                    key={number}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fontSize="24"
                    fontWeight="800"
                    fill="currentColor"
                  >
                    {number}
                  </text>
                );
              })}
              <line
                x1="0"
                y1="16"
                x2="0"
                y2="-70"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                transform={`rotate(${angles.hour})`}
              />
              <line
                x1="0"
                y1="20"
                x2="0"
                y2="-104"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.86"
                transform={`rotate(${angles.minute})`}
              />
              {showSeconds ? (
                <line
                  x1="0"
                  y1="26"
                  x2="0"
                  y2="-122"
                  stroke="var(--ilt-accent)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  transform={`rotate(${angles.second})`}
                />
              ) : null}
              <circle cx="0" cy="0" r="8" fill="var(--ilt-accent)" />
            </svg>
          </div>
          {showDigital ? (
            <div className="mt-4 text-center font-mono text-2xl font-extrabold tracking-widest text-[var(--ilt-text-primary)] sm:text-3xl">
              {digital}
            </div>
          ) : null}
          <div className="mt-2 text-sm font-semibold text-[var(--ilt-text-secondary)] sm:text-base">
            Browser/device time
          </div>
        </DisplayStage>

        {!isFs ? (
          <>
            <SettingGroup
              title="Clock settings"
              description="Smooth sweep is enabled by default. Switch to ticking mode when you want one-second steps."
            >
              <SettingRow className="sm:grid-cols-3">
                <Toggle
                  label="Smooth second hand"
                  checked={smooth}
                  disabled={!showSeconds}
                  onCheckedChange={setSmooth}
                />
                <Toggle
                  label="Show second hand"
                  checked={showSeconds}
                  onCheckedChange={setShowSeconds}
                />
                <Toggle
                  label="Digital readout"
                  checked={showDigital}
                  onCheckedChange={setShowDigital}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void copyTime()}>
                {copied ? "Copied" : "Copy current time"}
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: F fullscreen / S smooth-tick / H seconds hand / C copy
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Toggle label="Smooth" checked={smooth} disabled={!showSeconds} onCheckedChange={setSmooth} />
              <Toggle label="Seconds" checked={showSeconds} onCheckedChange={setShowSeconds} />
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              No ads appear in fullscreen
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

export default function SmoothSecondHandClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Smooth Second Hand Clock",
        url: ROUTE_URL,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Any",
        description:
          "A browser-based analog clock with a smooth sweeping second hand, ticking mode, second-hand visibility, copy, and fullscreen support.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Smooth Second Hand Clock", item: ROUTE_URL },
        ],
      },
    ],
  };

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ToolHero
        display={<SmoothSecondHandClockTool initialNowISO={nowISO} />}
        title="Smooth Second Hand Clock"
        description="Use an online analog clock that defaults to a smooth sweeping second hand, with ticking mode, second-hand visibility, copy, and fullscreen support."
      />

      <SeoBand>
        <ContentSection title="How this smooth second hand clock works">
          <p>
            This analog clock emphasizes a smooth sweeping second hand. When
            smooth mode is on, the second hand updates continuously instead of
            jumping once per second.
          </p>
          <p>
            Ticking mode is available when you want the hand to move in
            one-second steps. Both modes use your browser and device time.
          </p>
        </ContentSection>

        <ContentSection title="When to use it">
          <p>
            Use it as a fullscreen analog clock, classroom time display,
            second-screen clock, visual clock face, analog time practice page,
            or simple room clock with a visible second hand.
          </p>
          <p>
            For a more general analog display, use the{" "}
            <a className="ilt-content-link" href="/analog-clock">
              analog clock
            </a>
            . For large digital time, use the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              digital clock
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Smooth vs ticking second hand">
          <p>
            A smooth second hand is useful when the motion of time matters
            visually, such as teaching, display rooms, or second-monitor use. A
            ticking second hand is easier when you want discrete one-second
            steps.
          </p>
          <p>
            This page is a browser visual display, not a mechanical clock or a
            calibrated timekeeping instrument. For current time in text form, use{" "}
            <a className="ilt-content-link" href="/current-local-time">
              current local time
            </a>
            . For milliseconds, use the{" "}
            <a className="ilt-content-link" href="/clock-with-milliseconds">
              clock with milliseconds
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Smooth second hand clock FAQ">
          <h3>Can I use it fullscreen?</h3>
          <p>
            Yes. Fullscreen mode keeps the analog face large and does not place
            ad placeholders inside the fullscreen target.
          </p>
          <h3>Can I hide the second hand?</h3>
          <p>
            Yes. Use the Show second hand toggle to hide or show it.
          </p>
          <h3>Is the smooth hand an authority for timekeeping?</h3>
          <p>
            No. It is a browser clock display based on your device time.
          </p>
          <h3>Can I use it for a projected timer?</h3>
          <p>
            If you need a countdown instead of the current time, use the{" "}
            <a className="ilt-content-link" href="/fullscreen-timer">
              fullscreen timer
            </a>
            .
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}
