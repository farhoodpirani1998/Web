import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/apiError";
import {
  fetchAdmissionList,
  fetchAdmissionById,
  createAdmission,
  updateAdmission,
  deleteAdmission,
  updateAdmissionStatus,
  reorderAdmissions,
} from "../api";
import type { CmsAdmissionEntry, CmsAcademicCalendarStatus, AdmissionEntryKind } from "../types";

export const admissionKeys = {
  all: ["admissions"] as const,
  list: (status?: CmsAcademicCalendarStatus, kind?: AdmissionEntryKind) => [...admissionKeys.all, "list", status ?? "all", kind ?? "all"] as const,
  detail: (id: string) => [...admissionKeys.all, "detail", id] as const,
};

export function useAdmissionList(params?: { status?: CmsAcademicCalendarStatus; kind?: AdmissionEntryKind }) {
  return useQuery<CmsAdmissionEntry[], ApiError>({
    queryKey: admissionKeys.list(params?.status, params?.kind),
    queryFn: () => fetchAdmissionList(params),
  });
}

export function useAdmission(id: string | null) {
  return useQuery<CmsAdmissionEntry, ApiError>({
    queryKey: id ? admissionKeys.detail(id) : ["admissions", "detail", "null"],
    queryFn: () => (id ? fetchAdmissionById(id) : Promise.reject(new Error("no id"))),
    enabled: !!id,
  });
}

export function useAdmissionMutations() {
  const qc = useQueryClient();
  const create = useMutation({ mutationFn: createAdmission, onSuccess: () => qc.invalidateQueries({ queryKey: admissionKeys.all }) });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: string; payload: any }) => updateAdmission(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: admissionKeys.all }) });
  const del = useMutation({ mutationFn: deleteAdmission, onSuccess: () => qc.invalidateQueries({ queryKey: admissionKeys.all }) });
  const statusMut = useMutation({ mutationFn: ({ id, status }: { id: string; status: CmsAcademicCalendarStatus }) => updateAdmissionStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: admissionKeys.all }) });
  const reorder = useMutation({ mutationFn: reorderAdmissions, onSuccess: () => qc.invalidateQueries({ queryKey: admissionKeys.all }) });
  return { create, update, del, statusMut, reorder };
}
