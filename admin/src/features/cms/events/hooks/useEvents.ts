import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchEventsList } from "../api";
import type { CmsCalendarEvent, CmsEventStatus } from "../types";

/**
 * Fetches the events list (optionally filtered by status and/or
 * category), for `EventsPage`. Same shape as
 * `features/cms/news/hooks/useNews`— no cache is needed here the way
 * `media/useMediaById` needs one, since nothing else in this admin
 * resolves an event by id independently of this list.
 *
 * `setEvents` is exposed (unlike `media/useMediaList`, which only
 * exposes `refetch`) so `EventsPage` can splice a single updated event
 * back into the visible list after a status/schedule change without a
 * full refetch flash — same reasoning as `useNews`, even though Events
 * has no drag-reorder to support optimistically.
 */
export interface UseEventsResult {
  events: CmsCalendarEvent[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setEvents: Dispatch<SetStateAction<CmsCalendarEvent[]>>;
}

export function useEvents(status?: CmsEventStatus, category?: string): UseEventsResult {
  const [events, setEvents] = useState<CmsCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchEventsList(status, category)
      .then((list) => {
        if (!cancelled) setEvents(list);
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
  }, [status, category, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  return { events, isLoading, error, refetch, setEvents };
}
