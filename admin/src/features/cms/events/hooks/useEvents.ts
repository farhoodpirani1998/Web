import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CmsCalendarEvent, CmsEventStatus } from "../types";
import { fetchEventsList, fetchCalendarEventById, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, updateCalendarEventStatus } from "../api";
import type { ApiError } from "@/lib/apiError";
import type { UpdateEventPayload } from "../schema";
export const eventKeys = { all: ["events"] as const, list: (s?: CmsEventStatus) => [...eventKeys.all,"list",s??"all"] as const, detail: (id:string)=>[...eventKeys.all,"detail",id] as const };
export function useEventList(s?: CmsEventStatus) { const qc = useQueryClient(); const q = useQuery({ queryKey: eventKeys.list(s), queryFn: () => fetchEventsList(s), staleTime: 30_000 }); const setData = (up: CmsCalendarEvent[]|((old?:CmsCalendarEvent[])=>CmsCalendarEvent[]))=>qc.setQueryData(eventKeys.list(s),up); return { data:q.data, isLoading:q.isLoading, isError:q.isError, error:q.error as ApiError|null, refetch:q.refetch, setData }; }
export function useEventDetail(id:string) { return useQuery({ queryKey: eventKeys.detail(id), queryFn:()=>fetchCalendarEventById(id), enabled:!!id }); }
export function useCreateEvent() { const qc=useQueryClient(); return useMutation({ mutationFn:createCalendarEvent, onSuccess:()=>qc.invalidateQueries({queryKey:eventKeys.all}) }); }
export function useUpdateEvent() { const qc=useQueryClient(); return useMutation({ mutationFn:({id,payload}:{id:string;payload:UpdateEventPayload})=>updateCalendarEvent(id,payload), onSuccess:(_,v)=>{ qc.invalidateQueries({queryKey:eventKeys.detail(v.id)}); qc.invalidateQueries({queryKey:eventKeys.all}); } }); }
export function useDeleteEvent() { const qc=useQueryClient(); return useMutation({ mutationFn:deleteCalendarEvent, onSuccess:()=>qc.invalidateQueries({queryKey:eventKeys.all}) }); }
export function useUpdateEventStatus() { const qc=useQueryClient(); return useMutation({ mutationFn:({id,status}:{id:string;status:CmsEventStatus})=>updateCalendarEventStatus(id,status), onSuccess:(_,v)=>{ qc.invalidateQueries({queryKey:eventKeys.detail(v.id)}); qc.invalidateQueries({queryKey:eventKeys.all}); } }); }
