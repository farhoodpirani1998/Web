import type { CmsAuditLogEntry } from "./types";

/**
 * Turns a raw audit-log `action` string into a short Persian sentence.
 *
 * Shared by the Dashboard's "Recent Activity" strip and the fuller Audit
 * Log page — both render the same feed, so the wording lives in one
 * place. `action` values are the raw backend strings (a `PublishStatus`
 * value like "published"/"draft"/"archived", or a fixed literal like
 * "media_uploaded"/"settings_updated"), never a closed union — see
 * `CmsAuditLogEntry`'s own comment on why.
 */

/** Persian noun per `entityType` the backend emits; unknown types fall back to the raw string. */
const ENTITY_LABELS: Record<string, string> = {
  page: "صفحه",
  static_page: "صفحه",
  news: "خبر",
  news_article: "خبر",
  event: "رویداد",
  calendar_event: "رویداد",
  faq: "پرسش متداول",
  teacher: "استاد",
  campus: "پردیس",
  testimonial: "نظر",
  feature: "ویژگی",
  statistic: "آمار",
  about: "درباره ما",
  cta: "فراخوان اقدام",
  menu: "منو",
  portal_link: "لینک سامانه",
  hero_slide: "اسلاید هدر",
  media: "رسانه",
  site_settings: "تنظیمات سایت",
};

export function describeEntry(entry: CmsAuditLogEntry): string {
  const entityLabel = entry.entityType
    ? ENTITY_LABELS[entry.entityType] ?? entry.entityType
    : null;

  switch (entry.action) {
    case "published":
      return entityLabel ? `«${entityLabel}» منتشر شد` : "محتوا منتشر شد";
    case "draft":
      return entityLabel ? `«${entityLabel}» به پیش‌نویس بازگشت` : "محتوا به پیش‌نویس بازگشت";
    case "archived":
      return entityLabel ? `«${entityLabel}» بایگانی شد` : "محتوا بایگانی شد";
    case "media_uploaded":
      return "رسانه‌ای بارگذاری شد";
    case "settings_updated": {
      const group = entry.metadata?.group;
      return typeof group === "string"
        ? `تنظیمات سایت به‌روزرسانی شد (${group.replace(/_/g, " ")})`
        : "تنظیمات سایت به‌روزرسانی شد";
    }
    default:
      return entityLabel ? `${entityLabel}: ${entry.action}` : entry.action;
  }
}
