/**
 * Reads a positive integer from `process.env`, falling back to `fallback`
 * when unset or unparsable. Duplicated here (rather than imported from
 * `public-api/common/public-rate-limit.constants.ts`) on purpose: that
 * file is public-api's own concern, and this module doesn't otherwise
 * depend on anything under `public-api/` — same isolation principle as
 * not sharing code with `modules/website/auth/` (SMS's integration
 * point). The implementation is intentionally small enough that
 * duplicating it is cheaper than introducing a cross-module dependency
 * for it.
 *
 * Same reason as the public-api version: consumed as a `@Throttle()`
 * decorator argument, which is plain-object metadata evaluated at
 * class-definition time — before Nest's DI container (and
 * ConfigService) exists — so this reads `process.env` directly rather
 * than going through ConfigService.
 */
function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Dedicated override of the global 'default' throttler (see
 * `ThrottlerModule.forRootAsync` in app.module.ts), applied only to
 * `POST /admin/auth/login` via `@Throttle(CMS_LOGIN_THROTTLE)` on that
 * one route handler — not on the controller, so `GET /admin/auth/me`
 * and every other admin route keep using the unmodified global
 * default.
 *
 * Login is the single most attractive brute-force target in this
 * backend (a correct guess yields a valid access token outright), so
 * it gets the tightest limit in the app — tighter even than
 * `PUBLIC_FORM_THROTTLE`, since a public form submission is merely
 * annoying to have spammed while a successful login attempt is a full
 * account compromise. 5 attempts per 5 minutes per client comfortably
 * covers a real admin mistyping a password a couple of times while
 * making sustained guessing meaningfully slower than argon2id's own
 * per-attempt cost already imposes.
 *
 * `ThrottlerGuard` keys this by client IP by default (see `TRUST_PROXY`
 * in main.ts for how that IP is determined behind a proxy) — it is
 * not a per-account lockout and does not add any new column or state
 * to `CmsAdminUser`; a distributed attempt spread across many IPs is
 * not something this alone stops, only sustained single-source
 * guessing. Configurable via THROTTLE_CMS_LOGIN_TTL_MS /
 * THROTTLE_CMS_LOGIN_LIMIT (see .env.example); falls back to 5
 * attempts per 300s when either is unset.
 */
export const CMS_LOGIN_THROTTLE = {
  default: {
    limit: envInt('THROTTLE_CMS_LOGIN_LIMIT', 5),
    ttl: envInt('THROTTLE_CMS_LOGIN_TTL_MS', 300_000),
  },
};

/**
 * Applied to `POST /admin/auth/refresh` (Sprint — Persistent Login),
 * same pattern and reasoning as `CMS_LOGIN_THROTTLE` but deliberately
 * more generous: a refresh token is 256 bits of random data, not a
 * human-guessable password, so brute-forcing one isn't a realistic
 * threat this needs to slow down the way login does. The real purpose
 * here is capping the damage of a buggy/misbehaving client silently
 * retrying in a loop, not attacker resistance — hence a limit generous
 * enough that normal use (one call whenever the access token has
 * expired, or a single retry after a 401) never comes close to it.
 * Configurable via THROTTLE_CMS_REFRESH_TTL_MS / THROTTLE_CMS_REFRESH_LIMIT
 * (see .env.example); falls back to 30 attempts per 300s when either is
 * unset.
 */
export const CMS_REFRESH_THROTTLE = {
  default: {
    limit: envInt('THROTTLE_CMS_REFRESH_LIMIT', 30),
    ttl: envInt('THROTTLE_CMS_REFRESH_TTL_MS', 300_000),
  },
};
