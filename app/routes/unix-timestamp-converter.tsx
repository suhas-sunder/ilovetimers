// app/routes/unix-timestamp-converter.tsx
import type { Route } from "./+types/unix-timestamp-converter";
import { json } from "@remix-run/node";
import { useMemo, useState } from "react";
import {
  Button as Btn,
  ContentSection,
  ControlGroup,
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
import { ToolTrustNote } from "~/clients/components/trust/ToolTrust";

type TimestampUnit = "auto" | "seconds" | "milliseconds" | "microseconds";

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_PATH = "/unix-timestamp-converter";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const REVIEW_DATE = { iso: "2026-07-14", label: "July 14, 2026" } as const;

export function meta({}: Route.MetaArgs) {
  const title = "Unix Timestamp Converter (Seconds, Milliseconds, UTC)";
  const description =
    "Convert Unix timestamps to UTC, local time, ISO strings, seconds, and milliseconds, or convert a UTC date back into Unix epoch values.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "unix timestamp converter",
        "epoch converter",
        "timestamp to date",
        "unix time to date",
        "epoch milliseconds",
        "javascript date milliseconds",
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

export async function loader() {
  return json({ nowISO: new Date().toISOString() });
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatUtcInput(date: Date) {
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
  ].join("-") + `T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

function formatReadableUtc(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} UTC`;
}

function formatReadableLocal(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "long",
  }).format(date);
}

function detectUnit(raw: string): Exclude<TimestampUnit, "auto"> {
  const digits = raw.replace(/^[+-]/, "").replace(/\D/g, "");
  if (digits.length >= 15) return "microseconds";
  if (digits.length >= 12) return "milliseconds";
  return "seconds";
}

function parseTimestamp(rawValue: string, mode: TimestampUnit) {
  const trimmed = rawValue.trim().replace(/,/g, "").replace(/_/g, "");
  if (!trimmed) return { error: "Enter a Unix timestamp to convert." };

  const numericValue = Number(trimmed);
  if (!Number.isFinite(numericValue)) {
    return { error: "That timestamp is not a valid number." };
  }

  const unit = mode === "auto" ? detectUnit(trimmed) : mode;
  const milliseconds =
    unit === "seconds"
      ? numericValue * 1000
      : unit === "microseconds"
        ? numericValue / 1000
        : numericValue;

  const date = new Date(milliseconds);
  if (!Number.isFinite(date.getTime())) {
    return { error: "That timestamp is outside the range this browser can display." };
  }

  return { date, milliseconds: date.getTime(), unit };
}

function parseUtcDateTime(value: string) {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (!match) return null;

  const [, year, month, day, hour, minute, second = "0"] = match;
  const milliseconds = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
  const date = new Date(milliseconds);
  return Number.isFinite(date.getTime()) ? date : null;
}

function timestampSummary(date: Date) {
  const milliseconds = date.getTime();
  return {
    iso: date.toISOString(),
    seconds: Math.floor(milliseconds / 1000).toString(),
    milliseconds: milliseconds.toString(),
    utc: formatReadableUtc(date),
    local: formatReadableLocal(date),
  };
}

function useCopyFeedback() {
  const [copied, setCopied] = useState("");

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1400);
    } catch {
      setCopied("Copy unavailable");
      window.setTimeout(() => setCopied(""), 1400);
    }
  }

  return { copied, copy };
}

