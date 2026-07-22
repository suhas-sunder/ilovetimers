// app/routes/unix-timestamp-converter.tsx
import type { Route } from "./+types/unix-timestamp-converter";
import { data as json } from "react-router";
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
import {
  TechnicalMethod,
  ToolTrustNote,
} from "~/clients/components/trust/ToolTrust";
import { TECHNICAL_SOURCES } from "~/clients/config/technicalSources";
import {
  parseUnixTimestamp,
  parseUtcDateTime,
} from "~/clients/lib/technicalTimeMath.js";

type TimestampUnit = "auto" | "seconds" | "milliseconds" | "microseconds";

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_PATH = "/unix-timestamp-converter";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const REVIEW_DATE = { iso: "2026-07-18", label: "July 18, 2026" } as const;

export function meta({}: Route.MetaArgs) {
  const title = "Unix Timestamp Converter | Seconds, Milliseconds and Dates";
  const description =
    "Convert Unix timestamps to readable dates, including seconds, milliseconds, and supported microseconds, or convert a UTC date back to epoch values.";

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
    () => parseUnixTimestamp(timestampInput, unitMode),
    [timestampInput, unitMode],
  );
  const utcDateResult = useMemo(() => parseUtcDateTime(dateInput), [dateInput]);
  const activeSummary =
    timestampResult.ok && timestampResult.date instanceof Date
      ? timestampSummary(timestampResult.date)
      : null;
  const dateSummary = utcDateResult ? timestampSummary(utcDateResult) : null;

  const unitLabel =
    timestampResult.ok
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
            error={!timestampResult.ok ? timestampResult.error : undefined}
            hint={
              timestampResult.ok && timestampResult.truncated
                ? "Sub-millisecond digits were truncated for the browser Date result."
                : "Auto mode uses the integer digit count. The selected interpretation is shown beside this field."
            }
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
          "Convert Unix timestamps supplied in seconds, milliseconds, or microseconds to UTC, local time, and ISO output, and convert UTC dates back to epoch values.",
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
        description="Convert Unix timestamps in seconds, milliseconds, or microseconds to readable UTC and local dates, then convert UTC date inputs back to epoch values."
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
            Auto-detect mode uses the number of digits before the decimal point.
            It treats 0 to 11 digits as seconds, 12 to 14 digits as
            milliseconds, and 15 or more digits as microseconds. A leading sign
            does not count. The unit selector always shows the interpretation,
            and you can override it.
          </p>
          <p>
            For equivalent examples, unit-error symptoms, and the limits of
            digit-count inference, read the guide to{" "}
            <a
              className="ilt-content-link"
              href="/guides/unix-timestamps-seconds-milliseconds-microseconds"
            >
              Unix timestamps in seconds, milliseconds, and microseconds
            </a>
            .
          </p>
        </ContentSection>

        <TechnicalMethod
          heading="Conversion method and worked examples"
          sources={[
            TECHNICAL_SOURCES.openGroupEpoch,
            TECHNICAL_SOURCES.ecmaDate,
          ]}
        >
          <p>
            Unix time counts seconds from 1970-01-01 00:00:00 UTC. The
            converter normalizes each input to milliseconds because the
            browser's Date object uses milliseconds. Seconds are multiplied by
            1,000. Microseconds are divided by 1,000. Any fraction smaller than
            one millisecond is truncated. Negative values represent instants
            before the epoch.
          </p>
          <p>
            Example: <strong>1,700,000,000 seconds</strong> becomes{" "}
            <strong>1,700,000,000,000 milliseconds</strong>, which is{" "}
            <strong>2023-11-14 22:13:20 UTC</strong>. The same instant is shown
            in your device's local time below the UTC result. As another
            boundary example, auto mode reads <strong>99999999999</strong> as
            seconds and <strong>100000000000</strong> as milliseconds.
          </p>
          <p>
            The UTC date field accepts a real calendar date with hours, minutes,
            and optional seconds. It rejects impossible dates such as February
            31. The browser limits the supported range, so values outside the
            Date range return an error.
          </p>
        </TechnicalMethod>

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
            A timestamp identifies an instant. It does not contain a timezone.
            UTC and local output are two displays of that same instant. Choose
            a unit directly when the source system documents one because digit
            detection can be ambiguous for old, future, or unusually scaled
            values.
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
