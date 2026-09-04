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
`;

export function getAdSenseLoaderScript(expectedPath: string) {
  return `
(function () {
  var currentPath = window.location.pathname;
  while (currentPath.length > 1 && currentPath.endsWith('/')) {
    currentPath = currentPath.slice(0, -1);
  }
  if (currentPath !== ${JSON.stringify(expectedPath)}) return;
  if (document.querySelector('script[data-ilt-adsense-loader]')) return;
  var script = document.createElement('script');
  script.async = true;
  script.src = ${JSON.stringify(ADSENSE_SCRIPT_SRC)};
  script.crossOrigin = 'anonymous';
  script.dataset.iltAdsenseLoader = 'true';
  script.onerror = function () {
    window.__iltAdSenseFailed = true;
    window.dispatchEvent(new Event('ilt:adsense-error'));
  };
  document.head.appendChild(script);
})();
`;
}

function ensureAdSenseLoader() {
  if (
    !import.meta.env.PROD ||
    document.querySelector("script[data-ilt-adsense-loader]")
  ) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = ADSENSE_SCRIPT_SRC;
  script.crossOrigin = "anonymous";
  script.dataset.iltAdsenseLoader = "true";
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
  const [pageStatus, setPageStatus] = useState<AdSensePageStatus>("pending");

  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) {
      setPageStatus("pending");
      return;
    }

    ensureAdSenseLoader();

    const evaluate = () => {
      const nextStatus = readPageStatus(root);
      root.dataset.adsensePageStatus = nextStatus;
      setPageStatus(nextStatus);
    };
    const handleScriptError = () => {
      root.dataset.adsensePageStatus = "empty";
      setPageStatus("empty");
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

function fallbackClass(placement: AdSensePlacement) {
  switch (placement) {
    case "top-banner":
      return "ilt-ad-size-top";
    case "sidebar-left":
    case "sidebar-right":
      return "min-h-[600px] w-full";
    case "seo-section-square":
      return "h-[250px] w-[min(100%,300px)]";
    default:
      return "min-h-[90px] w-full";
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

  const isTopBanner = placement === "top-banner";
  const showFallback = pageStatus === "empty";
  const responsiveFormat =
    placement === "seo-section-square"
      ? "rectangle"
      : placement === "sidebar-left" || placement === "sidebar-right"
        ? "vertical"
        : "horizontal";

  return (
    <aside
      aria-label="Advertisements"
      data-ad-placement={placement}
      data-ad-fallback-visible={showFallback ? "true" : "false"}
      className={`ilt-ad-unit ${className}`.trim()}
    >
      <ins
        ref={unitRef}
        className={`adsbygoogle ${
          isTopBanner ? "ilt-ad-size-top" : "ilt-adsense-responsive"
        }`}
        data-ilt-ad-unit="true"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={AD_SLOTS[placement]}
        data-ad-format={isTopBanner ? undefined : responsiveFormat}
        data-full-width-responsive={isTopBanner ? undefined : "true"}
      />
      <div
        hidden={!showFallback}
        data-ad-placeholder
        className={`ilt-ad-fallback ${fallbackClass(placement)}`}
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
        <AdSenseUnit placement="top-banner" className="mx-auto w-fit max-w-full" />
      </div>

      <div className="mx-auto grid w-full min-w-0 max-w-[124rem] grid-cols-1 2xl:grid-cols-[160px_minmax(0,1fr)_160px] 2xl:gap-6 min-[1900px]:grid-cols-[300px_minmax(0,1fr)_300px] min-[1900px]:gap-8">
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
    <div className="px-[var(--ilt-page-x)] pb-8 pt-4 sm:pb-10 sm:pt-6">
      <AdSenseUnit
        placement="below-header-banner"
        className="mx-auto w-full max-w-[970px]"
      />
    </div>
  );
}

export function SeoSectionAd() {
  return (
    <AdSenseUnit
      placement="seo-section-square"
      className="mx-auto w-full max-w-[300px]"
    />
  );
}

export function AboveFooterAd() {
  return (
    <div className="px-[var(--ilt-page-x)] pb-10 pt-8 sm:pb-12 sm:pt-10">
      <AdSenseUnit
        placement="above-footer-banner"
        className="mx-auto w-full max-w-[970px]"
      />
    </div>
  );
}
