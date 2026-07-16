import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PERMANENT_REDIRECTS } from "../../app/config/redirects.js";
import { RELATED_TOOL_LINKS } from "../../app/clients/config/relatedTools.js";
import { SITEMAP_GROUPS } from "../../app/clients/config/siteDirectory.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE_URL = "https://www.ilovetimers.com";
const failures = [];

const calculators = [
  ["/date-calculator", "Date Calculator | Add or Subtract Days, Weeks, and Months", "Date Calculator", "app/clients/components/date-calculators/DateCalculatorPages.tsx"],
  ["/date-duration-calculator", "Date Duration Calculator | Time Between Two Dates", "Date Duration Calculator", "app/clients/components/date-calculators/DateCalculatorPages.tsx"],
  ["/days-until-calculator", "Days Until Calculator | Count Days to a Date", "Days Until Calculator", "app/clients/components/date-calculators/MoreDateTimeCalculatorPages.tsx"],
  ["/weeks-between-dates-calculator", "Weeks Between Dates Calculator | Weeks and Days", "Weeks Between Dates Calculator", "app/clients/components/date-calculators/DateTimeUtilityExtras.tsx"],
  ["/months-between-dates-calculator", "Months Between Dates Calculator | Calendar Months and Days", "Months Between Dates Calculator", "app/clients/components/date-calculators/MoreDateTimeCalculatorPages.tsx"],
  ["/hours-until-calculator", "Hours Until Calculator | Time Remaining to a Date", "Hours Until Calculator", "app/clients/components/date-calculators/MoreDateTimeCalculatorPages.tsx"],
  ["/weekday-calculator", "Weekday Calculator | Find the Day of the Week", "Weekday Calculator", "app/clients/components/date-calculators/MoreDateTimeCalculatorPages.tsx"],
  ["/week-number-calculator", "ISO Week Number Calculator | Week of Year", "Week Number Calculator", "app/clients/components/date-calculators/MoreDateTimeCalculatorPages.tsx"],
  ["/age-calculator", "Age Calculator | Years, Months, and Days", "Age Calculator", "app/clients/components/date-calculators/MoreDateTimeCalculatorPages.tsx"],
  ["/time-calculator", "Time Calculator | Add and Subtract Durations", "Time Calculator", "app/routes/time-calculator.tsx"],
  ["/time-duration-calculator", "Time Duration Calculator | Hours and Minutes Between Times", "Time Duration Calculator", "app/clients/components/date-calculators/MoreDateTimeCalculatorPages.tsx"],
  ["/business-days-calculator", "Business Days Calculator | Count Weekdays Between Dates", "Business Days Calculator", "app/clients/components/date-calculators/DateCalculatorPages.tsx"],
  ["/workdays-calculator", "Workdays Calculator | Count a Custom Workweek", "Workdays Calculator", "app/clients/components/date-calculators/CountdownWorkdayUtilityPages.tsx"],
  ["/work-hours-calculator", "Work Hours Calculator | Shift Time with Breaks", "Work Hours Calculator", "app/routes/work-hours-calculator.tsx"],
  ["/time-card-calculator", "Time Card Calculator with Breaks | Work Hours Total", "Time Card Calculator", "app/clients/components/date-calculators/DateTimeUtilityExtras.tsx"],
  ["/weekly-timesheet-calculator", "Weekly Timesheet Calculator | Daily and Weekly Hours", "Weekly Timesheet Calculator", "app/clients/components/date-calculators/CountdownWorkdayUtilityPages.tsx"],
  ["/billable-hours-calculator", "Billable Hours Calculator | Time, Rate, and Rounding", "Billable Hours Calculator", "app/routes/billable-hours-calculator.tsx"],
  ["/billable-hours-clock", "Billable Hours Clock | Live Time and Cost Tracker", "Billable Hours Clock (Live Timer)", "app/routes/billable-hours-clock.tsx"],
];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function read(relativePath) {
  return readFile(path.join(ROOT, relativePath), "utf8");
}

function configuredRoutesFrom(source) {
  const routes = new Set(["/"]);
  for (const match of source.matchAll(/\broute\(\s*["']([^"']+)["']/g)) routes.add(`/${match[1]}`);
  return routes;
}

function firstString(source, key) {
  const constant = source.match(new RegExp(`const\\s+${key}\\s*=\\s*(?:\\r?\\n\\s*)?["']([^"']+)["']`));
  if (constant) return constant[1];
  return source.match(new RegExp(`${key}:\\s*(?:\\r?\\n\\s*)?["']([^"']+)["']`))?.[1] ?? "";
}

function xmlPathsFrom(source) {
  return [...source.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1].trim()).pathname);
}

