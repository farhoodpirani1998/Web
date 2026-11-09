import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/apiError";
import {
  fetchPreRegistrationById,
  fetchPreRegistrationList,
  updatePreRegistrationStatus,
  updatePreRegistrationAssignment,
} from "../api";
import type {
  CmsPreRegistration,
  CmsPreRegistrationStatus,
  UpdatePreRegistrationAssignmentPayload,
} from "../types";

export const preRegistrationKeys = {
  all: ["pre-registrations"] as const,
  list: (status?: CmsPreRegistrationStatus) =>
    [...preRegistrationKeys.all, "list", status ?? "all"] as const,
  detail: (id: string) => [...preRegistrationKeys.all, "detail", id] as const,
};

export function usePreRegistrationList(status?: CmsPreRegistrationStatus) {
  return useQuery<CmsPreRegistration[], ApiError>({
    queryKey: preRegistrationKeys.list(status),
    queryFn: () => fetchPreRegistrationList(status),
  });
}

export function usePreRegistrations(status?: CmsPreRegistrationStatus) {
  const queryClient = useQueryClient();
  const query = usePreRegistrationList(status);
  const setPreRegistrations = (
    updater:
      | CmsPreRegistration[]
      | ((current: CmsPreRegistration[]) => CmsPreRegistration[]),
  ) => {
    queryClient.setQueryData<CmsPreRegistration[]>(
      preRegistrationKeys.list(status),
      (current) => (typeof updater === "function" ? updater(current ?? []) : updater),
    );
  };

  return {
    preRegistrations: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    setPreRegistrations,
  };
}

export function usePreRegistration(id: string | null) {
  return useQuery<CmsPreRegistration, ApiError>({
    queryKey: id
      ? preRegistrationKeys.detail(id)
      : ["pre-registrations", "detail", "null"],
    queryFn: () =>
      id ? fetchPreRegistrationById(id) : Promise.reject(new Error("no id")),
    enabled: !!id,
  });
}

export function usePreRegistrationMutations() {
  const queryClient = useQueryClient();
  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CmsPreRegistrationStatus }) =>
      updatePreRegistrationStatus(id, { status }),
    onSuccess: (updated) => {
      queryClient.getQueryCache().findAll({ queryKey: preRegistrationKeys.all }).forEach(
        ({ queryKey }) => {
          if (queryKey[1] !== "list") return;

          const statusFilter = queryKey[2];
          queryClient.setQueryData<CmsPreRegistration[]>(queryKey, (current) => {
            if (!current) return current;

            const alreadyIncluded = current.some((item) => item.id === updated.id);
            const matchesFilter =
              statusFilter === "all" || statusFilter === updated.status;

            if (!matchesFilter) {
              return current.filter((item) => item.id !== updated.id);
            }
            if (alreadyIncluded) {
              return current.map((item) => (item.id === updated.id ? updated : item));
            }
            return [...current, updated];
          });
        },
      );
      queryClient.setQueryData(preRegistrationKeys.detail(updated.id), updated);
      return queryClient.invalidateQueries({ queryKey: preRegistrationKeys.all });
    },
  });

  const followUpMut = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePreRegistrationAssignmentPayload;
    }) => updatePreRegistrationAssignment(id, payload),
    onSuccess: (updated) => {
      queryClient.getQueryCache().findAll({ queryKey: preRegistrationKeys.all }).forEach(
        ({ queryKey }) => {
          if (queryKey[1] !== "list") return;
          queryClient.setQueryData<CmsPreRegistration[]>(queryKey, (current) =>
            current?.map((item) => (item.id === updated.id ? updated : item)),
          );
        },
      );
      queryClient.setQueryData(preRegistrationKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: preRegistrationKeys.all });
    },
  });

  return { statusMut, followUpMut };
}
