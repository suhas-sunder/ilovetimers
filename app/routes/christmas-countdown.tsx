import type { Route } from "./+types/christmas-countdown";
import {
  createDateToolLinks,
  createDateToolMeta,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import { ChristmasCountdownPage } from "~/clients/components/date-calculators/CountdownWorkdayUtilityPages";

export function loader() {
  return { nowISO: new Date().toISOString() };
}

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Christmas Countdown (Days Until Christmas)",
    description:
      "Count down to the next December 25 with a large live display, local date targeting, copy, share, and fullscreen support.",
    path: "/christmas-countdown",
    keywords: [
      "Christmas countdown",
      "countdown to Christmas",
      "days until Christmas",
      "Christmas timer",
      "holiday countdown",
    ],
  });
}

export function links() {
  return createDateToolLinks("/christmas-countdown");
}

export default function ChristmasCountdownRoute({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  return <ChristmasCountdownPage initialNowISO={nowISO} />;
}
