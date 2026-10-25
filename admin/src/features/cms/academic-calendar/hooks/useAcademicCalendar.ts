import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchAcademicCalendarEntryList } from "../api";
import type {
  AcademicCalendarEntryKind,
  CmsAcademicCalendarEntry,
  CmsAcademicCalendarStatus,
} from "../types";

/**
 * Fetches the academic-calendar entry list, optionally filtered by
 * status and/or kind. Same shape as `features/cms/faq/hooks/useFaqs`.
 * `setEntries` is exposed for optimistic drag-reorder.
 */
export interface UseAcademicCalendarResult {
  entries: CmsAcademicCalendarEntry[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setEntries: Dispatch<SetStateAction<CmsAcademicCalendarEntry[]>>;
}

export function useAcademicCalendar(params?: {
  status?: CmsAcademicCalendarStatus;
  kind?: AcademicCalendarEntryKind;
}): UseAcademicCalendarResult {
  const [entries, setEntries] = useState<CmsAcademicCalendarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const status = params?.status;
  const kind = params?.kind;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchAcademicCalendarEntryList({ status, kind })
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
  }, [status, kind, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  return { entries, isLoading, error, refetch, setEntries };
}
