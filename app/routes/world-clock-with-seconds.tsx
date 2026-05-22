import type { Route } from "./+types/world-clock-with-seconds";
import { json } from "@remix-run/node";
import { WorldClockWithSecondsPage } from "~/clients/components/clock-discovery/ClockDiscoveryPages";

const ROUTE_URL = "https://www.ilovetimers.com/world-clock-with-seconds";
const OG_IMAGE = "https://www.ilovetimers.com/og-image.png";

export function meta({}: Route.MetaArgs) {
  const title = "World Clock With Seconds (Live Global Time)";
  const description =
    "Compare live world times with seconds visible by default. Add or remove cities, reset defaults, copy a summary, and use fullscreen.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "world clock with seconds",
        "world clock live with seconds",
        "world time with seconds",
        "global clock with seconds",
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

export default function WorldClockWithSecondsRoute({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  return <WorldClockWithSecondsPage initialNowISO={nowISO} />;
}
