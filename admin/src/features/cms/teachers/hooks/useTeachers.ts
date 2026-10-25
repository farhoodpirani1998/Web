/**
 * TanStack Query (React Query) hooks for the Teachers module.
 *
 * Replaces the old `useState` + `useEffect` pattern with proper server state management:
 * - Automatic caching, deduplication, and background refetching
 * - Optimistic updates for status changes, scheduling, and reordering
 * - Proper loading/error states without manual boilerplate
 *
 * Follows the same convention as `features/cms/faq/hooks/useFaqs.ts` but with
 * TanStack Query v5 instead of manual state.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutateFunction,
  type UseQueryResult,
} from "@tanstack/react-query";

import type { ApiError } from "@/lib/apiError";

import {
  createTeacher,
  deleteTeacher,
  fetchTeacherById,
  fetchTeacherList,
  reorderTeachers,
  type ScheduleTeacherPayload,
  type UpdateTeacherPayload,
  updateTeacher,
  updateTeacherStatus,
} from "../api";
import type { CmsTeacher, CmsTeacherStatus } from "../types";

/** Query key factory for consistent, type-safe query keys. */
export const teacherKeys = {
  all: ["teachers"] as const,
  list: (status?: CmsTeacherStatus) => [...teacherKeys.all, "list", status ?? "all"] as const,
  detail: (id: string) => [...teacherKeys.all, "detail", id] as const,
};

