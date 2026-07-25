import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchStaticPageBySlug } from "./api";
import type { PublicStaticPageDto } from "./types";

/**
 * TanStack Query key for one Static Page's detail resource. Exported
 * so other layers can reference the exact same key without re-typing
 * the literal, same convention as `@/features/campuses`'s
 * `campusDetailQueryKey`/`@/features/teachers`'s
 * `teacherDetailQueryKey`.
 */
export function staticPageDetailQueryKey(slug: string) {
  return ["static-pages", "detail", slug] as const;
}

/**
 * Fetches one static page's full detail response
 * (`GET /pages/:slug`) via `./api`'s `fetchStaticPageBySlug` — the
 * raw `PublicStaticPageDto`, `seo`/`structuredData` included
 * unchanged. Errors surface as the normalized `ApiError` from
 * `@/shared/api` (§14, §18), same as every other detail hook
 * (`@/features/news`'s `useNewsBySlug`, etc.).
 */
export function useStaticPageBySlug(slug: string): UseQueryResult<PublicStaticPageDto> {
  return useQuery({
    queryKey: staticPageDetailQueryKey(slug),
    queryFn: () => fetchStaticPageBySlug(slug),
    enabled: Boolean(slug),
  });
}
