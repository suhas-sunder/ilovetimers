import type { Route } from "./+types/time-duration-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import { TimeDurationCalculatorPage } from "~/clients/components/date-calculators/MoreDateTimeCalculatorPages";

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Time Duration Calculator (Hours Between Times)",
    description:
      "Calculate elapsed time between two times, including overnight spans, decimal hours, total minutes, total seconds, copy, and reset.",
    path: "/time-duration-calculator",
    keywords: [
      "time duration calculator",
      "duration between times",
      "hours between times",
      "time difference calculator",
      "calculate elapsed time",
    ],
  });
}

export function links() {
  return createDateToolLinks("/time-duration-calculator");
}

export default function TimeDurationCalculatorRoute() {
  return <TimeDurationCalculatorPage />;
}
