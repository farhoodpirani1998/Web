/**
 * Dedicated override of the global 'default' throttler (see
 * app.module.ts's `ThrottlerModule.forRoot`) for the public content API.
 * Applied via `@Throttle(PUBLIC_THROTTLE)` on each public-api controller.
 *
 * Tighter than the app-wide 300/60s floor: these routes are entirely
 * unauthenticated and world-reachable, so they're the most exposed
 * surface in the app to scraping/DoS-style traffic. A real page view
 * against this API is a handful of parallel GETs (hero, nav, settings,
 * one or two content sections) well within this limit; sustained
 * traffic above it is far more likely to be abuse than a real visitor.
 *
 * This only overrides the 'default' throttler's limit for these
 * specific controllers — it doesn't add a new named throttler, so
 * nothing changes for admin/auth routes, which keep using the
 * unmodified global 300/60s.
 */
export const PUBLIC_THROTTLE = { default: { limit: 120, ttl: 60_000 } };

/**
 * Cache-Control for public read endpoints. These are plain DB reads with
 * no per-visitor personalization, so they're safe for a browser or CDN
 * to cache briefly: `max-age=60` keeps content reasonably fresh after an
 * admin edit, `stale-while-revalidate=300` lets a cache keep serving the
 * previous response instantly while it re-fetches in the background
 * rather than every client blocking on a fresh DB read once the 60s
 * window lapses.
 */
export const PUBLIC_CACHE_CONTROL = 'public, max-age=60, stale-while-revalidate=300';
