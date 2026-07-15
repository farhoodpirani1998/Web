import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchEvents } from "./api";
import type { Event } from "./types";

/**
 * TanStack Query key for the Events resource. Exported so other
 * layers can reference the exact same key without re-typing the
 * literal.
 */
export const eventsQueryKey = ["events"] as const;

/**
 * Fetches the backend's Events content module (`GET /events`). Errors
 * surface as the normalized `ApiError` from `@/shared/api` (§14, §18)
 * — callers branch on `error.kind` rather than parsing raw HTTP status
 * codes.
 */
export function useEvents(): UseQueryResult<readonly Event[]> {
  return useQuery({
    queryKey: eventsQueryKey,
    queryFn: fetchEvents,
  });
}
