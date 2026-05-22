import type { Route } from "./+types/big-digital-clock";
import { json } from "@remix-run/node";
import { BigDigitalClockPage } from "~/clients/components/clock-discovery/ClockDiscoveryPages";

const ROUTE_URL = "https://www.ilovetimers.com/big-digital-clock";
const OG_IMAGE = "https://www.ilovetimers.com/og-image.png";

export function meta({}: Route.MetaArgs) {
  const title = "Big Digital Clock Online";
  const description =
    "Use a big online digital clock optimized for large room-readable time display with seconds, 12/24-hour mode, date, copy, and fullscreen support.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "big digital clock",
        "large digital clock",
        "large clock display",
        "digital clock big display",
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

export default function BigDigitalClockRoute({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  return <BigDigitalClockPage initialNowISO={nowISO} />;
}
