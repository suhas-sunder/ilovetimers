import type { Route } from "./+types/date-duration-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
  DateDurationCalculatorPage,
} from "~/clients/components/date-calculators/DateCalculatorPages";

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Date Duration Calculator (Days Between Dates)",
    description:
      "Calculate elapsed days between two calendar dates, with inclusive days, weeks plus days, weekday names, copy, reset, and today shortcuts.",
    path: "/date-duration-calculator",
    keywords: [
      "date duration calculator",
      "date to date calculator",
      "days between dates",
      "calculate duration between two dates",
      "elapsed days calculator",
    ],
  });
}

export function links() {
  return createDateToolLinks("/date-duration-calculator");
}

export default function DateDurationCalculatorRoute() {
  return <DateDurationCalculatorPage />;
}
