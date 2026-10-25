import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchAchievements } from "./api";
import type { Achievements } from "./types";

/**
 * TanStack Query key for the Achievements resource. Exported so other
 * layers can reference the exact same key without re-typing the literal.
 */
export const achievementsQueryKey = ["achievements"] as const;

/**
 * Fetches the backend's Achievements content module
 * (`GET /achievements`). Errors surface as the normalized `ApiError`
 * from `@/shared/api` (§14, §18).
 */
export function useAchievements(): UseQueryResult<Achievements> {
  return useQuery({
    queryKey: achievementsQueryKey,
    queryFn: fetchAchievements,
  });
}
