import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchHomepage } from "./api";
import type { PublicStaticPageDto } from "./types";

/**
 * TanStack Query key for the homepage's Static Pages resource.
 * Exported so other layers can reference the exact same key without
 * re-typing the literal, same convention as every other feature's
 * query key (`@/features/about`'s `aboutPageQueryKey`, etc.).
 */
export const homepageQueryKey = ["static-pages", "homepage"] as const;

/**
 * Fetches the backend's designated homepage (`GET /pages/homepage`)
 * via `./api`'s `fetchHomepage` — the raw `PublicStaticPageDto`,
 * `seo`/`structuredData` included unchanged. Backs `HomePage`'s
 * `<Seo />` rendering; `HomePage`'s own section content
 * (Hero/Stats/About/...) is unrelated and unaffected by this query.
 * Errors surface as the normalized `ApiError` from `@/shared/api`
 * (§14, §18), same as every other detail/singleton hook.
 */
export function useHomepage(): UseQueryResult<PublicStaticPageDto> {
  return useQuery({
    queryKey: homepageQueryKey,
    queryFn: fetchHomepage,
  });
}
