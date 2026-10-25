/**
 * Persian (fa-IR) date/time formatting helpers, shared across the admin.
 *
 * Uses the platform `Intl` API with the `fa-IR` locale — no date library
 * dependency. Moved up from `features/cms/dashboard/` once the Audit Log
 * page (a second consumer) needed the same formatting.
 */
import { toPersianDigits } from "./toPersianDigits";

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("fa-IR", {
  hour: "2-digit",
  minute: "2-digit",
});

/** Long date for a greeting strip / list, e.g. «۱۴۰۵ مهر ۱۷». */
export function formatLongDate(date: Date = new Date()): string {
  return dateFormatter.format(date);
}

/**
 * Short relative time for activity rows: «چند لحظه پیش», «۵ دقیقه پیش»,
 * «۳ ساعت پیش», «۲ روز پیش», falling back to a plain date beyond a week.
 */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const diffSeconds = Math.round((Date.now() - then) / 1000);
  if (diffSeconds < 60) return "چند لحظه پیش";

  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `${toPersianDigits(diffMinutes)} دقیقه پیش`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${toPersianDigits(diffHours)} ساعت پیش`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${toPersianDigits(diffDays)} روز پیش`;

  return dateFormatter.format(new Date(then));
}

/** Full timestamp for a `<time>` tooltip, e.g. «۱۴۰۵ مهر ۱۷، ۱۴:۳۰». */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${dateFormatter.format(date)}، ${timeFormatter.format(date)}`;
}