function moreDirectoryRoutesFrom(source) {
  const start = source.indexOf("const TIMER_DIRECTORY");
  const end = source.indexOf("\n];", start);
  check(start >= 0 && end > start, "Could not parse the More-directory data.");
  return start >= 0 && end > start
    ? [...source.slice(start, end).matchAll(/href:\s*["'](\/[^"']*)["']/g)].map((match) => match[1])
    : [];
}

function footerRoutesFrom(source) {
  const start = source.indexOf("export const footerSections");
  const end = source.indexOf("const footerLinkClass", start);
  check(start >= 0 && end > start, "Could not parse the footer route directory.");
  return start >= 0 && end > start
    ? [...source.slice(start, end).matchAll(/to:\s*["'](\/[^"']*)["']/g)].map((match) => match[1])
    : [];
}

const [routesSource, sitemapSource, rootSource, footerSource] = await Promise.all([
  read("app/routes.ts"),
  read("public/sitemap.xml"),
  read("app/root.tsx"),
  read("app/clients/components/navigation/Footer.tsx"),
]);
const configuredRoutes = configuredRoutesFrom(routesSource);
const redirectSources = new Set(Object.keys(PERMANENT_REDIRECTS));
const xmlPaths = xmlPathsFrom(sitemapSource);
const moreRoutes = moreDirectoryRoutesFrom(rootSource);
const footerRoutes = footerRoutesFrom(footerSource);
const htmlRoutes = SITEMAP_GROUPS.flatMap((group) => group.routes);
const titles = [];
const descriptions = [];
const scopedSources = new Map();

for (const [route, expectedTitle, expectedH1, pageFile] of calculators) {
  const routeFile = `app/routes/${route.slice(1)}.tsx`;
  const [routeSource, pageSource] = await Promise.all([read(routeFile), read(pageFile)]);
  scopedSources.set(routeFile, routeSource);
  scopedSources.set(pageFile, pageSource);
  const title = firstString(routeSource, "title");
  const description = firstString(routeSource, "description");
  titles.push(title);
  descriptions.push(description);

  check(configuredRoutes.has(route), `Calculator route is not configured: ${route}`);
  check(title === expectedTitle, `${route} has an unexpected title: ${title}`);
  check(description.length > 40, `${route} has a missing or too-vague description.`);
  check(!routeSource.includes('name: "keywords"'), `${route} still emits a keyword-list meta tag.`);
  check(
    routeSource.includes(`createDateToolLinks("${route}")`) ||
      routeSource.includes(`const url = "${SITE_URL}${route}"`),
    `${route} does not declare its self-canonical URL.`,
  );
  check(
    pageSource.includes(`title="${expectedH1}"`) || routeSource.includes(`title="${expectedH1}"`),
    `${route} does not expose the expected ToolHero H1: ${expectedH1}`,
  );
  check(!redirectSources.has(route), `${route} is unexpectedly a redirect source.`);
  check(Boolean(RELATED_TOOL_LINKS[route]), `${route} has no centralized related-tool group.`);
  check(htmlRoutes.includes(route), `${route} is missing from the HTML sitemap.`);
  check(xmlPaths.includes(route), `${route} is missing from the XML sitemap.`);
  check(moreRoutes.includes(route), `${route} is missing from the More directory.`);
  check(footerRoutes.includes(route), `${route} is missing from the footer directory.`);
}

check(new Set(titles).size === titles.length, "Calculator routes contain duplicate titles.");
check(new Set(descriptions).size === descriptions.length, "Calculator routes contain duplicate descriptions.");

