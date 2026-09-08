import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { resolveAdSensePageStatus } from "~/clients/lib/adSenseStatus.js";

export const ADSENSE_CLIENT = "ca-pub-4810616735714570";
export const ADSENSE_SCRIPT_SRC =
  `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
export const ADSENSE_TOP_BANNER_STYLE = `
.ilt-ad-size-top { display: block; width: 320px; height: 50px; max-width: 100%; }
@media (min-width: 500px) { .ilt-ad-size-top { width: 468px; height: 60px; } }
@media (min-width: 800px) { .ilt-ad-size-top { width: 728px; height: 90px; } }
.ilt-ad-size-banner { display: block; width: 320px; height: 50px; max-width: 100%; }
@media (min-width: 500px) { .ilt-ad-size-banner { width: 468px; height: 60px; } }
@media (min-width: 800px) { .ilt-ad-size-banner { width: 728px; height: 90px; } }
@media (min-width: 1100px) { .ilt-ad-size-banner { width: 970px; height: 90px; } }
.ilt-ad-size-square { display: block; width: 250px; height: 250px; max-width: 100%; }
@media (min-width: 360px) { .ilt-ad-size-square { width: 300px; height: 250px; } }
.ilt-ad-size-sidebar { display: block; width: 160px; height: 600px; max-width: 100%; }
@media (min-width: 1800px) { .ilt-ad-size-sidebar { width: 300px; height: 600px; } }
`;

function ensureAdSenseLoader() {
  if (
    !import.meta.env.PROD ||
    Array.from(document.scripts).some(
      (candidate) => candidate.src === ADSENSE_SCRIPT_SRC,
    )
  ) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = ADSENSE_SCRIPT_SRC;
  script.crossOrigin = "anonymous";
  script.onerror = () => {
    window.__iltAdSenseFailed = true;
    window.dispatchEvent(new Event("ilt:adsense-error"));
  };
  document.head.appendChild(script);
}

export type AdSensePlacement =
  | "top-banner"
  | "sidebar-left"
  | "sidebar-right"
  | "above-footer-banner"
  | "below-header-banner"
  | "seo-section-square";

type AdSensePageStatus = "pending" | "filled" | "empty";

const AD_SLOTS: Record<AdSensePlacement, string> = {
  "top-banner": "9536165504",
  "sidebar-left": "9216706505",
  "sidebar-right": "8773853377",
  "above-footer-banner": "3573392380",
  "seo-section-square": "7903624833",
  "below-header-banner": "5957836976",
};

const AdSenseContext = createContext<{
  enabled: boolean;
  pageStatus: AdSensePageStatus;
}>({ enabled: false, pageStatus: "pending" });

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
    __iltAdSenseFailed?: boolean;
  }
}

function readPageStatus(root: HTMLElement): AdSensePageStatus {
  const units = Array.from(
    root.querySelectorAll<HTMLElement>("ins.adsbygoogle[data-ilt-ad-unit]"),
  );
  return resolveAdSensePageStatus(
    units.map((unit) => unit.dataset.adStatus),
  );
}

export function AdSensePageProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const filledOnceRef = useRef(false);
  const [pageStatus, setPageStatus] = useState<AdSensePageStatus>("pending");

  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) {
      filledOnceRef.current = false;
      setPageStatus("pending");
      return;
    }

    ensureAdSenseLoader();

    const evaluate = () => {
      const nextStatus = readPageStatus(root);
      if (nextStatus === "filled") {
        filledOnceRef.current = true;
      }

      // A filled page must never fall back to placeholders later in its
      // lifetime. AdSense may update unit status attributes while refreshing
      // creatives; treating those transient states as empty makes every slot
      // on the page reflow together.
      const stableStatus = filledOnceRef.current ? "filled" : nextStatus;
      if (root.dataset.adsensePageStatus !== stableStatus) {
        root.dataset.adsensePageStatus = stableStatus;
      }
      setPageStatus((currentStatus) =>
        currentStatus === stableStatus ? currentStatus : stableStatus,
      );
    };
    const handleScriptError = () => {
      if (filledOnceRef.current) return;
      if (root.dataset.adsensePageStatus !== "empty") {
        root.dataset.adsensePageStatus = "empty";
      }
      setPageStatus((currentStatus) =>
        currentStatus === "empty" ? currentStatus : "empty",
      );
    };

    const observer = new MutationObserver(evaluate);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
      childList: true,
      subtree: true,
    });
    window.addEventListener("ilt:adsense-error", handleScriptError);
    if (window.__iltAdSenseFailed) {
      handleScriptError();
    } else {
      evaluate();
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("ilt:adsense-error", handleScriptError);
    };
  }, [enabled]);

  return (
    <AdSenseContext.Provider value={{ enabled, pageStatus }}>
      <div
        ref={rootRef}
        className="contents"
        data-adsense-page-status={enabled ? pageStatus : "disabled"}
      >
        {children}
      </div>
    </AdSenseContext.Provider>
  );
}

function adSizeClass(placement: AdSensePlacement) {
  switch (placement) {
    case "top-banner":
      return "ilt-ad-size-top";
    case "sidebar-left":
    case "sidebar-right":
      return "ilt-ad-size-sidebar";
    case "seo-section-square":
      return "ilt-ad-size-square";
    default:
      return "ilt-ad-size-banner";
  }
}

export function AdSenseUnit({
  placement,
  className = "",
}: {
  placement: AdSensePlacement;
  className?: string;
}) {
  const { enabled, pageStatus } = useContext(AdSenseContext);
  const unitRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const unit = unitRef.current;
    if (!enabled || !unit || unit.dataset.iltAdRequested === "true") return;

    unit.dataset.iltAdRequested = "true";

    if (!import.meta.env.PROD) {
      unit.dataset.adStatus = "unfilled";
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.warn(`AdSense request failed for ${placement}.`, error);
    }
  }, [enabled, placement]);

  if (!enabled) return null;

  const showFallback = pageStatus === "empty";
  const sizeClass = adSizeClass(placement);

  return (
    <aside
      aria-label="Advertisements"
      data-ad-placement={placement}
      data-ad-fallback-visible={showFallback ? "true" : "false"}
      className={`ilt-ad-unit ${sizeClass} ${className}`.trim()}
    >
      <ins
        ref={unitRef}
        className={`adsbygoogle ${sizeClass}`}
        data-ilt-ad-unit="true"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={AD_SLOTS[placement]}
      />
      <div
        hidden={!showFallback}
        data-ad-placeholder
        className={`ilt-ad-fallback ${sizeClass}`}
      >
        <span>Advertisements</span>
      </div>
    </aside>
  );
}

export function ResponsiveSidebarAd({
  placement,
}: {
  placement: "sidebar-left" | "sidebar-right";
}) {
  const [wideEnough, setWideEnough] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1536px)");
    const update = () => setWideEnough(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return wideEnough ? <AdSenseUnit placement={placement} /> : null;
}

export function SitewideAdLayout({ children }: { children: ReactNode }) {
  const { enabled } = useContext(AdSenseContext);

  if (!enabled) return <>{children}</>;

  return (
    <>
      <div className="px-0 pb-6 pt-5 sm:pb-8 sm:pt-6">
        <AdSenseUnit placement="top-banner" className="mx-auto" />
      </div>

      <div className="mx-auto grid w-full min-w-0 max-w-[124rem] grid-cols-1 2xl:grid-cols-[160px_minmax(0,1fr)_160px] 2xl:gap-6 min-[1800px]:grid-cols-[300px_minmax(0,1fr)_300px] min-[1800px]:gap-8">
        <div className="hidden pt-6 2xl:block">
          <ResponsiveSidebarAd placement="sidebar-left" />
        </div>
        <div className="min-w-0">{children}</div>
        <div className="hidden pt-6 2xl:block">
          <ResponsiveSidebarAd placement="sidebar-right" />
        </div>
      </div>
    </>
  );
}

export function BelowHeaderAd() {
  return (
    <div className="px-0 pb-8 pt-4 sm:pb-10 sm:pt-6">
      <AdSenseUnit
        placement="below-header-banner"
        className="mx-auto"
      />
    </div>
  );
}

export function SeoSectionAd() {
  return (
    <AdSenseUnit
      placement="seo-section-square"
      className="mx-auto"
    />
  );
}

export function AboveFooterAd() {
  return (
    <div className="px-0 pb-10 pt-8 sm:pb-12 sm:pt-10">
      <AdSenseUnit
        placement="above-footer-banner"
        className="mx-auto"
      />
    </div>
  );
}
