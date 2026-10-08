import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchTeachers } from "./api";
import type { Teacher } from "./types";

/**
 * TanStack Query key for the Teachers resource. Exported so other
 * layers can reference the exact same key without re-typing the
 * literal.
 */
export const teachersQueryKey = ["teachers"] as const;

/**
 * Fetches the backend's Teachers content module (`GET /teachers`).
 * Errors surface as the normalized `ApiError` from `@/shared/api`
 * (§14, §18) — callers branch on `error.kind` rather than parsing raw
 * HTTP status codes.
 */
export function useTeachers(): UseQueryResult<readonly Teacher[]> {
  return useQuery({
    queryKey: teachersQueryKey,
    queryFn: fetchTeachers,
  });
}
