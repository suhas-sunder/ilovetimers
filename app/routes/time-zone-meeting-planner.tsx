// app/routes/time-zone-meeting-planner.tsx
import type { Route } from "./+types/time-zone-meeting-planner";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useState } from "react";
import {
  Button as Btn,
  ContentSection,
  DisplayStage,
  Field,
  PageShell,
  SecondaryActionRow,
  Select,
  SeoBand,
  SettingGroup,
  SettingRow,
  ToolFrame as Card,
  ToolHero,
} from "~/clients/components/ui/foundation";

type ZoneOption = {
  value: string;
  label: string;
};

type ZoneTime = {
  zone: string;
  label: string;
  time: string;
  startMinutes: number;
  workable: boolean;
};

type Candidate = {
  utcMs: number;
  utcLabel: string;
  zoneTimes: ZoneTime[];
  workableCount: number;
  allWorkable: boolean;
};

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_PATH = "/time-zone-meeting-planner";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const TZ_OPTIONS: ZoneOption[] = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "New York" },
  { value: "America/Chicago", label: "Chicago" },
  { value: "America/Denver", label: "Denver" },
  { value: "America/Los_Angeles", label: "Los Angeles" },
  { value: "America/Sao_Paulo", label: "Sao Paulo" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Africa/Johannesburg", label: "Johannesburg" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Kolkata", label: "India" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "Pacific/Auckland", label: "Auckland" },
];

const DEFAULT_ZONES = ["UTC", "America/New_York", "Europe/London"];

export function meta({}: Route.MetaArgs) {
  const title = "Time Zone Meeting Planner";
  const description =
    "Compare meeting times across multiple time zones with date, duration, work-hour windows, candidate times, and copy or share summary.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "time zone meeting planner",
        "meeting time planner",
        "timezone meeting scheduler",
        "remote meeting time",
        "world meeting planner",
        "DST meeting planner",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: ROUTE_URL },
    { property: "og:image", content: OG_IMAGE },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: OG_IMAGE },
    { tagName: "link", rel: "canonical", href: ROUTE_URL },
  ];
}

