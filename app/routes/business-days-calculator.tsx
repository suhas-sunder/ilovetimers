import type { Route } from "./+types/business-days-calculator";
import {
  BusinessDaysCalculatorPage,
  createDateToolLinks,
  createDateToolMeta,
} from "~/clients/components/date-calculators/DateCalculatorPages";

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Business Days Calculator | Count Weekdays Between Dates",
    description:
      "Count Monday-through-Friday business days between two dates with configurable endpoint inclusion and a clear no-holidays policy.",
    path: "/business-days-calculator",
  });
}

export function links() {
  return createDateToolLinks("/business-days-calculator");
}

export default function BusinessDaysCalculatorRoute() {
  return <BusinessDaysCalculatorPage />;
}
