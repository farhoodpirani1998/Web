import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchCampusesList } from "../api";
import type { CmsCampus, CmsCampusStatus } from "../types";

/**
 * Fetches the campus list (optionally filtered by status), for
 * `CampusesPage`. Same shape as `features/cms/teachers/hooks/useTeachers`/
 * `features/cms/faq/hooks/useFaqs` — no cache is needed here the way
 * `media/useMediaById` needs one, since nothing else in this admin
 * resolves a campus by id independently of this list.
 *
 * `setCampuses` is exposed so `CampusesPage` can splice a single
 * updated campus back into the visible list after a status/schedule/
 * restore change without a full refetch flash, AND so it can update the
 * visible order optimistically during drag-reorder — `PATCH
 * /campuses/reorder` returns void (`CampusesService.reorder`), so
 * there's no response body to reconcile the list against, same
 * reasoning as `useTeachers`.
 */
export interface UseCampusesResult {
  campuses: CmsCampus[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setCampuses: Dispatch<SetStateAction<CmsCampus[]>>;
}

export function useCampuses(status?: CmsCampusStatus): UseCampusesResult {
  const [campuses, setCampuses] = useState<CmsCampus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchCampusesList(status)
      .then((list) => {
        if (!cancelled) setCampuses(list);
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

  return { campuses, isLoading, error, refetch, setCampuses };
}
