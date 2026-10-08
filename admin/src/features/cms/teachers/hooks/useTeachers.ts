import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchTeachersList } from "../api";
import type { CmsTeacher, CmsTeacherStatus } from "../types";

/**
 * Fetches the teacher list (optionally filtered by status), for
 * `TeachersPage`. Same shape as `features/cms/faq/hooks/useFaqs`/
 * `features/cms/events/hooks/useEvents` — no cache is needed here the
 * way `media/useMediaById` needs one, since nothing else in this admin
 * resolves a teacher by id independently of this list.
 *
 * `setTeachers` is exposed so `TeachersPage` can splice a single
 * updated teacher back into the visible list after a status/schedule/
 * restore change without a full refetch flash, AND so it can update the
 * visible order optimistically during drag-reorder — `PATCH
 * /teachers/reorder` returns void (`TeachersService.reorder`), so
 * there's no response body to reconcile the list against, same
 * reasoning as `useFaqs`.
 */
export interface UseTeachersResult {
  teachers: CmsTeacher[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setTeachers: Dispatch<SetStateAction<CmsTeacher[]>>;
}

export function useTeachers(status?: CmsTeacherStatus): UseTeachersResult {
  const [teachers, setTeachers] = useState<CmsTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchTeachersList(status)
      .then((list) => {
        if (!cancelled) setTeachers(list);
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

  return { teachers, isLoading, error, refetch, setTeachers };
}
