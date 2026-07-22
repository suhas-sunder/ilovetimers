import type { Route } from "./+types/guides.unix-timestamps-seconds-milliseconds-microseconds";
import { Link } from "react-router";
import {
  GuidePage,
  GuideSection,
  SourceList,
  guideLinkClass,
  guideListClass,
  guideListItemClass,
  guideMeta,
} from "~/clients/components/guides/GuidePage";
import { GUIDES } from "~/clients/config/guides";

const GUIDE = GUIDES[3];

const SOURCES = [
  {
    title: "W3C High Resolution Time",
    href: "https://www.w3.org/TR/hr-time-3/",
    note: "defines an epoch timestamp representation as integral milliseconds from the Unix epoch and excludes leap seconds",
  },
  {
    title: "ECMAScript specification: Date objects",
    href: "https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date-objects",
    note: "defines ECMAScript time values and the Date range and millisecond representation used by browser Date objects",
  },
  {
    title: "MDN: Date.getTime()",
    href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime",
    note: "documents that JavaScript Date returns milliseconds since the Unix epoch",
  },
] as const;

export function meta({}: Route.MetaArgs) {
  return guideMeta(GUIDE);
}

export default function UnixTimestampUnitsGuide() {
  return (
    <GuidePage
      guide={GUIDE}
      relatedPaths={[
        "/guides/daylight-saving-time-zone-conversions",
        "/guides/how-browser-timers-measure-time",
      ]}
    >
      <p>
        <strong>Short answer:</strong> for dates near the present, a Unix
        timestamp with about 10 digits is usually seconds, 13 digits is usually
        milliseconds, and 16 digits is usually microseconds. The unit is not
        encoded in the number, however. Digit length is a useful clue, not proof.
        When the producer's documentation is available, use its declared unit.
      </p>
      <p>
        All three values can name the same instant. They differ only in scale:
        one second contains 1,000 milliseconds and 1,000,000 microseconds.
        Treating a millisecond value as seconds moves it far outside an ordinary
        date range; treating a seconds value as milliseconds puts it near
        January 1970.
      </p>

      <GuideSection title="One instant written in three units">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Equivalent Unix timestamp values in seconds, milliseconds, and microseconds
            </caption>
            <thead className="bg-[var(--ilt-bg-subtle)] text-[var(--ilt-text-primary)]">
              <tr>
                <th className="px-3 py-2 font-bold">Unit</th>
                <th className="px-3 py-2 font-bold">Example</th>
                <th className="px-3 py-2 font-bold">Scale to milliseconds</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="px-3 py-2 font-semibold">Seconds</th>
                <td className="px-3 py-2 font-mono">1700000000</td>
                <td className="px-3 py-2">Multiply by 1,000</td>
              </tr>
              <tr className="bg-[var(--ilt-bg-subtle)]/50">
                <th className="px-3 py-2 font-semibold">Milliseconds</th>
                <td className="px-3 py-2 font-mono">1700000000000</td>
                <td className="px-3 py-2">Use directly</td>
              </tr>
              <tr>
                <th className="px-3 py-2 font-semibold">Microseconds</th>
                <td className="px-3 py-2 font-mono">1700000000000000</td>
                <td className="px-3 py-2">Divide by 1,000</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          These three examples all convert to 2023-11-14T22:13:20.000Z. The
          trailing zeros in the finer units do not add information here. A real
          microsecond source could use nonzero final digits, but a browser
          <code>Date</code> cannot retain precision finer than one millisecond.
        </p>
      </GuideSection>

      <GuideSection title="What the Unix epoch means">
        <p>
          The reference instant is 1970-01-01 00:00:00 UTC. Positive values are
          after that instant; negative values are before it. Unix-style time
          representations ordinarily exclude leap seconds, so they should not be
          read as a count of every physical SI second inserted into civil
          timekeeping.
        </p>
        <p>
          A timestamp identifies an instant. It does not contain a city, local
          timezone, daylight-saving label, or human display format. Formatting
          the same instant in New York, London, Tokyo, or UTC changes the visible
          clock and date, not the underlying timestamp.
        </p>
      </GuideSection>

      <GuideSection title="How iLoveTimers detects the unit">
        <p>
          The production{" "}
          <Link to="/unix-timestamp-converter" className={guideLinkClass}>
            Unix timestamp converter
          </Link>{" "}
          offers explicit Seconds, Milliseconds, and Microseconds modes. Its Auto
          mode removes a leading sign plus commas or underscores for the digit
          check, then applies these implementation thresholds:
        </p>
        <ul className={guideListClass}>
          <li className={guideListItemClass}>
            15 or more integer digits: interpret as microseconds.
          </li>
          <li className={guideListItemClass}>
            12 to 14 integer digits: interpret as milliseconds.
          </li>
          <li className={guideListItemClass}>
            Fewer than 12 integer digits: interpret as seconds.
          </li>
        </ul>
        <p>
          The thresholds make common modern timestamps convenient, but they are
          deliberately described as inference. A far-future seconds value, an
          old short millisecond value, or an application-specific counter can be
          misclassified. Select the unit manually when you know it.
        </p>
      </GuideSection>

      <GuideSection title="How conversion and truncation work">
        <p>
          The converter normalizes the chosen input to milliseconds because the
          browser's <code>Date</code> representation uses milliseconds. Seconds
          are multiplied by 1,000. Microseconds are divided by 1,000.
          Sub-millisecond remainder is truncated, and the interface reports that
          truncation. The result is rejected if it is not numeric or falls
          outside the browser Date range protected by the implementation.
        </p>
        <p>
          For example, 1700000000000123 microseconds normalizes to
          1700000000000.123 milliseconds. The Date result retains
          1700000000000 milliseconds. The final 123 microseconds cannot be shown
          by that Date object. This is a representation limit, not evidence that
          the original source never measured those digits.
        </p>
        <p>
          The reverse form accepts a date and clock input explicitly as UTC,
          validates its calendar fields, and returns both seconds and
          milliseconds. That UTC label matters. Interpreting the same wall-clock
          fields as local time would name a different instant in most timezones.
        </p>
      </GuideSection>

      <GuideSection title="Common failure patterns">
        <ul className={guideListClass}>
          <li className={guideListItemClass}>
            <strong>A 1970 result:</strong> a seconds value was probably treated
            as milliseconds.
          </li>
          <li className={guideListItemClass}>
            <strong>An out-of-range result:</strong> a millisecond or microsecond
            value may have been treated as seconds.
          </li>
          <li className={guideListItemClass}>
            <strong>A time off by several hours:</strong> the unit may be right,
            but UTC and local wall time were confused.
          </li>
          <li className={guideListItemClass}>
            <strong>Lost final digits:</strong> microseconds were normalized to a
            millisecond Date representation.
          </li>
          <li className={guideListItemClass}>
            <strong>A plausible but wrong date:</strong> Auto mode inferred a unit
            from digit length that did not match the producing system.
          </li>
        </ul>
        <p>
          Preserve the original value while you investigate. Converting it in
          place and saving only the guessed result can erase the clue that would
          have revealed the unit. When an API or database schema names the unit,
          record that declaration beside the field instead of relying on its
          present digit length. Values grow over time, so a threshold that looks
          obvious today is not a permanent data contract.
        </p>
      </GuideSection>

      <GuideSection title="Current timestamps still depend on the device clock">
        <p>
          The{" "}
          <Link to="/epoch-unix-time-clock" className={guideLinkClass}>
            live Unix time clock
          </Link>{" "}
          reads the browser's current <code>Date</code> value and shows seconds
          and milliseconds. It does not query an external time authority. If the
          device clock is wrong, both displayed units inherit that error. Extra
          displayed digits describe the unit and update cadence, not independent
          synchronization accuracy.
        </p>
      </GuideSection>

      <SourceList sources={SOURCES} />
    </GuidePage>
  );
}