for (const [route] of calculators) {
  const group = RELATED_TOOL_LINKS[route];
  if (!group) continue;
  check(group.links.length >= 3 && group.links.length <= 6, `${route} has an invalid related-link count.`);
  const destinations = group.links.map((link) => link.to);
  check(new Set(destinations).size === destinations.length, `${route} repeats a related destination.`);
  for (const destination of destinations) {
    check(destination !== route, `${route} links to itself.`);
    check(configuredRoutes.has(destination), `${route} links to a missing route: ${destination}`);
    check(!redirectSources.has(destination), `${route} links to a redirect alias: ${destination}`);
    check(!/[?#]/.test(destination), `${route} has a query or fragment in a related link.`);
    check(destination === "/" || !destination.endsWith("/"), `${route} has a trailing-slash related link.`);
  }
}

const datePages = await read("app/clients/components/date-calculators/DateCalculatorPages.tsx");
const extras = await read("app/clients/components/date-calculators/DateTimeUtilityExtras.tsx");
const morePages = await read("app/clients/components/date-calculators/MoreDateTimeCalculatorPages.tsx");
const workdayPages = await read("app/clients/components/date-calculators/CountdownWorkdayUtilityPages.tsx");
const workHoursBundle = [
  await read("app/routes/work-hours-calculator.tsx"),
  await read("app/clients/components/work-hours-calculator/FAQ.tsx"),
].join("\n");
const billableBundle = [
  await read("app/routes/billable-hours-calculator.tsx"),
  await read("app/clients/components/billable-hours-calculator/FAQ.tsx"),
  await read("app/routes/billable-hours-clock.tsx"),
  await read("app/clients/components/billable-hours-clock/FAQ.tsx"),
].join("\n");

for (const [label, source, terms] of [
  ["date duration", datePages, ["elapsed days", "both endpoints"]],
  ["weeks between", extras, ["Elapsed mode", "Decimal weeks", "negative sign"]],
  ["months between", morePages, ["completed calendar months", "last valid date"]],
  ["days until", morePages, ["starting date is excluded", "days-since"]],
  ["hours until", morePages, ["local timezone", "daylight-saving"]],
  ["business days", datePages, ["Monday-through-Friday", "does not automatically exclude public holidays"]],
  ["workdays", workdayPages, ["selected weekend policy", "does not automatically exclude public holidays"]],
  ["weekly timesheet", workdayPages, ["No rounding increment", "does not calculate wages, overtime"]],
  ["work hours", workHoursBundle, ["overnight", "break", "does not calculate overtime", "not payroll"]],
  ["billable tools", billableBundle, ["round", "no exchange-rate conversion", "payroll"]],
]) {
  const normalizedSource = source.replace(/\s+/g, " ").toLowerCase();
  for (const term of terms) {
    check(normalizedSource.includes(term.toLowerCase()), `${label} is missing assumption text: ${term}`);
  }
}

for (const [source, names] of [
  [datePages, ["DATE_DURATION_FAQ", "DATE_CALCULATOR_FAQ", "BUSINESS_DAYS_FAQ"]],
  [extras, ["WEEKS_BETWEEN_FAQ", "TIME_CARD_FAQ"]],
  [morePages, ["TIME_DURATION_FAQ", "AGE_FAQ", "DAYS_UNTIL_FAQ", "WEEKDAY_FAQ", "WEEK_NUMBER_FAQ", "MONTHS_BETWEEN_FAQ", "HOURS_UNTIL_FAQ"]],
  [workdayPages, ["WORKDAYS_FAQ", "WEEKLY_TIMESHEET_FAQ"]],
]) {
  for (const name of names) {
    check(source.includes(`faqItems={${name}}`), `${name} is not used for FAQ schema.`);
    check(source.includes(`${name}.map`) || source.includes(`items={${name}}`), `${name} is not used for visible FAQ content.`);
  }
}

const combinedSource = [...scopedSources.values(), datePages, extras, morePages, workdayPages, workHoursBundle, billableBundle].join("\n");
for (const schemaType of ["HowTo", "Organization", "Review", "AggregateRating", "Offer", "Article"]) {
  check(!new RegExp(`["']@type["']\\s*:\\s*["']${schemaType}["']`).test(combinedSource), `Calculator source contains prohibited ${schemaType} schema.`);
}
check(!/["'](?:aggregateRating|reviewRating|offers)["']\s*:/.test(combinedSource), "Calculator source contains rating, review, or offer properties.");

check(configuredRoutes.size === 136, `Expected 136 configured routes; found ${configuredRoutes.size}.`);
check(Object.keys(PERMANENT_REDIRECTS).length === 17, "Expected 17 permanent redirects.");
check(xmlPaths.length === 133, `Expected 133 XML sitemap URLs; found ${xmlPaths.length}.`);
check(moreRoutes.length === 126, `Expected 126 More-directory tools; found ${moreRoutes.length}.`);
check(footerRoutes.length === 136, `Expected 136 footer routes; found ${footerRoutes.length}.`);
check(Object.keys(RELATED_TOOL_LINKS).length === 67, `Expected 67 related-tool groups; found ${Object.keys(RELATED_TOOL_LINKS).length}.`);

if (failures.length) {
  console.error("Calculator integrity audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Calculator integrity audit passed (${calculators.length} routes, ${configuredRoutes.size} canonical routes, ${Object.keys(PERMANENT_REDIRECTS).length} redirects, ${xmlPaths.length} sitemap URLs, ${Object.keys(RELATED_TOOL_LINKS).length} related groups).`);
}
