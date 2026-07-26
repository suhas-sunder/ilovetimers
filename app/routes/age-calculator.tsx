import { useLoaderData } from "react-router";
import type { Route } from "./+types/age-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
  todayInputValue,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import { AgeCalculatorPage } from "~/clients/components/date-calculators/MoreDateTimeCalculatorPages";

export function loader() {
  return { today: todayInputValue() };
}

export function clientLoader() {
  return { today: todayInputValue() };
}

clientLoader.hydrate = true as const;

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Age Calculator | Years, Months, and Days",
    description:
      "Calculate age from a birth date to today or another date with years, months, days, total days, birthday context, copy, and today shortcut.",
    path: "/age-calculator",
  });
}

export function links() {
  return createDateToolLinks("/age-calculator");
}

export default function AgeCalculatorRoute() {
  const { today } = useLoaderData<typeof loader>();
  return <AgeCalculatorPage initialToday={today} />;
}
