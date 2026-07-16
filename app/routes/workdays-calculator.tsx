import type { Route } from "./+types/workdays-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import { WorkdaysCalculatorPage } from "~/clients/components/date-calculators/CountdownWorkdayUtilityPages";

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Workdays Calculator | Count a Custom Workweek",
    description:
      "Calculate selected workdays between two dates using a configurable workweek, included dates, non-working days, copy, and reset.",
    path: "/workdays-calculator",
  });
}

export function links() {
  return createDateToolLinks("/workdays-calculator");
}

export default function WorkdaysCalculatorRoute() {
  return <WorkdaysCalculatorPage />;
}
