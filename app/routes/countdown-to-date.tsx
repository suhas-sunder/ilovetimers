import type { Route } from "./+types/countdown-to-date";
import {
  createDateToolLinks,
  createDateToolMeta,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import { CountdownToDatePage } from "~/clients/components/date-calculators/CountdownWorkdayUtilityPages";

export function loader() {
  return { nowISO: new Date().toISOString() };
}

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Countdown To Date (Countdown To Any Date)",
    description:
      "Set a simple live countdown to a selected local date and time with days, hours, minutes, seconds, copy, share, and fullscreen support.",
    path: "/countdown-to-date",
    keywords: [
      "countdown to date",
      "date countdown",
      "countdown to any date",
      "time left until date",
      "date and time countdown",
    ],
  });
}

export function links() {
  return createDateToolLinks("/countdown-to-date");
}

export default function CountdownToDateRoute({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  return <CountdownToDatePage initialNowISO={nowISO} />;
}
