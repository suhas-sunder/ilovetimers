import { useLoaderData } from "react-router";
import type { Route } from "./+types/birthday-countdown";
import {
  createDateToolLinks,
  createDateToolMeta,
  todayInputValue,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import { BirthdayCountdownPage } from "~/clients/components/date-calculators/MoreDateTimeCalculatorPages";

export function loader() {
  return { today: todayInputValue() };
}

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Birthday Countdown (Days Until My Birthday)",
    description:
      "Calculate days until the next birthday with next birthday date, weekday, optional turning age, copy, and share.",
    path: "/birthday-countdown",
    keywords: [
      "birthday countdown",
      "days until my birthday",
      "birthday countdown calculator",
      "how many days until my birthday",
      "birthday date countdown",
    ],
  });
}

export function links() {
  return createDateToolLinks("/birthday-countdown");
}

export default function BirthdayCountdownRoute() {
  const { today } = useLoaderData<typeof loader>();
  return <BirthdayCountdownPage initialToday={today} />;
}