export function loader() {
  return json({ today: new Date().toISOString().slice(0, 10) });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isValidTz(zone: string) {
  if (zone === "UTC") return true;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function zoneLabel(zone: string) {
  return TZ_OPTIONS.find((option) => option.value === zone)?.label ?? zone;
}

function tryGuessUserTimeZone() {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zone && isValidTz(zone) ? zone : "UTC";
  } catch {
    return "UTC";
  }
}

function parseDateInput(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function utcMsForHour(date: string, hour: number) {
  const parts = parseDateInput(date);
  if (!parts) return null;
  return Date.UTC(parts.year, parts.month - 1, parts.day, hour, 0, 0);
}

function getZoneParts(date: Date, zone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const hourRaw = Number(get("hour"));
  const hour = Number.isFinite(hourRaw) ? hourRaw % 24 : 0;
  const minuteRaw = Number(get("minute"));
  const minute = Number.isFinite(minuteRaw) ? minuteRaw : 0;
  return {
    label: `${get("weekday")} ${get("month")} ${get("day")}, ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    startMinutes: hour * 60 + minute,
  };
}

function buildCandidates(args: {
  date: string;
  zones: string[];
  durationMinutes: number;
  workStartHour: number;
  workEndHour: number;
}) {
  const duration = clamp(args.durationMinutes, 15, 720);
  const windowStart = clamp(args.workStartHour, 0, 23) * 60;
  const windowEnd = clamp(args.workEndHour, 1, 24) * 60;
  const validWindow = windowEnd > windowStart;
  const rows: Candidate[] = [];

  for (let hour = 0; hour < 24; hour += 1) {
    const utcMs = utcMsForHour(args.date, hour);
    if (utcMs == null) continue;
    const date = new Date(utcMs);
    const zoneTimes = args.zones.map((zone) => {
      const parts = getZoneParts(date, zone);
      const workable =
        validWindow &&
        parts.startMinutes >= windowStart &&
        parts.startMinutes + duration <= windowEnd;
      return {
        zone,
        label: zoneLabel(zone),
        time: parts.label,
        startMinutes: parts.startMinutes,
        workable,
      };
    });
    const workableCount = zoneTimes.filter((entry) => entry.workable).length;
    rows.push({
      utcMs,
      utcLabel: `${String(hour).padStart(2, "0")}:00 UTC`,
      zoneTimes,
      workableCount,
      allWorkable: validWindow && workableCount === args.zones.length,
    });
  }

  return rows.sort((a, b) => {
    if (a.allWorkable !== b.allWorkable) return a.allWorkable ? -1 : 1;
    return b.workableCount - a.workableCount || a.utcMs - b.utcMs;
  });
}

function TimeZoneMeetingPlannerTool({ today }: { today: string }) {
  const [date, setDate] = useState(today);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [workStartHour, setWorkStartHour] = useState(9);
  const [workEndHour, setWorkEndHour] = useState(17);
  const [zones, setZones] = useState<string[]>(DEFAULT_ZONES);
  const [zoneToAdd, setZoneToAdd] = useState("America/Los_Angeles");
  const [localZone, setLocalZone] = useState("UTC");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    setLocalZone(tryGuessUserTimeZone());
  }, []);

  const candidates = useMemo(
    () =>
      buildCandidates({
        date,
        zones,
        durationMinutes,
        workStartHour,
        workEndHour,
      }),
    [date, durationMinutes, workEndHour, workStartHour, zones],
  );
  const bestCandidate = candidates.find((candidate) => candidate.allWorkable);
  const fallbackCandidate = candidates[0];
  const displayCandidate = bestCandidate ?? fallbackCandidate;
  const windowValid = workEndHour > workStartHour;

  function addZone(zone: string) {
    if (!isValidTz(zone)) return;
    setZones((items) => (items.includes(zone) ? items : [...items, zone].slice(0, 8)));
  }

  function removeZone(zone: string) {
    setZones((items) => (items.length <= 1 ? items : items.filter((item) => item !== zone)));
  }

  function summaryText() {
    const lines = [
      "Time zone meeting plan",
      `Date: ${date}`,
      `Duration: ${durationMinutes} minutes`,
      `Work window: ${workStartHour}:00-${workEndHour}:00 local time`,
    ];
    if (displayCandidate) {
      lines.push(
        bestCandidate
          ? `Suggested start: ${displayCandidate.utcLabel}`
          : `Closest candidate: ${displayCandidate.utcLabel} (${displayCandidate.workableCount}/${zones.length} zones inside the window)`,
      );
      displayCandidate.zoneTimes.forEach((entry) => {
        lines.push(`${entry.label}: ${entry.time}`);
      });
    }
    return lines.join("\n");
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summaryText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  async function shareSummary() {
    const text = summaryText();
    const nav = navigator as Navigator & {
      share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
    };
    try {
      if (typeof nav.share === "function") {
        await nav.share({
          title: "Time zone meeting plan",
          text,
        });
        setShared(true);
        window.setTimeout(() => setShared(false), 1400);
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }
    } catch {
      setShared(false);
    }
  }

  return (
    <Card className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
      <div className="timer-list-stack flex h-full flex-col">
        <DisplayStage
          className="timer-display-surface mt-4 flex flex-col items-center justify-center p-4 sm:p-6"
          style={{ minHeight: 360 }}
          aria-live="polite"
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
            {bestCandidate ? "Best shared work window" : "Closest candidate"}
          </div>
          <div
            data-primary-display-value
            className="mt-4 text-center font-mono text-5xl font-extrabold tracking-widest text-[var(--ilt-text-primary)] sm:text-7xl"
          >
            {displayCandidate?.utcLabel ?? "No date"}
          </div>
          <div className="mt-4 max-w-3xl text-center text-sm font-semibold leading-6 text-[var(--ilt-text-secondary)] sm:text-base">
            {windowValid
              ? bestCandidate
                ? `All ${zones.length} selected zones fit inside ${workStartHour}:00-${workEndHour}:00 local time for a ${durationMinutes}-minute meeting.`
                : `No full overlap found. The shown time fits ${displayCandidate?.workableCount ?? 0} of ${zones.length} selected zones.`
              : "Set the workday end hour later than the start hour to find overlap."}
          </div>
          {displayCandidate ? (
            <div className="order-20 mt-5 grid w-full max-w-5xl gap-2 text-left sm:grid-cols-2 lg:grid-cols-3">
              {displayCandidate.zoneTimes.map((entry) => (
                <div key={entry.zone} className="px-2 py-1">
                  <div className="text-xs font-bold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    {entry.label}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[var(--ilt-text-primary)]">
                    {entry.time}
                  </div>
                  <div className="mt-1 text-xs text-[var(--ilt-text-muted)]">
                    {entry.workable ? "Inside window" : "Outside window"}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </DisplayStage>

        <SettingGroup
          title="Meeting details"
          description="Date matters because daylight saving rules can change across the year."
        >
          <SettingRow className="sm:grid-cols-2">
            <Field
              label="Meeting date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.currentTarget.value || today)}
            />
            <Field
              label="Duration minutes"
              type="number"
              min={15}
              max={720}
              step={15}
              value={durationMinutes}
              onChange={(event) =>
                setDurationMinutes(clamp(Number(event.currentTarget.value || 15), 15, 720))
              }
            />
          </SettingRow>
        </SettingGroup>

        <SettingGroup
          title="Work-hour window"
          description="Use local 24-hour times for the regular work window you want to compare."
        >
          <SettingRow className="sm:grid-cols-2">
            <Field
              label="Workday start hour"
              type="number"
              min={0}
              max={23}
              value={workStartHour}
              onChange={(event) =>
                setWorkStartHour(clamp(Number(event.currentTarget.value || 0), 0, 23))
              }
              hint="Local 24-hour time."
            />
            <Field
              label="Workday end hour"
              type="number"
              min={1}
              max={24}
              value={workEndHour}
              onChange={(event) =>
                setWorkEndHour(clamp(Number(event.currentTarget.value || 1), 1, 24))
              }
              hint="Local 24-hour time."
            />
          </SettingRow>
        </SettingGroup>

        <SettingGroup
          title="Time zones"
          description="Add the locations you want to compare. Candidate times are evaluated against each selected zone's local work window."
        >
          <SettingRow className="sm:grid-cols-[minmax(0,1fr)_auto_auto]">
            <Select
              label="Add time zone"
              value={zoneToAdd}
              onChange={(event) => setZoneToAdd(event.currentTarget.value)}
            >
              {TZ_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.value})
                </option>
              ))}
            </Select>
            <div className="flex items-end">
              <Btn kind="solid" onClick={() => addZone(zoneToAdd)}>
                Add zone
              </Btn>
            </div>
            <div className="flex items-end">
              <Btn kind="ghost" onClick={() => addZone(localZone)}>
                Add local zone
              </Btn>
            </div>
          </SettingRow>

          <div className="grid gap-2 sm:grid-cols-2">
            {zones.map((zone) => (
              <div
                key={zone}
                className="flex items-center justify-between gap-3 px-1 py-1 text-sm font-semibold text-[var(--ilt-text-primary)]"
              >
                <span className="min-w-0 truncate">{zoneLabel(zone)}</span>
                <button
                  type="button"
                  className="ilt-focus-ring cursor-pointer rounded-[var(--ilt-radius-control)] px-2 py-1 text-xs text-[var(--ilt-text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => removeZone(zone)}
                  disabled={zones.length <= 1}
                  aria-label={`Remove ${zoneLabel(zone)}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </SettingGroup>

        <SettingGroup
          title="Candidate meeting times"
          description="Rows are sorted by full overlap first, then by how many selected zones fit inside the work window."
        >
          <div className="grid gap-3">
            {candidates.slice(0, 6).map((candidate) => (
              <div key={candidate.utcMs} className="px-1 py-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="font-mono text-lg font-extrabold text-[var(--ilt-text-primary)]">
                    {candidate.utcLabel}
                  </div>
                  <div className="text-sm font-semibold text-[var(--ilt-text-secondary)]">
                    {candidate.allWorkable
                      ? "All zones fit"
                      : `${candidate.workableCount}/${zones.length} zones fit`}
                  </div>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {candidate.zoneTimes.map((entry) => (
                    <div key={entry.zone} className="text-sm text-[var(--ilt-text-secondary)]">
                      <span className="font-semibold text-[var(--ilt-text-primary)]">
                        {entry.label}:
                      </span>{" "}
                      {entry.time}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SettingGroup>

        <SecondaryActionRow>
          <Btn kind="ghost" onClick={() => void copySummary()}>
            {copied ? "Copied" : "Copy meeting summary"}
          </Btn>
          <Btn kind="ghost" onClick={() => void shareSummary()}>
            {shared ? "Shared" : "Share summary"}
          </Btn>
          <Btn
            kind="ghost"
            onClick={() => {
              setDate(today);
              setDurationMinutes(60);
              setWorkStartHour(9);
              setWorkEndHour(17);
              setZones(DEFAULT_ZONES);
            }}
          >
            Reset planner
          </Btn>
        </SecondaryActionRow>
      </div>
    </Card>
  );
}

export default function TimeZoneMeetingPlannerPage({
  loaderData: { today },
}: Route.ComponentProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Time Zone Meeting Planner",
        url: ROUTE_URL,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Any",
        description:
          "A browser-based planner for comparing meeting times across multiple time zones with date, duration, work windows, candidate times, and copy or share summary.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Time Zone Meeting Planner",
            item: ROUTE_URL,
          },
        ],
      },
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ToolHero
        display={<TimeZoneMeetingPlannerTool today={today} />}
        title="Time Zone Meeting Planner"
        description="Compare possible meeting times across multiple time zones with a date, duration, local work-hour window, candidate times, and copy or share summary."
      />

      <SeoBand>
        <ContentSection title="How this time zone meeting planner works">
          <p>
            Add the time zones for everyone in the meeting, choose the date,
            set the meeting duration, and enter the local work-hour window you
            want to respect. The planner compares candidate UTC start times
            against each selected zone.
          </p>
          <p>
            Date selection matters because daylight saving time can change the
            relationship between locations. A meeting time that works in March
            may not map the same way in November.
          </p>
        </ContentSection>

        <ContentSection title="When to use it">
          <p>
            Use it for remote teams, client calls, interviews, webinars, study
            groups, international family calls, and planning conversations where
            several locations need to be considered at once.
          </p>
          <p>
            This planner is not a calendar app and does not send invitations.
            It helps compare local times so you can choose a meeting slot and
            copy or share a plain summary.
          </p>
        </ContentSection>

        <ContentSection title="Planner, converter, or world clock">
          <p>
            Use the{" "}
            <a className="ilt-content-link" href="/time-zone-converter">
              time zone converter
            </a>{" "}
            when you already have one source time and want to convert it. Use
            the{" "}
            <a className="ilt-content-link" href="/world-clock">
              world clock
            </a>{" "}
            to see current times. Use this planner when you need to compare a
            date, duration, work window, and multiple locations.
          </p>
          <p>
            Once a meeting is scheduled, the{" "}
            <a className="ilt-content-link" href="/meeting-timer">
              meeting timer
            </a>{" "}
            or{" "}
            <a className="ilt-content-link" href="/meeting-agenda-timer">
              meeting agenda timer
            </a>{" "}
            can help run it.
          </p>
        </ContentSection>

        <ContentSection title="Accuracy and limitations">
          <p>
            Time zone results depend on the browser's time zone data, the date
            you choose, and daylight saving rules for each location. For
            critical deadlines, travel, or official scheduling, check the
            final time with the relevant calendar or local source.
          </p>
          <p>
            UTC is used as the shared comparison point. The{" "}
            <a className="ilt-content-link" href="/utc-clock">
              UTC clock
            </a>{" "}
            can help when a schedule is written directly in UTC.
          </p>
        </ContentSection>

        <ContentSection title="Time zone meeting planner FAQ">
          <h3>Does this account for daylight saving time?</h3>
          <p>
            It uses the browser's time zone data for the date you enter, so the
            selected date is part of the calculation.
          </p>
          <h3>Can I add several zones?</h3>
          <p>
            Yes. Add the zones you want to compare, remove zones you do not
            need, and the candidate rows update immediately.
          </p>
          <h3>Why do some rows say only part of the group fits?</h3>
          <p>
            The row may fall inside the work-hour window for some locations but
            outside it for others. That can still be useful when there is no
            perfect overlap.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}
