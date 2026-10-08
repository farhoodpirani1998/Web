/**
 * Cache-key + TTL policy for the public read cache. Sits alongside
 * public-rate-limit.constants.ts (Cache-Control / throttling) as the
 * equivalent policy file for the server-side Redis cache added on top of
 * those HTTP-level protections — see core/redis/redis.service.ts for the
 * underlying get/set/delete client.
 *
 * `PUBLIC_CACHE_TTL_SECONDS` intentionally matches PUBLIC_CACHE_CONTROL's
 * `max-age=60`: a cache hit here should never make the effective public
 * cache window *longer* than what's already advertised to the browser/CDN,
 * only shield the DB from repeat reads within that same window.
 *
 * This is deliberately additive to each public-api controller's existing
 * repository-read logic (cache miss -> read the DB exactly as before, then
 * populate the cache) — no admin/content service is touched, and there's
 * no invalidation on write: entries simply expire after `PUBLIC_CACHE_TTL_SECONDS`.
 */
export const PUBLIC_CACHE_PREFIX = 'public-api';

export const PUBLIC_CACHE_TTL_SECONDS = 60;

/**
 * Joins `PUBLIC_CACHE_PREFIX` with the given parts into one cache key,
 * e.g. buildPublicCacheKey('news', 'list', category, tag, page, limit)
 * -> "public-api:news:list:sports:_:1:20". Missing/empty parts (an
 * unset `category`/`tag` query param, etc.) are normalized to `_` rather
 * than dropped, so the key shape for a given endpoint stays a fixed
 * length/position regardless of which optional params were supplied —
 * important since these are plain string keys, not a structured lookup.
 */
export function buildPublicCacheKey(
  ...parts: Array<string | number | undefined | null>
): string {
  const safeParts = parts.map((part) =>
    part === undefined || part === null || part === '' ? '_' : String(part),
  );
  return [PUBLIC_CACHE_PREFIX, ...safeParts].join(':');
}
