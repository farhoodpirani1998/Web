import type { Dispatch, SetStateAction } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutateFunction,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ApiError } from "@/lib/apiError";
import {
  createGalleryItem,
  deleteGalleryItem,
  fetchGalleryItemById,
  fetchGalleryList,
  reorderGalleryItems,
  updateGalleryItem,
  updateGalleryItemStatus,
} from "../api";
import type {
  CmsGalleryItem,
  CmsGalleryStatus,
  CreateGalleryItemPayload,
  UpdateGalleryItemPayload,
} from "../types";

/**
 * TanStack Query v5 hooks for CMS Gallery.
 */
export const galleryKeys = {
  all: ["gallery"] as const,
  list: (status?: CmsGalleryStatus) => [...galleryKeys.all, "list", status ?? "all"] as const,
  detail: (id: string) => [...galleryKeys.all, "detail", id] as const,
};

export interface UseGalleryListResult {
  data: CmsGalleryItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: UseQueryResult<CmsGalleryItem[], ApiError>["refetch"];
  setData: (updater: CmsGalleryItem[] | ((old: CmsGalleryItem[] | undefined) => CmsGalleryItem[])) => void;
}

export function useGalleryList(status?: CmsGalleryStatus): UseGalleryListResult {
  const queryClient = useQueryClient();
  const query = useQuery<CmsGalleryItem[], ApiError>({
    queryKey: galleryKeys.list(status),
    queryFn: () => fetchGalleryList(status),
    staleTime: 30_000,
  });
  const setData = (updater: CmsGalleryItem[] | ((old: CmsGalleryItem[] | undefined) => CmsGalleryItem[])) => {
    queryClient.setQueryData<CmsGalleryItem[]>(galleryKeys.list(status), updater);
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

export function useGalleryById(id: string | null) {
  return useQuery({
    queryKey: id ? galleryKeys.detail(id) : ["gallery", "detail", "null"],
    queryFn: () => fetchGalleryItemById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export interface UseGalleryMutations {
  create: UseMutateFunction<CmsGalleryItem, ApiError, CreateGalleryItemPayload>;
  update: UseMutateFunction<CmsGalleryItem, ApiError, { id: string; payload: UpdateGalleryItemPayload }>;
  delete: UseMutateFunction<void, ApiError, string>;
  updateStatus: UseMutateFunction<CmsGalleryItem, ApiError, { id: string; status: CmsGalleryStatus }>;
  reorder: UseMutateFunction<void, ApiError, string[]>;
}

export function useGalleryMutations(): UseGalleryMutations {
  const queryClient = useQueryClient();

  const create = useMutation<CmsGalleryItem, ApiError, CreateGalleryItemPayload>({
    mutationFn: createGalleryItem,
    onSuccess: (newItem) => {
      queryClient.setQueryData<CmsGalleryItem[]>(galleryKeys.list(undefined), (old) =>
        old ? [newItem, ...old] : [newItem],
      );
      queryClient.invalidateQueries({ queryKey: galleryKeys.all, exact: false });
    },
  });

  const update = useMutation<
    CmsGalleryItem,
    ApiError,
    { id: string; payload: UpdateGalleryItemPayload }
  >({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGalleryItemPayload }) => updateGalleryItem(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<CmsGalleryItem[]>(galleryKeys.list(undefined), (old) =>
        old?.map((g) => (g.id === updated.id ? updated : g)) ?? [],
      );
      queryClient.invalidateQueries({ queryKey: galleryKeys.all, exact: false });
      queryClient.setQueryData(galleryKeys.detail(updated.id), updated);
    },
  });

  const deleteMutation = useMutation<void, ApiError, string>({
    mutationFn: deleteGalleryItem,
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData<CmsGalleryItem[]>(galleryKeys.list(undefined), (old) =>
        old?.filter((g) => g.id !== deletedId) ?? [],
      );
      queryClient.invalidateQueries({ queryKey: galleryKeys.all, exact: false });
      queryClient.removeQueries({ queryKey: galleryKeys.detail(deletedId) });
    },
  });

  const updateStatus = useMutation<
    CmsGalleryItem,
    ApiError,
    { id: string; status: CmsGalleryStatus },
    { snapshots: (readonly [readonly unknown[], unknown])[] }
  >({
    mutationFn: ({ id, status }: { id: string; status: CmsGalleryStatus }) => updateGalleryItemStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: galleryKeys.all });
      const previousLists = queryClient.getQueryCache().findAll({ queryKey: galleryKeys.all });
      const snapshots = previousLists.map((q) => [q.queryKey, queryClient.getQueryData(q.queryKey)] as const);
      queryClient.setQueryData<CmsGalleryItem[]>(galleryKeys.list(undefined), (old) =>
        old?.map((g) => (g.id === id ? { ...g, status } : g)) ?? [],
      );
      queryClient.setQueryData<CmsGalleryItem[]>(galleryKeys.list(status), (old) =>
        old?.map((g) => (g.id === id ? { ...g, status } : g)) ?? [],
      );
      queryClient.setQueryData(galleryKeys.detail(id), (old: CmsGalleryItem | undefined) =>
        old ? { ...old, status } : old,
      );
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all, exact: false });
    },
  });

  const reorder = useMutation<
    void,
    ApiError,
    string[],
    { snapshots: (readonly [readonly unknown[], unknown])[] }
  >({
    mutationFn: reorderGalleryItems,
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: galleryKeys.all });
      const previousLists = queryClient.getQueryCache().findAll({ queryKey: galleryKeys.all });
      const snapshots = previousLists.map((q) => [q.queryKey, queryClient.getQueryData(q.queryKey)] as const);
      queryClient.setQueryData<CmsGalleryItem[]>(galleryKeys.list(undefined), (old) => {
        if (!old) return old;
        const byId = new Map(old.map((g) => [g.id, g]));
        return orderedIds.map((id) => byId.get(id)!).filter(Boolean);
      });
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all, exact: false });
    },
  });

  return {
    create: create.mutate,
    update: update.mutate,
    delete: deleteMutation.mutate,
    updateStatus: updateStatus.mutate,
    reorder: reorder.mutate,
  };
}

/** Legacy alias for backward compatibility with old `useGallery` consumers. */
export function useGallery(status?: CmsGalleryStatus) {
  // Delegate to modern list hook; preserves old interface shape for page usage
  const list = useGalleryList(status);
  return {
    items: list.data ?? [],
    isLoading: list.isLoading,
    error: list.error,
    refetch: () => list.refetch(),
    setItems: list.setData as unknown as Dispatch<SetStateAction<CmsGalleryItem[]>>,
  };
}
export type UseGalleryResult = ReturnType<typeof useGallery>;
