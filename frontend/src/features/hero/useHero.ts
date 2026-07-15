import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchHero } from "./api";
import type { Hero } from "./types";

/**
 * TanStack Query key for the Hero resource. Exported so other layers
 * can reference the exact same key without re-typing the literal.
 */
export const heroQueryKey = ["hero"] as const;

/**
 * Fetches the backend's Hero content module (`GET /hero`). Errors
 * surface as the normalized `ApiError` from `@/shared/api` (§14, §18).
 *
 * Data-fetching only: `./Hero.tsx` still renders its own placeholder
 * copy (§ "no UI changes, no mock-data replacement yet").
 */
export function useHero(): UseQueryResult<Hero> {
  return useQuery({
    queryKey: heroQueryKey,
    queryFn: fetchHero,
  });
}
