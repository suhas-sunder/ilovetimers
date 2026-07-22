import type { Route } from "./+types/guides.daylight-saving-time-zone-conversions";
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

const GUIDE = GUIDES[4];

const SOURCES = [
  {
    title: "ECMAScript Internationalization API specification",
    href: "https://tc39.es/ecma402/#sec-iana-time-zone-database",
    note: "requires time-zone-aware implementations to use IANA time zone identifiers and data, while noting that data can vary and is updated over time",
  },
  {
    title: "IANA Time Zone Database",
    href: "https://www.iana.org/time-zones",
    note: "is the source database for named zones and their historical and current civil-time rules",
  },
  {
    title: "TC39 Temporal documentation: time zones and ambiguity",
    href: "https://tc39.es/proposal-temporal/docs/timezone.html",
    note: "illustrates repeated fall-back times and skipped spring-forward times and explains why local wall time may map to two instants or none",
  },
] as const;

export function meta({}: Route.MetaArgs) {
  return guideMeta(GUIDE);
}

export default function DaylightSavingTimezoneGuide() {
  return (
    <GuidePage
      guide={GUIDE}
      relatedPaths={[
        "/guides/unix-timestamps-seconds-milliseconds-microseconds",
        "/guides/how-browser-timers-measure-time",
      ]}
    >
      <p>
        <strong>Short answer:</strong> a named timezone is a set of date-specific
        civil-time rules, not one permanent UTC offset. When clocks move forward,
        some local wall times never occur. When clocks move backward, some wall
        times occur twice with different offsets. A converter must detect that
        missing or duplicate mapping instead of assuming one answer always exists.
      </p>
      <p>
        iLoveTimers resolves the entered source date and time against the
        browser's IANA timezone data. It reports a nonexistent spring-forward
        time as invalid and, for a repeated fall-back time, exposes the ambiguity
        and chooses the earlier matching instant for the conversion preview.
      </p>

      <GuideSection title="An instant and a wall time are not the same thing">
        <p>
          An instant is one point on the UTC timeline. A wall time is a set of
          calendar and clock fields such as 2026-11-01 at 01:30 in
          America/New_York. To turn those fields into an instant, software needs
          the timezone's offset on that specific date. Near an offset transition,
          the mapping stops being one-to-one.
        </p>
        <p>
          Converting an existing Unix timestamp is simpler because the instant is
          already known. Formatting it in a named timezone yields one local
          representation for that instant. The hard direction is taking local
          fields plus a zone and deciding which instant they meant.
        </p>
      </GuideSection>

      <GuideSection title="Spring-forward gaps: a local time that never happened">
        <p>
          In many locations, a spring transition advances the clock by one hour.
          A clock can jump from 01:59:59 to 03:00:00. Local times from 02:00
          through 02:59:59 are skipped on that date. Entering 02:30 does not name
          a real instant in that zone, even though 02:30 is valid on ordinary
          dates.
        </p>
        <p>
          Some programming environments silently move a skipped time forward or
          backward. That can conceal a scheduling mistake. The iLoveTimers
          timezone converter's wall-time resolver instead looks for an instant
          that formats back to every requested field. If it finds no match, the
          status is <code>nonexistent</code> and the interface asks for another
          local time.
        </p>
      </GuideSection>

      <GuideSection title="Fall-back repeats: one wall time, two instants">
        <p>
          When clocks move backward, part of the local clock repeats. A time such
          as 01:30 can first occur under the earlier daylight offset and then
          occur again under the later standard offset. The two instants are often
          one hour apart even though their local date, hour, and minute labels are
          identical.
        </p>
        <p>
          The production resolver probes the browser-supported zone around the
          requested wall time, gathers candidate offsets, converts each candidate
          back through <code>Intl.DateTimeFormat</code>, and keeps exact field
          matches. Two matches produce an <code>ambiguous</code> status. The
          current converter sorts the matches and uses the earlier instant while
          showing a warning that the local time occurs twice. This policy is
          explicit; another calendar system may choose the later occurrence.
        </p>
      </GuideSection>

      <GuideSection title="Why a city name is better than a fixed offset for future plans">
        <p>
          <code>America/New_York</code> carries date-dependent transition rules.
          A fixed offset such as UTC-05:00 does not become UTC-04:00 in summer.
          For a meeting scheduled months ahead, storing only the current numeric
          offset can produce the wrong local hour after a transition.
        </p>
        <p>
          The{" "}
          <Link to="/time-zone-meeting-planner" className={guideLinkClass}>
            timezone meeting planner
          </Link>{" "}
          calculates each selected city's display for the chosen date. The{" "}
          <Link to="/time-zone-converter" className={guideLinkClass}>
            timezone converter
          </Link>{" "}
          likewise uses the selected source date when resolving the source wall
          time and formatting destinations. This is why changing only the date
          can change the displayed offset difference.
        </p>
      </GuideSection>

      <GuideSection title="Timezone abbreviations are display labels, not identifiers">
        <p>
          Abbreviations such as CST, IST, and BST can refer to different regions
          or meanings. A short label also does not preserve the transition rules
          needed for a future date. iLoveTimers uses browser-supported IANA names
          such as <code>America/Chicago</code>, <code>Asia/Kolkata</code>, and
          <code>Europe/London</code> as the actual selection. An abbreviation may
          appear in formatted output for readability, but it is not the source
          zone identifier.
        </p>
      </GuideSection>

      <GuideSection title="What browser timezone data can and cannot guarantee">
        <ul className={guideListClass}>
          <li className={guideListItemClass}>
            ECMA-402 requires time-zone-aware JavaScript implementations to use
            IANA timezone data for named identifiers.
          </li>
          <li className={guideListItemClass}>
            IANA data changes when governments change civil-time rules, and
            browsers or operating systems may ship different database versions.
          </li>
          <li className={guideListItemClass}>
            Historical coverage and localized display names can vary across
            implementations.
          </li>
          <li className={guideListItemClass}>
            A timezone converter cannot determine which repeated occurrence a
            person intended unless the user or application supplies a policy or
            offset.
          </li>
          <li className={guideListItemClass}>
            A correct timezone conversion does not correct an inaccurate device
            clock when the input is “now.”
          </li>
        </ul>
      </GuideSection>

      <GuideSection title="A practical conversion checklist">
        <ol className="space-y-2 pl-5">
          <li className="list-decimal">
            Select a named IANA timezone, not only a short abbreviation.
          </li>
          <li className="list-decimal">
            Include the date because offsets can change during the year.
          </li>
          <li className="list-decimal">
            Check whether the source local time is marked nonexistent or repeated.
          </li>
          <li className="list-decimal">
            For a repeated time, confirm whether the earlier or later occurrence
            is intended.
          </li>
          <li className="list-decimal">
            Recheck important future events after civil-time rules or device
            timezone data have been updated.
          </li>
          <li className="list-decimal">
            Include an explicit UTC offset or UTC instant when handing an
            ambiguous appointment to another system.
          </li>
        </ol>
      </GuideSection>

      <SourceList sources={SOURCES} />
    </GuidePage>
  );
}
