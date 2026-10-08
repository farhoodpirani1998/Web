import type { CookieOptions, Request } from 'express';
import type { ConfigService } from '@nestjs/config';

/**
 * Refresh-token cookie is scoped to this path only — the browser will
 * never attach it to any other request (not even other `/admin/*`
 * routes), so a CSRF or open-redirect elsewhere in the admin API can't
 * even see it. `login`, `refresh`, and `logout` are the only handlers
 * that ever need to read or set it, and all three live under this
 * exact prefix (`CmsAuthController`'s `@Controller('admin/auth')`).
 */
export const REFRESH_COOKIE_PATH = '/admin/auth';

/** "true"/"false" (case-insensitive) from an env-sourced string, or `fallback` when unset/unrecognized. */
function parseBool(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined) return fallback;
  const value = raw.trim().toLowerCase();
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

export function refreshCookieName(config: ConfigService): string {
  return config.get<string>('CMS_REFRESH_COOKIE_NAME') ?? 'cms_refresh_token';
}

export function refreshTokenTtlMs(config: ConfigService): number {
  const days = Number(config.get<string>('CMS_REFRESH_TOKEN_EXPIRES_IN_DAYS') ?? '30');
  const safeDays = Number.isFinite(days) && days > 0 ? days : 30;
  return safeDays * 24 * 60 * 60 * 1000;
}

/**
 * Cookie attributes shared by every `Set-Cookie` this module issues
 * (`login`, `refresh` rotation) — `maxAge` is passed in separately since
 * it differs slightly between a fresh login/rotation (full TTL) and
 * nothing else currently varies it.
 *
 * `secure` defaults to on in production and off otherwise (same
 * reasoning as `main.ts`'s `swaggerEnabled`: local HTTP development
 * would otherwise silently never receive the cookie back), overridable
 * via `CMS_REFRESH_COOKIE_SECURE` for deployments that terminate TLS
 * somewhere `NODE_ENV` alone can't reflect.
 *
 * `sameSite` defaults to `"lax"`, which already covers the common case
 * of an admin SPA and this API sharing a registrable domain on
 * different ports/subdomains (SameSite is site-scoped, not
 * origin-scoped). A deployment that puts them on genuinely different
 * sites needs `"none"` — which browsers additionally require `secure`
 * for — set via `CMS_REFRESH_COOKIE_SAMESITE`.
 */
export function refreshCookieOptions(config: ConfigService, maxAgeMs: number): CookieOptions {
  const isProduction = config.get<string>('NODE_ENV') === 'production';
  const sameSite =
    (config.get<string>('CMS_REFRESH_COOKIE_SAMESITE') as CookieOptions['sameSite']) ?? 'lax';

  return {
    httpOnly: true,
    secure: parseBool(config.get<string>('CMS_REFRESH_COOKIE_SECURE'), isProduction),
    sameSite,
    path: REFRESH_COOKIE_PATH,
    maxAge: maxAgeMs,
  };
}

/**
 * Manual `Cookie` header parse — this backend has no `cookie-parser`
 * middleware registered (see `main.ts`; nothing else has needed
 * `req.cookies` so far), so reading the one cookie this module cares
 * about is done directly rather than pulling in a new dependency for a
 * single call site. Not a general-purpose parser: doesn't need to be,
 * since `document.cookie`/`Set-Cookie` syntax for a single simple token
 * value has no edge cases (no `=` or `;` inside a base64url value).
 */
function parseCookieHeader(header: string | undefined): Record<string, string> {
  if (!header) return {};

  const result: Record<string, string> = {};
  for (const pair of header.split(';')) {
    const separatorIndex = pair.indexOf('=');
    if (separatorIndex === -1) continue;
    const name = pair.slice(0, separatorIndex).trim();
    const value = pair.slice(separatorIndex + 1).trim();
    if (name) result[name] = decodeURIComponent(value);
  }
  return result;
}

/** Reads the refresh-token cookie's raw value off a request, or `undefined` if absent. */
export function readRefreshCookie(request: Request, config: ConfigService): string | undefined {
  const cookies = parseCookieHeader(request.headers['cookie']);
  return cookies[refreshCookieName(config)];
}