/** Shape returned by `useTeacherList` — mirrors the old `UseTeachersResult` but with TanStack Query types. */
export interface UseTeacherListResult {
  data: CmsTeacher[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: UseQueryResult<CmsTeacher[], ApiError>["refetch"];
  /** Direct cache setter for optimistic updates (reorder, status change, etc.). */
  setData: (updater: CmsTeacher[] | ((old: CmsTeacher[] | undefined) => CmsTeacher[])) => void;
}

/**
 * Fetches the teachers list (optionally filtered by status).
 * Uses TanStack Query for caching, background refetch, and deduping.
 */
export function useTeacherList(status?: CmsTeacherStatus): UseTeacherListResult {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: teacherKeys.list(status),
    queryFn: () => fetchTeacherList(status),
    staleTime: 30_000, // 30s fresh, then background refetch on window focus
  });

  const setData = (updater: CmsTeacher[] | ((old: CmsTeacher[] | undefined) => CmsTeacher[])) => {
    queryClient.setQueryData<CmsTeacher[]>(teacherKeys.list(status), updater);
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

/** Fetches a single teacher by ID — used by the form in edit mode. */
export function useTeacher(id: string | null) {
  return useQuery({
    queryKey: id ? teacherKeys.detail(id) : ["teachers", "detail", "null"],
    queryFn: () => fetchTeacherById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/** Mutation result type for create/update/delete/status/schedule/reorder. */
export interface UseTeacherMutations {
  create: UseMutateFunction<CmsTeacher, ApiError, Parameters<typeof createTeacher>[0]>;
  update: UseMutateFunction<CmsTeacher, ApiError, { id: string; payload: UpdateTeacherPayload }>;
  delete: UseMutateFunction<void, ApiError, string>;
  updateStatus: UseMutateFunction<CmsTeacher, ApiError, { id: string; status: CmsTeacherStatus }>;
  schedule: UseMutateFunction<CmsTeacher, ApiError, { id: string; payload: ScheduleTeacherPayload }>;
  reorder: UseMutateFunction<void, ApiError, string[]>;
}

/**
 * Provides all teacher mutations with automatic cache invalidation/optimistic updates.
 * Call `useTeacherMutations()` in the page component to get typed mutate functions.
 */
export function useTeacherMutations(): UseTeacherMutations {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: createTeacher,
    onSuccess: (newTeacher) => {
      // Optimistically add to the unfiltered list (status === undefined)
      queryClient.setQueryData<CmsTeacher[]>(teacherKeys.list(undefined), (old) =>
        old ? [newTeacher, ...old] : [newTeacher],
      );
      // Invalidate filtered lists so they refetch with correct data
      queryClient.invalidateQueries({ queryKey: teacherKeys.all, exact: false });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTeacherPayload }) => updateTeacher(id, payload),
    onSuccess: (updated) => {
      // Update all cached lists containing this teacher
      queryClient.setQueryData<CmsTeacher[]>(teacherKeys.list(undefined), (old) =>
        old?.map((t) => (t.id === updated.id ? updated : t)) ?? [],
      );
      queryClient.invalidateQueries({ queryKey: teacherKeys.all, exact: false });
      // Update detail cache if open
      queryClient.setQueryData(teacherKeys.detail(updated.id), updated);
    },
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: deleteTeacher,
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData<CmsTeacher[]>(teacherKeys.list(undefined), (old) =>
        old?.filter((t) => t.id !== deletedId) ?? [],
      );
      queryClient.invalidateQueries({ queryKey: teacherKeys.all, exact: false });
      queryClient.removeQueries({ queryKey: teacherKeys.detail(deletedId) });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CmsTeacherStatus }) => updateTeacherStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: teacherKeys.all });

      // Snapshot previous data for rollback
      const previousLists = queryClient.getQueryCache().findAll({ queryKey: teacherKeys.all });
      const snapshots = previousLists.map((q) => [q.queryKey, queryClient.getQueryData(q.queryKey)] as const);

      // Optimistically update all lists
      queryClient.setQueryData<CmsTeacher[]>(teacherKeys.list(undefined), (old) =>
        old?.map((t) => (t.id === id ? { ...t, status } : t)) ?? [],
      );
      queryClient.setQueryData<CmsTeacher[]>(teacherKeys.list(status), (old) =>
        old?.map((t) => (t.id === id ? { ...t, status } : t)) ?? [],
      );
      queryClient.setQueryData(teacherKeys.detail(id), (old: CmsTeacher | undefined) =>
        old ? { ...old, status } : old,
      );

      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      context?.snapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all, exact: false });
    },
  });

  const schedule = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ScheduleTeacherPayload }) => {
      // Import dynamically to avoid circular dependency
      return import("../api").then(({ scheduleTeacher }) => scheduleTeacher(id, payload));
    },
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: teacherKeys.all });

      const previousLists = queryClient.getQueryCache().findAll({ queryKey: teacherKeys.all });
      const snapshots = previousLists.map((q) => [q.queryKey, queryClient.getQueryData(q.queryKey)] as const);

      const publishAt = payload.publishAt;
      queryClient.setQueryData<CmsTeacher[]>(teacherKeys.list(undefined), (old) =>
        old?.map((t) => (t.id === id ? { ...t, publishAt } : t)) ?? [],
      );
      queryClient.setQueryData(teacherKeys.detail(id), (old: CmsTeacher | undefined) =>
        old ? { ...old, publishAt } : old,
      );

      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all, exact: false });
    },
  });

  const reorder = useMutation({
    mutationFn: reorderTeachers,
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: teacherKeys.all });

      const previousLists = queryClient.getQueryCache().findAll({ queryKey: teacherKeys.all });
      const snapshots = previousLists.map((q) => [q.queryKey, queryClient.getQueryData(q.queryKey)] as const);

      // Rebuild the list in the new order (only works for unfiltered list)
      queryClient.setQueryData<CmsTeacher[]>(teacherKeys.list(undefined), (old) => {
        if (!old) return old;
        const byId = new Map(old.map((t) => [t.id, t]));
        return orderedIds.map((id) => byId.get(id)!).filter(Boolean);
      });

      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all, exact: false });
    },
  });

  return {
    create: create.mutate,
    update: update.mutate,
    delete: deleteTeacherMutation.mutate,
    updateStatus: updateStatus.mutate,
    schedule: schedule.mutate,
    reorder: reorder.mutate,
  };
}

/** Hook for checking mutation pending states in the UI. */
export function useTeacherMutationStates() {
  const queryClient = useQueryClient();

  // We read mutation state from the query client's mutation cache
  // This is a simple way to track pending states without extra context
  return {
    isCreating: queryClient.getMutationCache().findAll({ mutationKey: ["teachers", "create"] }).some((m) => m.state.status === "pending"),
    isUpdating: queryClient.getMutationCache().findAll({ mutationKey: ["teachers", "update"] }).some((m) => m.state.status === "pending"),
    isDeleting: queryClient.getMutationCache().findAll({ mutationKey: ["teachers", "delete"] }).some((m) => m.state.status === "pending"),
    isUpdatingStatus: queryClient.getMutationCache().findAll({ mutationKey: ["teachers", "updateStatus"] }).some((m) => m.state.status === "pending"),
    isScheduling: queryClient.getMutationCache().findAll({ mutationKey: ["teachers", "schedule"] }).some((m) => m.state.status === "pending"),
    isReordering: queryClient.getMutationCache().findAll({ mutationKey: ["teachers", "reorder"] }).some((m) => m.state.status === "pending"),
  };
}