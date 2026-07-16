import type { Route } from "./+types/time-duration-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import { TimeDurationCalculatorPage } from "~/clients/components/date-calculators/MoreDateTimeCalculatorPages";

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Time Duration Calculator | Hours and Minutes Between Times",
    description:
      "Calculate elapsed time between two times, including overnight spans, decimal hours, total minutes, total seconds, copy, and reset.",
    path: "/time-duration-calculator",
  });
}

export function links() {
  return createDateToolLinks("/time-duration-calculator");
}

export default function TimeDurationCalculatorRoute() {
  return <TimeDurationCalculatorPage />;
}
