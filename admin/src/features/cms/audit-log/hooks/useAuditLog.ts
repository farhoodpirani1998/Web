import { useCallback, useEffect, useState } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchRecentActivity } from "../api";
import type { CmsAuditLogEntry } from "../types";

/**
 * Fetches the CMS activity feed for the Audit Log page, newest first.
 * Same shape as the other list hooks in this admin (`useFaqs` etc.), but
 * the feed is read-only — no `setEntries` (nothing reorders/edits it).
 */
export interface UseAuditLogResult {
  entries: CmsAuditLogEntry[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

export function useAuditLog(limit?: number): UseAuditLogResult {
  const [entries, setEntries] = useState<CmsAuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchRecentActivity(limit)
      .then((list) => {
        if (!cancelled) setEntries(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err as ApiError);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [limit, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  return { entries, isLoading, error, refetch };
}
