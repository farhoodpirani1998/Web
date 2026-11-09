/**
 * TanStack Query v5 hooks for CMS Features.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/apiError";
import {
  fetchFeatureList,
  fetchFeatureById,
  createFeature,
  updateFeature,
  deleteFeature,
} from "../api";
import type { CmsFeature, CmsFeatureStatus, UpdateFeaturePayload } from "../types";

export const featureKeys = {
  all: ["features"] as const,
  list: (status?: CmsFeatureStatus) => [...featureKeys.all, "list", status ?? "all"] as const,
  detail: (id: string) => [...featureKeys.all, "detail", id] as const,
};

export function useFeatureList(status?: CmsFeatureStatus) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: featureKeys.list(status),
    queryFn: () => fetchFeatureList(status),
    staleTime: 30_000,
  });
  const setData = (updater: CmsFeature[] | ((old: CmsFeature[] | undefined) => CmsFeature[])) => {
    queryClient.setQueryData(featureKeys.list(status), updater);
  };
  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as ApiError | null,
    refetch: query.refetch,
    setData,
  };
}

export function useFeatures(status?: CmsFeatureStatus) {
  const list = useFeatureList(status);
  return {
    features: list.data ?? [],
    isLoading: list.isLoading,
    error: list.error,
    refetch: () => { void list.refetch(); },
    setFeatures: (updater: CmsFeature[] | ((old: CmsFeature[]) => CmsFeature[])) =>
      list.setData(typeof updater === "function" ? (old) => updater(old ?? []) : updater),
  };
}

export function useFeatureById(id: string | null) {
  return useQuery({
    queryKey: featureKeys.detail(id ?? ""),
    queryFn: () => fetchFeatureById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFeature,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: featureKeys.all }),
  });
}

export function useUpdateFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFeaturePayload }) => updateFeature(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: featureKeys.all }),
  });
}

export function useDeleteFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFeature(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: featureKeys.all }),
  });
}
