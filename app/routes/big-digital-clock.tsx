import type { Route } from "./+types/big-digital-clock";
import { json } from "@remix-run/node";
import { BigDigitalClockPage } from "~/clients/components/clock-discovery/ClockDiscoveryPages";

const ROUTE_URL = "https://www.ilovetimers.com/big-digital-clock";
const OG_IMAGE = "https://www.ilovetimers.com/og-image.png";

export function meta({}: Route.MetaArgs) {
  const title = "Big Digital Clock | Large Current Time Display";
  const description =
    "View current local time in a large digital display with seconds, date, 12- or 24-hour format, copy, and fullscreen controls.";

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
    { tagName: "link", rel: "canonical", href: ROUTE_URL },
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
