/**
 * i18n mechanics for the bilingual-ready (Persian/fa, English/en) site
 * (§28).
 *
 * This module owns the full locale *mechanism* — which locales exist,
 * which are RTL, and how to validate a locale value — plus a UI-chrome
 * translation dictionary once the first feature needing frontend-owned
 * strings is implemented. It intentionally owns the locale list itself
 * (rather than importing it from app config) because supported locales
 * are i18n domain data, not generic runtime config.
 *
 * Phase 1 scope: the site ships Persian-only, and routes are not
 * locale-prefixed (`/:locale`) — that would be unnecessary complexity
 * for a single-locale launch. `isSupportedLocale` and `getDirection`
 * are kept ready for the day a second locale (or URL-based locale
 * routing) is reintroduced, so that future work is additive, not a
 * rewrite of this module.
 */

/** Supported locales — matches the backend kernel's Locale enum (§28). */
export const SUPPORTED_LOCALES = ["fa", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const RTL_LOCALES: readonly SupportedLocale[] = ["fa"];

export function isSupportedLocale(value: string | undefined): value is SupportedLocale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function getDirection(locale: SupportedLocale): "rtl" | "ltr" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}
