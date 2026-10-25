/**
 * TanStack Query hooks for Testimonials.
 */
import { useMutation, useQuery, useQueryClient, type UseMutateFunction, type UseQueryResult } from "@tanstack/react-query";

import type { ApiError } from "@/lib/apiError";

import {
  createTestimonial,
  deleteTestimonial,
  fetchTestimonialById,
  fetchTestimonialList,
  reorderTestimonials,
  updateTestimonial,
  updateTestimonialStatus,
  type UpdateTestimonialPayload,
} from "../api";
import type { CmsTestimonial, CmsTestimonialStatus } from "../types";

export const testimonialKeys = {
  all: ["testimonials"] as const,
  list: (status?: CmsTestimonialStatus) => [...testimonialKeys.all, "list", status ?? "all"] as const,
  detail: (id: string) => [...testimonialKeys.all, "detail", id] as const,
};

export interface UseTestimonialListResult {
  data: CmsTestimonial[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: UseQueryResult<CmsTestimonial[], ApiError>["refetch"];
  setData: (updater: CmsTestimonial[] | ((old: CmsTestimonial[] | undefined) => CmsTestimonial[])) => void;
}

export function useTestimonialList(status?: CmsTestimonialStatus): UseTestimonialListResult {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: testimonialKeys.list(status), queryFn: () => fetchTestimonialList(status), staleTime: 30_000 });
  const setData = (updater: CmsTestimonial[] | ((old: CmsTestimonial[] | undefined) => CmsTestimonial[])) => {
    queryClient.setQueryData<CmsTestimonial[]>(testimonialKeys.list(status), updater);
  };
  return { data: query.data, isLoading: query.isLoading, isError: query.isError, error: query.error as ApiError | null, refetch: query.refetch, setData };
}

export function useTestimonialById(id: string | null) {
  return useQuery({ queryKey: id ? testimonialKeys.detail(id) : ["testimonials", "detail", "null"], queryFn: () => fetchTestimonialById(id!), enabled: !!id, staleTime: 30_000 });
}

export interface UseTestimonialMutations {
  create: UseMutateFunction<CmsTestimonial, ApiError, Parameters<typeof createTestimonial>[0]>;
  update: UseMutateFunction<CmsTestimonial, ApiError, { id: string; payload: UpdateTestimonialPayload }>;
  delete: UseMutateFunction<void, ApiError, string>;
  updateStatus: UseMutateFunction<CmsTestimonial, ApiError, { id: string; status: CmsTestimonialStatus }>;
  reorder: UseMutateFunction<void, ApiError, string[]>;
}

export function useTestimonialMutations(): UseTestimonialMutations {
  const queryClient = useQueryClient();
  const create = useMutation({ mutationFn: createTestimonial, onSuccess: (newT) => { queryClient.setQueryData<CmsTestimonial[]>(testimonialKeys.list(undefined), (old) => old ? [newT, ...old] : [newT]); queryClient.invalidateQueries({ queryKey: testimonialKeys.all, exact: false }); } });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: string; payload: UpdateTestimonialPayload }) => updateTestimonial(id, payload), onSuccess: (updated) => { queryClient.setQueryData<CmsTestimonial[]>(testimonialKeys.list(undefined), (old) => old?.map((t) => (t.id === updated.id ? updated : t)) ?? []); queryClient.invalidateQueries({ queryKey: testimonialKeys.all, exact: false }); queryClient.setQueryData(testimonialKeys.detail(updated.id), updated); } });
  const deleteMutation = useMutation({ mutationFn: deleteTestimonial, onSuccess: (_data, deletedId) => { queryClient.setQueryData<CmsTestimonial[]>(testimonialKeys.list(undefined), (old) => old?.filter((t) => t.id !== deletedId) ?? []); queryClient.invalidateQueries({ queryKey: testimonialKeys.all, exact: false }); queryClient.removeQueries({ queryKey: testimonialKeys.detail(deletedId) }); } });
  const updateStatus = useMutation({ mutationFn: ({ id, status }: { id: string; status: CmsTestimonialStatus }) => updateTestimonialStatus(id, status), onMutate: async ({ id, status }) => { await queryClient.cancelQueries({ queryKey: testimonialKeys.all }); const previousLists = queryClient.getQueryCache().findAll({ queryKey: testimonialKeys.all }); const snapshots = previousLists.map((q) => [q.queryKey, queryClient.getQueryData(q.queryKey)] as const); queryClient.setQueryData<CmsTestimonial[]>(testimonialKeys.list(undefined), (old) => old?.map((t) => (t.id === id ? { ...t, status } : t)) ?? []); queryClient.setQueryData<CmsTestimonial[]>(testimonialKeys.list(status), (old) => old?.map((t) => (t.id === id ? { ...t, status } : t)) ?? []); queryClient.setQueryData(testimonialKeys.detail(id), (old: CmsTestimonial | undefined) => old ? { ...old, status } : old); return { snapshots }; }, onError: (_err, _vars, context) => { context?.snapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data)); }, onSettled: () => { queryClient.invalidateQueries({ queryKey: testimonialKeys.all, exact: false }); } });
  const reorder = useMutation({ mutationFn: reorderTestimonials, onMutate: async (orderedIds) => { await queryClient.cancelQueries({ queryKey: testimonialKeys.all }); const previousLists = queryClient.getQueryCache().findAll({ queryKey: testimonialKeys.all }); const snapshots = previousLists.map((q) => [q.queryKey, queryClient.getQueryData(q.queryKey)] as const); queryClient.setQueryData<CmsTestimonial[]>(testimonialKeys.list(undefined), (old) => { if (!old) return old; const byId = new Map(old.map((t) => [t.id, t])); return orderedIds.map((id) => byId.get(id)!).filter(Boolean); }); return { snapshots }; }, onError: (_err, _vars, context) => { context?.snapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data)); }, onSettled: () => { queryClient.invalidateQueries({ queryKey: testimonialKeys.all, exact: false }); } });
  return { create: create.mutate, update: update.mutate, delete: deleteMutation.mutate, updateStatus: updateStatus.mutate, reorder: reorder.mutate };
}
