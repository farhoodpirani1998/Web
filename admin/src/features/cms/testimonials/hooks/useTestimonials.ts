/**
 * TanStack Query hooks for Testimonials.
 */
import {
  type QueryKey,
  type UseMutateFunction,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { ApiError } from "@/lib/apiError";

import {
  createTestimonial,
  deleteTestimonial,
  fetchTestimonialById,
  fetchTestimonialList,
  reorderTestimonials,
  updateTestimonial,
  updateTestimonialStatus,
} from "../api";
import type {
  CmsTestimonial,
  CmsTestimonialStatus,
  CreateTestimonialPayload,
  UpdateTestimonialPayload,
} from "../types";

type TestimonialCacheSnapshots = readonly (readonly [QueryKey, unknown])[];

interface TestimonialMutationContext {
  snapshots: TestimonialCacheSnapshots;
}

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
  setData: (
    updater: CmsTestimonial[] | ((old: CmsTestimonial[] | undefined) => CmsTestimonial[]),
  ) => void;
}

export function useTestimonialList(status?: CmsTestimonialStatus): UseTestimonialListResult {
  const queryClient = useQueryClient();
  const query = useQuery<CmsTestimonial[], ApiError>({
    queryKey: testimonialKeys.list(status),
    queryFn: () => fetchTestimonialList(status),
    staleTime: 30_000,
  });
  const setData = (updater: CmsTestimonial[] | ((old: CmsTestimonial[] | undefined) => CmsTestimonial[])) => {
    queryClient.setQueryData<CmsTestimonial[]>(testimonialKeys.list(status), updater);
  };
  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    setData,
  };
}

export interface UseTestimonialsResult {
  testimonials: CmsTestimonial[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: UseQueryResult<CmsTestimonial[], ApiError>["refetch"];
  setTestimonials: (
    updater: CmsTestimonial[] | ((current: CmsTestimonial[]) => CmsTestimonial[]),
  ) => void;
}

export function useTestimonials(status?: CmsTestimonialStatus): UseTestimonialsResult {
  const list = useTestimonialList(status);

  return {
    testimonials: list.data ?? [],
    isLoading: list.isLoading,
    error: list.error,
    refetch: list.refetch,
    setTestimonials: (updater) => {
      list.setData((current) =>
        typeof updater === "function" ? updater(current ?? []) : updater,
      );
    },
  };
}

export function useTestimonialById(id: string | null) {
  return useQuery<CmsTestimonial, ApiError>({
    queryKey: id ? testimonialKeys.detail(id) : ["testimonials", "detail", "null"],
    queryFn: () => fetchTestimonialById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export interface UseTestimonialMutations {
  create: UseMutateFunction<CmsTestimonial, ApiError, CreateTestimonialPayload>;
  update: UseMutateFunction<
    CmsTestimonial,
    ApiError,
    { id: string; payload: UpdateTestimonialPayload }
  >;
  delete: UseMutateFunction<void, ApiError, string>;
  updateStatus: UseMutateFunction<
    CmsTestimonial,
    ApiError,
    { id: string; status: CmsTestimonialStatus },
    TestimonialMutationContext
  >;
  reorder: UseMutateFunction<void, ApiError, string[], TestimonialMutationContext>;
}

export function useTestimonialMutations(): UseTestimonialMutations {
  const queryClient = useQueryClient();
  const create = useMutation<CmsTestimonial, ApiError, CreateTestimonialPayload>({
    mutationFn: createTestimonial,
    onSuccess: (newTestimonial) => {
      queryClient.setQueryData<CmsTestimonial[]>(testimonialKeys.list(undefined), (old) =>
        old ? [newTestimonial, ...old] : [newTestimonial],
      );
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all, exact: false });
    },
  });
  const update = useMutation<
    CmsTestimonial,
    ApiError,
    { id: string; payload: UpdateTestimonialPayload }
  >({
    mutationFn: ({ id, payload }) => updateTestimonial(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<CmsTestimonial[]>(testimonialKeys.list(undefined), (old) =>
        old?.map((testimonial) => (testimonial.id === updated.id ? updated : testimonial)) ?? [],
      );
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all, exact: false });
      queryClient.setQueryData(testimonialKeys.detail(updated.id), updated);
    },
  });
  const deleteMutation = useMutation<void, ApiError, string>({
    mutationFn: deleteTestimonial,
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData<CmsTestimonial[]>(testimonialKeys.list(undefined), (old) =>
        old?.filter((testimonial) => testimonial.id !== deletedId) ?? [],
      );
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all, exact: false });
      queryClient.removeQueries({ queryKey: testimonialKeys.detail(deletedId) });
    },
  });
  const updateStatus = useMutation<
    CmsTestimonial,
    ApiError,
    { id: string; status: CmsTestimonialStatus },
    TestimonialMutationContext
  >({
    mutationFn: ({ id, status }) => updateTestimonialStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: testimonialKeys.all });
      const previousLists = queryClient.getQueryCache().findAll({ queryKey: testimonialKeys.all });
      const snapshots = previousLists.map((query) => [
        query.queryKey,
        queryClient.getQueryData(query.queryKey),
      ] as const);
      queryClient.setQueryData<CmsTestimonial[]>(testimonialKeys.list(undefined), (old) =>
        old?.map((testimonial) =>
          testimonial.id === id ? { ...testimonial, status } : testimonial,
        ) ?? [],
      );
      queryClient.setQueryData<CmsTestimonial[]>(testimonialKeys.list(status), (old) =>
        old?.map((testimonial) =>
          testimonial.id === id ? { ...testimonial, status } : testimonial,
        ) ?? [],
      );
      queryClient.setQueryData<CmsTestimonial | undefined>(
        testimonialKeys.detail(id),
        (old) => (old ? { ...old, status } : old),
      );
      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      context?.snapshots?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: testimonialKeys.all, exact: false }),
  });
  const reorder = useMutation<void, ApiError, string[], TestimonialMutationContext>({
    mutationFn: reorderTestimonials,
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: testimonialKeys.all });
      const previousLists = queryClient.getQueryCache().findAll({ queryKey: testimonialKeys.all });
      const snapshots = previousLists.map((query) => [
        query.queryKey,
        queryClient.getQueryData(query.queryKey),
      ] as const);
      queryClient.setQueryData<CmsTestimonial[]>(testimonialKeys.list(undefined), (old) => {
        if (!old) return old;
        const byId = new Map(old.map((testimonial) => [testimonial.id, testimonial]));
        return orderedIds.map((id) => byId.get(id)!).filter(Boolean);
      });
      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      context?.snapshots?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: testimonialKeys.all, exact: false }),
  });

  return { create: create.mutate, update: update.mutate, delete: deleteMutation.mutate, updateStatus: updateStatus.mutate, reorder: reorder.mutate };
}
