import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/apiError";
import {
  fetchAcademicCalendarEntryList,
  fetchAcademicCalendarEntryById,
  createAcademicCalendarEntry,
  updateAcademicCalendarEntry,
  deleteAcademicCalendarEntry,
  updateAcademicCalendarEntryStatus,
  reorderAcademicCalendarEntries,
} from "../api";
import type { CmsAcademicCalendarEntry, CmsAcademicCalendarStatus, AcademicCalendarEntryKind } from "../types";

export const academicCalendarKeys = {
  all: ["academic-calendar"] as const,
  list: (status?: CmsAcademicCalendarStatus, kind?: AcademicCalendarEntryKind) => [...academicCalendarKeys.all, "list", status ?? "all", kind ?? "all"] as const,
  detail: (id: string) => [...academicCalendarKeys.all, "detail", id] as const,
};

export function useAcademicCalendarEntryList(params?: { status?: CmsAcademicCalendarStatus; kind?: AcademicCalendarEntryKind }) {
  return useQuery<CmsAcademicCalendarEntry[], ApiError>({
    queryKey: academicCalendarKeys.list(params?.status, params?.kind),
    queryFn: () => fetchAcademicCalendarEntryList(params),
  });
}

export function useAcademicCalendarEntry(id: string | null) {
  return useQuery<CmsAcademicCalendarEntry, ApiError>({
    queryKey: id ? academicCalendarKeys.detail(id) : ["academic-calendar", "detail", "null"],
    queryFn: () => (id ? fetchAcademicCalendarEntryById(id) : Promise.reject(new Error("no id"))),
    enabled: !!id,
  });
}

export function useAcademicCalendarMutations() {
  const qc = useQueryClient();
  const create = useMutation({ mutationFn: createAcademicCalendarEntry, onSuccess: () => qc.invalidateQueries({ queryKey: academicCalendarKeys.all }) });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: string; payload: any }) => updateAcademicCalendarEntry(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: academicCalendarKeys.all }) });
  const del = useMutation({ mutationFn: deleteAcademicCalendarEntry, onSuccess: () => qc.invalidateQueries({ queryKey: academicCalendarKeys.all }) });
  const statusMut = useMutation({ mutationFn: ({ id, status }: { id: string; status: CmsAcademicCalendarStatus }) => updateAcademicCalendarEntryStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: academicCalendarKeys.all }) });
  const reorder = useMutation({ mutationFn: reorderAcademicCalendarEntries, onSuccess: () => qc.invalidateQueries({ queryKey: academicCalendarKeys.all }) });
  return { create, update, del, statusMut, reorder };
}
