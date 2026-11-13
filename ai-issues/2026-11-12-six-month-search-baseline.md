# iLoveTimers — Six-month Google and Bing search baseline
Date assessed: 2026-11-12 (America/Toronto)
Status: USER-SUPPLIED EXPORT ANALYSIS; source baseline for Codex diagnostic audit; not a live Google/Bing connection.
Branch: release/2026-W46-diagnostic-audit-plan

## Sources, scope and safe interpretation
- Google Search Console export archive: ilovetimers.com-Performance-on-Search-2026-11-12.zip; files Chart.csv, Queries.csv, Pages.csv, Countries.csv, Devices.csv, Search appearance.csv, Filters.csv. Filter: Web (text-based), Last 6 months. Daily chart May 11–Nov 10, 2026, inclusive (184 days).
- Bing Webmaster export: ilovetimers.com_SearchPerformanceOverview_All_11_13_2026.csv; May 13–Nov 10, 2026 inclusive (182 days).
- No Bing query, landing-page, country or device split was provided. Do not project GSC page winners onto Bing as facts. Search clicks are not equivalent to sessions, distinct users, retention, revenue or ad impressions.
- GSC property-level daily, country and device totals agree: 14,038 clicks / 730,505 impressions. The GSC page-grouped table sums to 14,162 clicks / 743,746 impressions; differences can arise from property-versus-page aggregation and are not proof of data corruption. All page figures below use page-grouped data. Do not add page-grouped totals to daily totals.
- GSC Queries.csv has exactly 1,000 rows and covers 7,074 clicks / 320,544 impressions, not the complete query universe. Long-tail/anonymized queries are missing from the query listing. Google documentation: https://support.google.com/webmasters/answer/7576553 and https://support.google.com/webmasters/answer/17010575
- November and May monthly rows are partial; comparisons must use equal day counts.

## Headline figures
| Measure | Google | Bing |
|---|---:|---:|
| Date window | May 11–Nov 10 | May 13–Nov 10 |
| Search clicks | 14,038 | 17,644 |
| Search impressions | 730,505 | 698,103 |
| Aggregate CTR | 1.92% | 2.53% |
| Latest 28 days (Oct 14–Nov 10) clicks | 3,728 | 2,878 |
| Prior 28 days (Sep 16–Oct 13) clicks | 3,507 | 2,437 |
| Latest vs prior 28 days, clicks | +6.30% | +18.10% |
| Latest vs prior 28 days, impressions | -22.88% | +57.43% |
| Latest vs prior 28 days, CTR | 2.76% vs 2.00% | 2.38% vs 3.17% |

October complete month: Google 3,746 clicks / 134,965 impressions / 2.78% CTR; Bing 2,885 clicks / 97,585 impressions / 2.96% CTR.
November first ten days: Google 1,475 clicks / 53,334 impressions; Bing 1,128 clicks / 59,211 impressions. The ten-day rate is not a forecast.

## Monthly totals
| Month | Google clicks | Google impressions | Bing clicks | Bing impressions |
|---|---:|---:|---:|---:|
| May (partial) | 208 | 16,855 | 1,439 | 73,524 |
| Jun | 539 | 44,327 | 3,848 | 174,376 |
| Jul | 1,666 | 116,177 | 3,369 | 127,186 |
| Aug | 2,555 | 153,006 | 2,493 | 83,542 |
| Sep | 3,849 | 211,841 | 2,482 | 82,679 |
| Oct | 3,746 | 134,965 | 2,885 | 97,585 |
| Nov (1–10) | 1,475 | 53,334 | 1,128 | 59,211 |

A notable Google impression spike appears Sep 16–18: 15,280, 32,136 and 18,327 impressions respectively, with 178, 197 and 181 clicks, followed by lower impressions. Do not infer a search penalty, core-update cause or site malfunction from aggregate clicks/impressions without a date-scoped Query+Page comparison. October clicks are close to September despite the higher September impression baseline.

## GSC landing-page priorities (six-month aggregated; URL variants combined for *diagnostic prioritization only*)
| Normalized path | Clicks | Impressions | CTR | Position (approx. impression-weighted) | Variants |
|---|---:|---:|---:|---:|---:|
| /millisecond-timer | 7,186 | 73,345 | 9.80% | 5.2 | 2 |
| /analog-clock | 1,790 | 83,126 | 2.15% | 10.6 | 2 |
| /clock-with-milliseconds | 533 | 43,195 | 1.23% | 8.1 | 2 |
| / (homepage) | 504 | 6,299 | 8.00% | 10.4 | 1 |
| /atomic-clock | 449 | 40,753 | 1.10% | 7.7 | 1 |
| /seconds-timer | 418 | 8,593 | 4.86% | 9.1 | 2 |
| /utc-clock | 389 | 81,405 | 0.48% | 11.9 | 2 |
| /online-alarm-clock | 364 | 22,346 | 1.63% | 14.7 | 2 |
| /12-hour-clock | 282 | 20,064 | 1.41% | 9.2 | 2 |
| /chaos-timer | 211 | 5,323 | 3.96% | 8.1 | 2 |
| /birthday-countdown | 122 | 19,649 | 0.62% | 13.9 | 2 |
| /date-duration-calculator | 24 | 45,381 | 0.05% | 12.0 | 2 |
| /weeks-between-dates-calculator | 18 | 63,244 | 0.03% | 14.4 | 2 |
| /milliseconds-converter | 15 | 62,024 | 0.02% | 13.0 | 2 |

