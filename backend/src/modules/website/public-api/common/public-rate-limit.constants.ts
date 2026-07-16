/**
 * Reads a positive integer from `process.env`, falling back to `fallback`
 * when unset or unparsable. Used (rather than ConfigService) because the
 * constants below are consumed as `@Throttle()` decorator arguments —
 * plain-object metadata evaluated at class-definition time, before
 * Nest's DI container (and ConfigService) exists. main.ts loads dotenv
 * before importing AppModule specifically so a .env-file value is
 * already in `process.env` by the time this module is first imported —
 * the same reason data-source.ts calls dotenv's `config()` directly.
 */
function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Dedicated override of the global 'default' throttler (see
 * app.module.ts's `ThrottlerModule.forRootAsync`) for the public content
 * API. Applied via `@Throttle(PUBLIC_THROTTLE)` on each public-api
 * controller.
 *
 * Tighter than the app-wide default floor: these routes are entirely
 * unauthenticated and world-reachable, so they're the most exposed
 * surface in the app to scraping/DoS-style traffic. A real page view
 * against this API is a handful of parallel GETs (hero, nav, settings,
 * one or two content sections) well within this limit; sustained
 * traffic above it is far more likely to be abuse than a real visitor.
 *
 * This only overrides the 'default' throttler's limit for these
 * specific controllers — it doesn't add a new named throttler, so
 * nothing changes for admin/auth routes, which keep using the
 * unmodified global default.
 *
 * Configurable via THROTTLE_PUBLIC_TTL_MS / THROTTLE_PUBLIC_LIMIT (see
 * .env.example); falls back to the previous hardcoded 120/60s when
 * either is unset.
 */
export const PUBLIC_THROTTLE = {
  default: {
    limit: envInt('THROTTLE_PUBLIC_LIMIT', 120),
    ttl: envInt('THROTTLE_PUBLIC_TTL_MS', 60_000),
  },
};

/**
 * Stricter than PUBLIC_THROTTLE, for any public endpoint that accepts
 * user input (a contact/inquiry form, a newsletter signup, etc) rather
 * than only serving cached reads — same override mechanism as
 * PUBLIC_THROTTLE, just a tighter limit: a submission endpoint is a far
 * more attractive target for scripted abuse (spam, mail-relay abuse,
 * brute-forced validation) than a read-only content route.
 *
 * No controller in this codebase currently accepts public user input,
 * so nothing applies this yet — it's configured and ready for the first
 * one that does, the same way `@Throttle(PUBLIC_THROTTLE)` is applied
 * above: `@Throttle(PUBLIC_FORM_THROTTLE)` on that controller.
 *
 * Configurable via THROTTLE_PUBLIC_FORM_TTL_MS / THROTTLE_PUBLIC_FORM_LIMIT
 * (see .env.example); falls back to 5 requests per 60s when either is
 * unset.
 */
export const PUBLIC_FORM_THROTTLE = {
  default: {
    limit: envInt('THROTTLE_PUBLIC_FORM_LIMIT', 5),
    ttl: envInt('THROTTLE_PUBLIC_FORM_TTL_MS', 60_000),
  },
};

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
