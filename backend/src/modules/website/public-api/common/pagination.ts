const MAX_LIMIT = 100;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Clamps already-parsed `page`/`limit` values into a safe range: page
 * >= 1, 1 <= limit <= 100. The 100 cap matters here specifically because
 * these are unauthenticated, world-reachable endpoints (see
 * public-rate-limit.constants.ts) — an unbounded `limit` would let a
 * single request force an arbitrarily large query/response.
 *
 * Controllers get numeric `page`/`limit` via Nest's own
 * `@Query('page', new DefaultValuePipe(1), ParseIntPipe)` — a 400 for
 * non-numeric input, this function's job is only the range clamp
 * ParseIntPipe doesn't do. Deliberately not a class-validator DTO:
 * these controllers also take other individual `@Query('x')` params
 * (category, tag, ...), and combining everything into one `@Query() dto`
 * object would collide with the app's global `forbidNonWhitelisted`
 * pipe, which validates the *whole* query string against that one DTO's
 * shape and would reject the controller's other params as "unknown".
 */
export function clampPagination(page: number, limit: number): { page: number; limit: number } {
  return {
    page: Math.max(1, page),
    limit: Math.min(Math.max(1, limit), MAX_LIMIT),
  };
}

export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
