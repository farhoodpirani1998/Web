import { QueryClient } from "@tanstack/react-query";

import { QUERY_DEFAULTS } from "@/shared/config/app";

/**
 * The single TanStack Query cache for the application (§15, §16).
 *
 * Generous stale/gc times are intentional: the backend already designs
 * around event-driven cache invalidation, so the frontend does not need
 * to poll or refetch aggressively (§29). Individual feature queries may
 * override these per-query once they exist — this is only the default.
 *
 * Reads only, today (§15): no mutation defaults are configured because
 * the Public API is read-only in the current scope.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_DEFAULTS.staleTimeMs,
      gcTime: QUERY_DEFAULTS.gcTimeMs,
      retry: QUERY_DEFAULTS.retry,
      refetchOnWindowFocus: QUERY_DEFAULTS.refetchOnWindowFocus,
    },
  },
});
