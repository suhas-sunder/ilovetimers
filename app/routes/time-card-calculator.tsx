import type { Route } from "./+types/time-card-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import { TimeCardCalculatorPage } from "~/clients/components/date-calculators/DateTimeUtilityExtras";

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Time Card Calculator with Breaks | Work Hours Total",
    description:
      "Total multiple clock-in and clock-out rows, subtract unpaid breaks, and review each row in hours and minutes plus decimal hours.",
    path: "/time-card-calculator",
  });
}

export function links() {
  return createDateToolLinks("/time-card-calculator");
}

export default function TimeCardCalculatorRoute() {
  return <TimeCardCalculatorPage />;
}
