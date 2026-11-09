import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CmsCalendarEvent, CmsEventStatus } from "../types";
import { fetchEventsList, fetchCalendarEventById, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, updateCalendarEventStatus } from "../api";
import type { ApiError } from "@/lib/apiError";
import type { CreateCalendarEventPayload, UpdateCalendarEventPayload } from "../types";
export const eventKeys = { all: ["events"] as const, list: (s?: CmsEventStatus) => [...eventKeys.all,"list",s??"all"] as const, detail: (id:string)=>[...eventKeys.all,"detail",id] as const };
export function useEventList(s?: CmsEventStatus) { const qc = useQueryClient(); const q = useQuery({ queryKey: eventKeys.list(s), queryFn: () => fetchEventsList(s), staleTime: 30_000 }); const setData = (up: CmsCalendarEvent[]|((old?:CmsCalendarEvent[])=>CmsCalendarEvent[]))=>qc.setQueryData(eventKeys.list(s),up); return { data:q.data, isLoading:q.isLoading, isError:q.isError, error:q.error as ApiError|null, refetch:q.refetch, setData }; }
export function useEventDetail(id:string) { return useQuery({ queryKey: eventKeys.detail(id), queryFn:()=>fetchCalendarEventById(id), enabled:!!id }); }
export function useCreateEvent() { const qc=useQueryClient(); return useMutation({ mutationFn:(payload:CreateCalendarEventPayload)=>createCalendarEvent(payload), onSuccess:()=>qc.invalidateQueries({queryKey:eventKeys.all}) }); }
export function useUpdateEvent() { const qc=useQueryClient(); return useMutation({ mutationFn:({id,payload}:{id:string;payload:UpdateCalendarEventPayload})=>updateCalendarEvent(id,payload), onSuccess:(_,v)=>{ qc.invalidateQueries({queryKey:eventKeys.detail(v.id)}); qc.invalidateQueries({queryKey:eventKeys.all}); } }); }
export function useDeleteEvent() { const qc=useQueryClient(); return useMutation({ mutationFn:deleteCalendarEvent, onSuccess:()=>qc.invalidateQueries({queryKey:eventKeys.all}) }); }
export function useUpdateEventStatus() { const qc=useQueryClient(); return useMutation({ mutationFn:({id,status}:{id:string;status:CmsEventStatus})=>updateCalendarEventStatus(id,status), onSuccess:(_,v)=>{ qc.invalidateQueries({queryKey:eventKeys.detail(v.id)}); qc.invalidateQueries({queryKey:eventKeys.all}); } }); }

export function useEvent(id: string | null) {
  return useQuery({
    queryKey: id ? eventKeys.detail(id) : [...eventKeys.all, "detail", "none"],
    queryFn: () => fetchCalendarEventById(id!),
    enabled: !!id,
  });
}

export interface UseEventListResult {
  events: CmsCalendarEvent[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setEvents: (updater: CmsCalendarEvent[] | ((old: CmsCalendarEvent[]) => CmsCalendarEvent[])) => void;
}

export function useEvents(status?: CmsEventStatus, category?: string): UseEventListResult {
  const queryClient = useQueryClient();
  const queryKey = [...eventKeys.list(status), category ?? "all"] as const;
  const query = useQuery({
    queryKey,
    queryFn: () => fetchEventsList(status, category),
    staleTime: 30_000,
  });
  const setEvents = (updater: CmsCalendarEvent[] | ((old: CmsCalendarEvent[]) => CmsCalendarEvent[])) => {
    queryClient.setQueryData<CmsCalendarEvent[]>(
      queryKey,
      typeof updater === "function" ? (old) => updater(old ?? []) : updater,
    );
  };
  return {
    events: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as ApiError | null,
    refetch: () => { void query.refetch(); },
    setEvents,
  };
}

export function useEventMutations() {
  return {
    create: useCreateEvent(),
    update: useUpdateEvent(),
    delete: useDeleteEvent(),
    updateStatus: useUpdateEventStatus(),
  };
}
