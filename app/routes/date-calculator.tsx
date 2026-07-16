import type { Route } from "./+types/date-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
  DateCalculatorPage,
} from "~/clients/components/date-calculators/DateCalculatorPages";

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Date Calculator | Add or Subtract Days, Weeks, and Months",
    description:
      "Add or subtract days, weeks, months, and years from a start date, with clear month-end clamping and the resulting weekday.",
    path: "/date-calculator",
  });
}

export function links() {
  return createDateToolLinks("/date-calculator");
}

export default function DateCalculatorRoute() {
  return <DateCalculatorPage />;
}