function UnixTimestampConverterTool({
  nowISO,
}: {
  nowISO: string;
}) {
  const initialDate = useMemo(() => new Date(nowISO), [nowISO]);
  const [timestampInput, setTimestampInput] = useState(() =>
    Math.floor(initialDate.getTime() / 1000).toString(),
  );
  const [unitMode, setUnitMode] = useState<TimestampUnit>("auto");
  const [dateInput, setDateInput] = useState(() => formatUtcInput(initialDate));
  const { copied, copy } = useCopyFeedback();

  const timestampResult = useMemo(
    () => parseTimestamp(timestampInput, unitMode),
    [timestampInput, unitMode],
  );
  const utcDateResult = useMemo(() => parseUtcDateTime(dateInput), [dateInput]);
  const activeSummary =
    "date" in timestampResult && timestampResult.date
      ? timestampSummary(timestampResult.date)
      : null;
  const dateSummary = utcDateResult ? timestampSummary(utcDateResult) : null;

  const unitLabel =
    "unit" in timestampResult && timestampResult.unit
      ? timestampResult.unit
      : unitMode === "auto"
        ? "auto"
        : unitMode;

  function setNow() {
    const now = new Date();
    setTimestampInput(Math.floor(now.getTime() / 1000).toString());
    setUnitMode("auto");
    setDateInput(formatUtcInput(now));
  }

  function reset() {
    setTimestampInput("0");
    setUnitMode("seconds");
    setDateInput("1970-01-01T00:00:00");
  }

  return (
    <Card className="timer-result-stack flex h-full flex-col px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
      <DisplayStage className="timer-display-surface flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="timer-result-label text-xs font-extrabold uppercase tracking-widest">
          Unix timestamp converter
        </div>
        <div
          data-primary-display-value
          className="timer-result-value mt-3 max-w-full break-words font-mono text-[clamp(2rem,8vw,5.75rem)] font-extrabold leading-none text-[var(--ilt-text-primary)]"
        >
          {activeSummary ? activeSummary.iso : "Invalid timestamp"}
        </div>
        <div className="timer-result-context mt-4 max-w-4xl text-sm font-semibold text-[var(--ilt-text-secondary)] sm:text-base">
          {activeSummary
            ? `${activeSummary.utc} / Local: ${activeSummary.local}`
            : "Enter a Unix seconds, milliseconds, or microseconds value below."}
        </div>
      </DisplayStage>

      <SettingGroup
        title="Timestamp input"
        description="Convert a Unix timestamp into UTC, local, ISO, seconds, and milliseconds values."
      >
        <SettingRow className="lg:grid-cols-[minmax(0,2fr)_minmax(12rem,1fr)]">
          <Field
            label="Unix timestamp"
            value={timestampInput}
            inputMode="decimal"
            onChange={(event) => setTimestampInput(event.currentTarget.value)}
            error={"error" in timestampResult ? timestampResult.error : undefined}
            hint="Auto mode treats 10 digits as seconds and 13 digits as milliseconds."
          />
          <Select
            label="Timestamp unit"
            value={unitMode}
            onChange={(event) => setUnitMode(event.currentTarget.value as TimestampUnit)}
            hint={`Interpreting as: ${unitLabel}`}
          >
            <option value="auto">Auto-detect</option>
            <option value="seconds">Seconds</option>
            <option value="milliseconds">Milliseconds</option>
            <option value="microseconds">Microseconds</option>
          </Select>
        </SettingRow>
      </SettingGroup>

      <SettingGroup
        title="UTC date to timestamp"
        description="Enter a UTC date and time to convert it back into Unix epoch values."
      >
        <SettingRow className="lg:grid-cols-[minmax(0,2fr)_minmax(12rem,1fr)_minmax(12rem,1fr)]">
          <Field
            label="UTC date and time"
            type="datetime-local"
            step={1}
            value={dateInput}
            onChange={(event) => setDateInput(event.currentTarget.value)}
            hint="This input is interpreted as UTC, not your local timezone."
          />
          <Field
            label="Unix seconds"
            value={dateSummary?.seconds ?? "Invalid date"}
            readOnly
          />
          <Field
            label="Unix milliseconds"
            value={dateSummary?.milliseconds ?? "Invalid date"}
            readOnly
          />
        </SettingRow>
      </SettingGroup>

      <ControlGroup>
        <Btn kind="solid" onClick={setNow}>
          Set now
        </Btn>
        <Btn kind="ghost" onClick={reset}>
          Reset
        </Btn>
      </ControlGroup>

      <SecondaryActionRow>
        <Btn
          kind="ghost"
          disabled={!activeSummary}
          onClick={() => activeSummary && void copy(activeSummary.iso, "Copied ISO")}
        >
          Copy ISO
        </Btn>
        <Btn
          kind="ghost"
          disabled={!activeSummary}
          onClick={() =>
            activeSummary && void copy(activeSummary.seconds, "Copied seconds")
          }
        >
          Copy seconds
        </Btn>
        <Btn
          kind="ghost"
          disabled={!activeSummary}
          onClick={() =>
            activeSummary &&
            void copy(activeSummary.milliseconds, "Copied milliseconds")
          }
        >
          Copy milliseconds
        </Btn>
        {copied ? (
          <span className="ilt-helper-text flex items-center">{copied}</span>
        ) : null}
      </SecondaryActionRow>

      {activeSummary ? (
        <div className="grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-2 lg:grid-cols-4">
          <div className="ilt-surface-muted px-3 py-2">
            <strong className="ilt-content-strong">UTC:</strong>{" "}
            {activeSummary.utc}
          </div>
          <div className="ilt-surface-muted px-3 py-2">
            <strong className="ilt-content-strong">Local:</strong>{" "}
            {activeSummary.local}
          </div>
          <div className="ilt-surface-muted px-3 py-2">
            <strong className="ilt-content-strong">Seconds:</strong>{" "}
            {activeSummary.seconds}
          </div>
          <div className="ilt-surface-muted px-3 py-2">
            <strong className="ilt-content-strong">Milliseconds:</strong>{" "}
            {activeSummary.milliseconds}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

export default function UnixTimestampConverterPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Unix Timestamp Converter",
        url: ROUTE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        dateModified: REVIEW_DATE.iso,
        description:
          "Convert Unix timestamps between seconds, milliseconds, UTC, local time, and ISO date strings.",
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
            name: "Unix Timestamp Converter",
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
        display={<UnixTimestampConverterTool nowISO={nowISO} />}
        title="Unix Timestamp Converter"
        description="Convert Unix timestamps to readable UTC and local dates, then convert UTC date inputs back into Unix seconds and milliseconds."
      />

      <SeoBand>
        <ContentSection title="How this Unix timestamp converter works">
          <p>
            A Unix timestamp counts time from the Unix epoch: 1970-01-01
            00:00:00 UTC. Enter a timestamp and the converter shows the UTC
            date, your local date, an ISO string, Unix seconds, and Unix
            milliseconds.
          </p>
          <p>
            Auto-detect mode treats short 10-digit values as seconds and common
            13-digit values as milliseconds. You can also choose seconds,
            milliseconds, or microseconds directly when a log or API tells you
            which unit it uses.
          </p>
        </ContentSection>

        <ContentSection title="Seconds, milliseconds, and JavaScript dates">
          <p>
            Unix timestamps are commonly stored in seconds, while JavaScript
            Date values use milliseconds. That difference matters: 0 seconds is
            1970-01-01 00:00:00 UTC, and 1000 milliseconds is one second after
            the epoch.
          </p>
          <p>
            Current Unix seconds often appear as 10 digits. Current Unix
            milliseconds often appear as 13 digits. If a date looks thousands
            of years away, the unit is usually the first thing to check.
          </p>
        </ContentSection>

        <ContentSection title="When to use it">
          <p>
            This converter is useful for developers, logs, APIs, databases,
            debugging, analytics exports, event records, and any system that
            stores dates as epoch values instead of readable calendar text.
          </p>
          <p>
            Use the live{" "}
            <a className="ilt-content-link" href="/epoch-unix-time-clock">
              epoch Unix time clock
            </a>{" "}
            when you need the current timestamp, the{" "}
            <a className="ilt-content-link" href="/milliseconds-converter">
              milliseconds converter
            </a>{" "}
            for unit math, or the{" "}
            <a className="ilt-content-link" href="/utc-clock">
              UTC clock
            </a>{" "}
            when you just need current Coordinated Universal Time.
          </p>
        </ContentSection>

        <ContentSection title="UTC and local time notes">
          <p>
            Unix timestamps represent an instant in time. The UTC display shows
            that instant against the shared UTC reference, while the local
            display uses your browser and device timezone settings. For
            planning across locations, use the{" "}
            <a className="ilt-content-link" href="/time-zone-converter">
              time zone converter
            </a>
            .
          </p>
          <p>
            This page uses browser Date behavior. It does not sync to an
            external time authority, and unusual historical timezone rules can
            depend on the timezone data available to your device.
          </p>
        </ContentSection>

        <ToolTrustNote reviewDate={REVIEW_DATE}>
          <p>
            Seconds, milliseconds, and microseconds are distinct units. In Auto
            mode this converter detects the unit from the number of digits;
            choose a unit directly when the source system documents one.
          </p>
          <p>
            Results depend on the value entered. The current-time example is
            seeded from the device's system clock, and the converter checks
            whether a value can be converted by the browser, not whether an
            arbitrary timestamp has real-world meaning for a particular event.
          </p>
        </ToolTrustNote>

        <ContentSection title="Unix timestamp converter FAQ">
          <h3>Is a Unix timestamp in seconds or milliseconds?</h3>
          <p>
            Both are common. Unix timestamps are often seconds, while
            JavaScript Date values are milliseconds. The converter shows both
            so you can copy the value your system expects.
          </p>
          <h3>Why does the local time differ from UTC?</h3>
          <p>
            UTC is the shared reference time. Local time applies your current
            timezone offset and daylight saving rules to the same timestamp.
          </p>
          <h3>Can I use this for time math?</h3>
          <p>
            Use this page to convert timestamps. For adding or subtracting
            durations, the{" "}
            <a className="ilt-content-link" href="/time-calculator">
              time calculator
            </a>{" "}
            is usually a better fit.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}
