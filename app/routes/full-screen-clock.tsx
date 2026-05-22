import type { Route } from "./+types/full-screen-clock";
import { json } from "@remix-run/node";
import { FullScreenClockPage } from "~/clients/components/clock-discovery/ClockDiscoveryPages";

const ROUTE_URL = "https://www.ilovetimers.com/full-screen-clock";
const OG_IMAGE = "https://www.ilovetimers.com/og-image.png";

export function meta({}: Route.MetaArgs) {
  const title = "Full Screen Clock Online (Large Digital Clock)";
  const description =
    "Use a large online full screen clock with seconds, 12/24-hour mode, date display, copy, and fullscreen support.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "full screen clock",
        "online clock full screen",
        "full screen clock with seconds",
        "digital clock online full screen",
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
    { name: "theme-color", content: "#ffffff" },
  ];
}

export function loader() {
  return json({ nowISO: new Date().toISOString() });
}

export default function FullScreenClockRoute({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  return <FullScreenClockPage initialNowISO={nowISO} />;
}
