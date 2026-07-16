import type { Route } from "./+types/full-screen-analog-clock";
import { json } from "@remix-run/node";
import { FullScreenAnalogClockPage } from "~/clients/components/clock-discovery/ClockDiscoveryPages";

const ROUTE_URL = "https://www.ilovetimers.com/full-screen-analog-clock";
const OG_IMAGE = "https://www.ilovetimers.com/og-image.png";

export function meta({}: Route.MetaArgs) {
  const title = "Fullscreen Analog Clock | Large Local Time Display";
  const description =
    "Open a large fullscreen analog clock for classrooms, meetings, presentations, practice sessions, and shared displays.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "full screen analog clock",
        "online analog clock full screen",
        "analog clock fullscreen",
        "clock face full screen",
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

export default function FullScreenAnalogClockRoute({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  return <FullScreenAnalogClockPage initialNowISO={nowISO} />;
}
