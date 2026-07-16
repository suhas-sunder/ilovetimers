import type { Route } from "./+types/world-clock-with-milliseconds";
import { json } from "@remix-run/node";
import { WorldClockWithMillisecondsPage } from "~/clients/components/clock-discovery/ClockDiscoveryPages";

const ROUTE_URL = "https://www.ilovetimers.com/world-clock-with-milliseconds";
const OG_IMAGE = "https://www.ilovetimers.com/og-image.png";

export function meta({}: Route.MetaArgs) {
  const title = "World Clock with Milliseconds | Multiple Time Zones";
  const description =
    "Compare current times across multiple time zones with millisecond displays. Device-clock accuracy and browser rendering affect the displayed values.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "world clock with milliseconds",
        "world time milliseconds",
        "world clock milliseconds",
        "live world clock milliseconds",
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

export default function WorldClockWithMillisecondsRoute({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  return <WorldClockWithMillisecondsPage initialNowISO={nowISO} />;
}
