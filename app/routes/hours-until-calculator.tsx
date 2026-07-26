import { useLoaderData } from "react-router";
import type { Route } from "./+types/hours-until-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import {
  HoursUntilCalculatorPage,
  nowDateTimeInputValue,
} from "~/clients/components/date-calculators/MoreDateTimeCalculatorPages";

export function loader() {
  return { now: nowDateTimeInputValue() };
}

export function clientLoader() {
  return { now: nowDateTimeInputValue() };
}

clientLoader.hydrate = true as const;

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Hours Until Calculator | Time Remaining to a Date",
    description:
      "Calculate elapsed hours from a local start date and time to a target, with past results and daylight-saving effects reflected in the total.",
    path: "/hours-until-calculator",
  });
}

export function links() {
  return createDateToolLinks("/hours-until-calculator");
}

export default function HoursUntilCalculatorRoute() {
  const { now } = useLoaderData<typeof loader>();
  return <HoursUntilCalculatorPage initialNow={now} />;
}
