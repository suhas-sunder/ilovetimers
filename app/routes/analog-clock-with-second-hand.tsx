import type { Route } from "./+types/analog-clock-with-second-hand";
import { json } from "@remix-run/node";
import { AnalogClockWithSecondHandPage } from "~/clients/components/clock-discovery/ClockDiscoveryPages";

const ROUTE_URL = "https://www.ilovetimers.com/analog-clock-with-second-hand";
const OG_IMAGE = "https://www.ilovetimers.com/og-image.png";

export function meta({}: Route.MetaArgs) {
  const title = "Analog Clock with Second Hand | Live Local Time";
  const description =
    "View a clear analog clock with a visible second hand for classrooms, practice, presentations, and everyday time checks.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "analog clock with second hand",
        "online analog clock with second hand",
        "live clock with second hand",
        "clock face with second hand",
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

export default function AnalogClockWithSecondHandRoute({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  return <AnalogClockWithSecondHandPage initialNowISO={nowISO} />;
}
