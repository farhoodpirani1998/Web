/**
 * Application-wide runtime configuration.
 *
 * Per Website Frontend Architecture §20/§35, no CMS content, business
 * rule, or backend-owned value is ever hardcoded here — only frontend
 * mechanics (app metadata, cache defaults, feature flags). Locale data
 * is owned by `src/i18n` instead, since it is i18n domain data, not
 * generic app config.
 */

export const APP_NAME = "گروه آموزشی ندای حقیقت";

/**
 * English legal/brand name — used only where an English name is
 * actually required (Footer, English-locale SEO metadata). Never
 * rendered in primary chrome (Header, etc.) — see APP_NAME above,
 * which is the Persian-first brand identity per the Jul 2026 brand
 * review.
 */
export const APP_NAME_EN = "Nedaye Haghighat Educational Group";

/**
 * Default TanStack Query cache/stale-time settings (§15).
 * Generous defaults are intentional: the backend already designs around
 * event-driven cache invalidation, so the frontend does not need to poll
 * or refetch aggressively. Individual queries may override these once
 * feature-level data hooks exist (out of scope for Phase 1).
 */
export const QUERY_DEFAULTS = {
  staleTimeMs: 5 * 60 * 1000, // 5 minutes
  gcTimeMs: 30 * 60 * 1000, // 30 minutes
  retry: 1,
  refetchOnWindowFocus: false,
} as const;

/**
 * Frontend feature flags.
 *
 * Empty in Phase 1 — no feature is conditionally gated yet. Flags go
 * here (not scattered per-feature) once the first one is needed, so
 * every runtime toggle stays discoverable in one place.
 */
export const FEATURE_FLAGS = {} as const;
