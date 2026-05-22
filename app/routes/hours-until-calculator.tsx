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

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Hours Until Calculator",
    description:
      "Calculate how many hours remain until a target date and time with days, hours, minutes, total minutes, presets, and copy.",
    path: "/hours-until-calculator",
    keywords: [
      "hours until calculator",
      "hours until a time",
      "how many hours until",
      "hours remaining calculator",
      "hours until date time",
    ],
  });
}

export function links() {
  return createDateToolLinks("/hours-until-calculator");
}

export default function HoursUntilCalculatorRoute() {
  const { now } = useLoaderData<typeof loader>();
  return <HoursUntilCalculatorPage initialNow={now} />;
}