The first two normalized paths total 8,976 page-grouped clicks (about 63.9% of property-level chart clicks; cross-grain comparison is directional only). Millisecond Timer alone contributes about half of recorded chart clicks. Protect those two tools and the homepage from speculative redesign, title changes, canonical rewrites, timing changes and large content revisions. Clock With Milliseconds, UTC Clock, Atomic Clock and Seconds Timer also demand heightened regression coverage. The noindex/indexability status of Atomic Clock or other pages must be verified against the current repo and live response; historical search impressions do not authorize reversing route-architecture decisions.

## Queries: user jobs and validation targets
- Millisecond countdown is the strongest demonstrated job. Top queries: "timer with milliseconds" 725 clicks / 3,911 impressions / 18.54% CTR / position 3.53; "millisecond timer" 710 / 4,145 / 17.13% / 3.44; "1 millisecond timer" 250 / 1,142 / 21.89% / 3.51.
- Clock with milliseconds: "clock with milliseconds" 88 / 10,144 / 0.87% / 7.52; "time with milliseconds" 28 / 8,352 / 0.34% / 7.07. Validate query intent and SERP result types before proposing snippets or functionality; do not promise atomic or NTP accuracy.
- UTC: "utc time now" 10 / 21,777 / 0.05% / 10.02; "current utc time" 0 / 5,953 / 0% / 10.11. A low CTR with broad informational queries does not establish a page defect.
- Date calculators: "date duration calculator" 7 / 19,602 / 0.04% / 9.37; "weeks between dates" 0 / 4,280 / 0% / 10.87. Investigate SERP intent and rank/answer boxes, not bulk SEO copy.
- Alarm clock: "online alarm clock" 228 / 6,876 / 3.32% / 12.02. Test actual browser-alert reliability and provide truthful device-sleep/background limits.

## Geography and devices (property-level)
- US 5,558 clicks; UK 873; Canada 687; Australia 600 = 7,718 clicks, 55.0% of Google property clicks. Do not treat country targeting as grounds for doorway pages.
- Google desktop 7,718 clicks / 463,961 impressions / 1.66% CTR / position 15.28; mobile 5,694 / 255,080 / 2.23% / 8.86; tablet 626 / 11,464 / 5.46% / 8.76.
- Desktop is 55% of Google clicks, mobile is 40.6%. Preserve both desktop big-display workflows and touch-first mobile operation; test 320–1920 widths, portrait/landscape and zoom. These aggregates do not tell us device-specific engagement quality.

## Canonical variants: investigate, do not flip globally
- GSC Pages.csv includes 230 page rows, normalized to 138 distinct slash-insensitive URL strings; 92 normalized strings have both trailing and non-trailing variants in the six-month export. This includes historical / redirected paths and cannot be treated as 138 current canonical routes.
- Millisecond Timer: slash URL 5,219 clicks, non-slash 1,967. Analog Clock: 922 vs 868. Clock with Milliseconds: 411 vs 122. UTC Clock: 290 vs 99.
- Existing source on main uses non-trailing self-canonicals and sitemap entries, while Netlify pretty URL behavior redirects some path forms to trailing-slash. Verify live HTTP status chain, final location, emitted canonical (server HTML and hydrated DOM), GSC selected canonical and actual indexability per important path before proposing a single-site migration.
- Google recommends consistent redirects, canonical tags and sitemap references: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- No sitewide slash redirect, canonical policy switch, sitemap revision, legacy 301 removal or GSC removal action is approved by this dossier.

## Release decisions implied by the evidence
1. Diagnostic first: all actual canonical routes, redirects, mobile/desktop behavior, timers, calculators, accessibility, ads, privacy and technical SEO. Prioritize protected winners but do not stop at a representative sample.
2. Fix verified P0/P1 logic/security/accessibility issues in isolated small commits on a release branch. Where fixing a top performer would change behavior, supply independent regression evidence and require owner review.
3. Preserve the strict ad placeholder safety directive in ai-issues/AD-PLACEHOLDER-SAFETY.md.
4. Release new indexable pages only when they solve demonstrably distinct jobs; a weekly calendar is an upper bound, not a quota. Minor non-content fixes can be approved off-cycle. Do not treat a weekly release cadence as protection from Google scaled-content abuse.
5. Stage all work on release branches; do not write to main or deploy without explicit owner approval. No paid service changes.

## Cross-check references
- Existing audit and backlog: ai-issues/2026-10-14-independent-ux-seo-retention-backlog.md
- Ad safeguard: ai-issues/AD-PLACEHOLDER-SAFETY.md
- Existing route audit: docs/route-architecture-manifest.json
- Search guidelines: https://developers.google.com/search/docs/fundamentals/creating-helpful-content and https://developers.google.com/search/docs/essentials/spam-policies
