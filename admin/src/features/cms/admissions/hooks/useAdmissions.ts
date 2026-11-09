import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/apiError";
import {
  fetchAdmissionEntryList,
  fetchAdmissionEntryById,
  createAdmissionEntry,
  updateAdmissionEntry,
  deleteAdmissionEntry,
  updateAdmissionEntryStatus,
  reorderAdmissionEntries,
} from "../api";
import type {
  AdmissionEntryKind,
  CmsAdmissionEntry,
  CmsAdmissionStatus,
  UpdateAdmissionEntryPayload,
} from "../types";

export const admissionKeys = {
  all: ["admissions"] as const,
  list: (status?: CmsAdmissionStatus, kind?: AdmissionEntryKind) => [...admissionKeys.all, "list", status ?? "all", kind ?? "all"] as const,
  detail: (id: string) => [...admissionKeys.all, "detail", id] as const,
};

export function useAdmissionList(params?: { status?: CmsAdmissionStatus; kind?: AdmissionEntryKind }) {
  return useQuery<CmsAdmissionEntry[], ApiError>({
    queryKey: admissionKeys.list(params?.status, params?.kind),
    queryFn: () => fetchAdmissionEntryList(params),
  });
}

export function useAdmissions(params?: { status?: CmsAdmissionStatus; kind?: AdmissionEntryKind }) {
  const queryClient = useQueryClient();
  const query = useAdmissionList(params);
  const queryKey = admissionKeys.list(params?.status, params?.kind);

  return {
    entries: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    setEntries: (
      updater: CmsAdmissionEntry[] | ((current: CmsAdmissionEntry[]) => CmsAdmissionEntry[]),
    ) =>
      queryClient.setQueryData<CmsAdmissionEntry[]>(queryKey, (current = []) =>
        typeof updater === "function" ? updater(current) : updater,
      ),
  };
}

export function useAdmission(id: string | null) {
  return useQuery<CmsAdmissionEntry, ApiError>({
    queryKey: id ? admissionKeys.detail(id) : ["admissions", "detail", "null"],
    queryFn: () => (id ? fetchAdmissionEntryById(id) : Promise.reject(new Error("no id"))),
    enabled: !!id,
  });
}

export function useAdmissionMutations() {
  const qc = useQueryClient();
  const create = useMutation({ mutationFn: createAdmissionEntry, onSuccess: () => qc.invalidateQueries({ queryKey: admissionKeys.all }) });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: string; payload: UpdateAdmissionEntryPayload }) => updateAdmissionEntry(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: admissionKeys.all }) });
  const del = useMutation({ mutationFn: deleteAdmissionEntry, onSuccess: () => qc.invalidateQueries({ queryKey: admissionKeys.all }) });
  const statusMut = useMutation({ mutationFn: ({ id, status }: { id: string; status: CmsAdmissionStatus }) => updateAdmissionEntryStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: admissionKeys.all }) });
  const reorder = useMutation({ mutationFn: reorderAdmissionEntries, onSuccess: () => qc.invalidateQueries({ queryKey: admissionKeys.all }) });
  return { create, update, del, statusMut, reorder };
}
