import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchStatisticList } from "../api";
import type { CmsStatistic, CmsStatisticStatus } from "../types";

/**
 * Fetches the Statistics list (optionally filtered by status), for
 * `StatisticsPage`. Same shape as `features/cms/features/hooks/useFeatures`.
 *
 * `setStatistics` is exposed (unlike a plain `refetch`-only hook)
 * because `StatisticsPage` needs to update the visible order
 * optimistically during drag-reorder — `PATCH /statistics/reorder`
 * returns void, so there's no response body to reconcile the list
 * against, and a full `refetch()` on every drag would be a visible
 * flash for no benefit.
 */
export interface UseStatisticsResult {
  statistics: CmsStatistic[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setStatistics: Dispatch<SetStateAction<CmsStatistic[]>>;
}

export function useStatistics(status?: CmsStatisticStatus): UseStatisticsResult {
  const [statistics, setStatistics] = useState<CmsStatistic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchStatisticList(status)
      .then((list) => {
        if (!cancelled) setStatistics(list);
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
  }, [status, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  return { statistics, isLoading, error, refetch, setStatistics };
}
