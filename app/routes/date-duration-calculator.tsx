import type { Route } from "./+types/date-duration-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
  DateDurationCalculatorPage,
} from "~/clients/components/date-calculators/DateCalculatorPages";

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Date Duration Calculator | Time Between Two Dates",
    description:
      "Calculate elapsed calendar days between two dates, with inclusive days and a weeks-plus-days result shown as separate representations.",
    path: "/date-duration-calculator",
  });
}

export function links() {
  return createDateToolLinks("/date-duration-calculator");
}

export default function DateDurationCalculatorRoute() {
  return <DateDurationCalculatorPage />;
}
