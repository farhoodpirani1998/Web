import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchTeacherBySlug } from "./api";
import type { PublicTeacherDetailDto } from "./types";

/**
 * TanStack Query key for one Teacher's detail resource. Exported so
 * other layers can reference the exact same key without re-typing the
 * literal, same convention as `./useTeachers`'s `teachersQueryKey` and
 * `@/features/campuses`'s `campusDetailQueryKey`.
 */
export function teacherDetailQueryKey(slug: string) {
  return ["teachers", "detail", slug] as const;
}

/**
 * Fetches one teacher's full detail response (`GET /teachers/:slug`)
 * via `./api`'s `fetchTeacherBySlug` — the raw `PublicTeacherDetailDto`,
 * `seo`/`structuredData` included unchanged. Errors surface as the
 * normalized `ApiError` from `@/shared/api` (§14, §18), same as
 * `./useTeachers` and `@/features/campuses`'s `useCampusBySlug`.
 */
export function useTeacherBySlug(slug: string): UseQueryResult<PublicTeacherDetailDto> {
  return useQuery({
    queryKey: teacherDetailQueryKey(slug),
    queryFn: () => fetchTeacherBySlug(slug),
    enabled: Boolean(slug),
  });
}
