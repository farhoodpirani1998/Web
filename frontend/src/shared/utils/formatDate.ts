/**
 * Formats an ISO date string (or `Date`) from the Public API into the
 * site's Persian (Jalali) calendar display format, e.g. "۱۴۰۴/۰۴/۰۱" —
 * matching the format already used by every feature's placeholder
 * `data.ts` (`news`, and previously `events`).
 *
 * Uses the platform's built-in `Intl.DateTimeFormat` with the
 * `persian` calendar rather than adding a Jalali-conversion library or
 * hand-rolled algorithm: no such utility exists yet in `shared/utils`,
 * and this is the smallest correct addition per the CMS Integration
 * Audit's "add the smallest shared formatter needed" guidance.
 *
 * Returns an empty string for a missing/unparsable value — callers
 * that require a non-optional `string` field (e.g. `NewsItem.date`)
 * can use this directly without an extra fallback.
 */
export function formatPersianDate(value: string | Date | null | undefined): string {
  if (!value) return "";

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Formats an ISO datetime string (or `Date`) from the Public API into
 * a Persian-digit `HH:mm` clock time, e.g. "۰۹:۰۰" — the sibling of
 * `formatPersianDate` for fields (like `events`'s `startAt`/`endAt`)
 * that need a time-of-day display, not just a calendar date.
 *
 * Same "smallest shared formatter needed" reasoning as
 * `formatPersianDate`: uses the platform's built-in
 * `Intl.DateTimeFormat`, returns an empty string for a
 * missing/unparsable value so callers can fall back without an extra
 * null check.
 */
export function formatPersianTime(value: string | Date | null | undefined): string {
  if (!value) return "";

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}
