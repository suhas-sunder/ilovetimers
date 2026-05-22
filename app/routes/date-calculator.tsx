import type { Route } from "./+types/date-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
  DateCalculatorPage,
} from "~/clients/components/date-calculators/DateCalculatorPages";

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Date Calculator (Add or Subtract Days, Weeks, Months)",
    description:
      "Add or subtract days, weeks, months, and years from a start date with presets, copy, reset, today shortcut, and month-end handling.",
    path: "/date-calculator",
    keywords: [
      "date calculator",
      "add days to date",
      "subtract days from date",
      "add weeks to date",
      "add months to date",
    ],
  });
}

export function links() {
  return createDateToolLinks("/date-calculator");
}

export default function DateCalculatorRoute() {
  return <DateCalculatorPage />;
}
