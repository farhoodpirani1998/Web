/**
 * TanStack Query hooks for the Pages module.
 * Replaces manual useState/useEffect with server-state management.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import type { ApiError } from "@/lib/apiError";

import {
  createPage,
  deletePage,
  fetchPageById,
  fetchPagesList,
  updatePage,
  updatePageStatus,
  schedulePage,
  setPageHomepage,
} from "../api";
import type { CmsPage, CmsPageStatus, CreatePagePayload, UpdatePagePayload, SchedulePagePayload, SetPageHomepagePayload } from "../types";

export const pageKeys = {
  all: ["pages"] as const,
  list: (status?: CmsPageStatus, parentId?: string) =>
    [...pageKeys.all, "list", status ?? "all", parentId ?? "all"] as const,
  detail: (id: string) => [...pageKeys.all, "detail", id] as const,
  options: ["pages", "options"] as const,
};

export interface UsePagesResult {
  data: CmsPage[] | undefined;
  pages: CmsPage[];
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: UseQueryResult<CmsPage[], Error>["refetch"];
  setData: (updater: CmsPage[] | ((old: CmsPage[] | undefined) => CmsPage[])) => void;
  setPages: (updater: CmsPage[] | ((old: CmsPage[]) => CmsPage[])) => void;
}

export function usePages(status?: CmsPageStatus, parentId?: string): UsePagesResult {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: pageKeys.list(status, parentId),
    queryFn: () => fetchPagesList(status, parentId),
    staleTime: 30_000,
  });
  const setData = (updater: CmsPage[] | ((old: CmsPage[] | undefined) => CmsPage[])) => {
    queryClient.setQueryData<CmsPage[]>(pageKeys.list(status, parentId), updater);
  };
  const setPages = (updater: CmsPage[] | ((old: CmsPage[]) => CmsPage[])) => {
    queryClient.setQueryData<CmsPage[]>(pageKeys.list(status, parentId), (old) => {
      const pages = old ?? [];
      return typeof updater === "function" ? updater(pages) : updater;
    });
  };
  return {
    data: query.data,
    pages: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as ApiError | null,
    refetch: query.refetch,
    setData,
    setPages,
  };
}

export function usePage(id: string | null) {
  return useQuery({
    queryKey: id ? pageKeys.detail(id) : ["pages", "detail", "null"],
    queryFn: () => fetchPageById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export interface UsePageOptionsResult {
  data: CmsPage[] | undefined;
  options: CmsPage[];
  isLoading: boolean;
}

export function usePageOptions(): UsePageOptionsResult {
  const query = useQuery({
    queryKey: pageKeys.options,
    queryFn: () => fetchPagesList(),
    staleTime: 60_000,
  });
  return { data: query.data, options: query.data ?? [], isLoading: query.isLoading };
}

export interface UsePageMutations {
  create: (payload: CreatePagePayload) => void;
  update: (variables: { id: string; payload: UpdatePagePayload }) => void;
  delete: (id: string) => void;
  updateStatus: (variables: { id: string; status: CmsPageStatus }) => void;
  schedule: (variables: { id: string; payload: SchedulePagePayload }) => void;
  setHomepage: (variables: { id: string; payload: SetPageHomepagePayload }) => void;
}

export function usePageMutations(): UsePageMutations {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: createPage,
    onSuccess: (newPage) => {
      queryClient.setQueryData<CmsPage[]>(pageKeys.list(), (old) =>
        old ? [newPage, ...old] : [newPage],
      );
      queryClient.invalidateQueries({ queryKey: pageKeys.all, exact: false });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePagePayload }) => updatePage(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<CmsPage[]>(pageKeys.list(), (old) =>
        old?.map((p) => (p.id === updated.id ? updated : p)) ?? [],
      );
      queryClient.invalidateQueries({ queryKey: pageKeys.all, exact: false });
      queryClient.setQueryData(pageKeys.detail(updated.id), updated);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData<CmsPage[]>(pageKeys.list(), (old) => old?.filter((p) => p.id !== deletedId) ?? []);
      queryClient.invalidateQueries({ queryKey: pageKeys.all, exact: false });
      queryClient.removeQueries({ queryKey: pageKeys.detail(deletedId) });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CmsPageStatus }) => updatePageStatus(id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData<CmsPage[]>(pageKeys.list(), (old) =>
        old?.map((p) => (p.id === updated.id ? updated : p)) ?? [],
      );
      queryClient.invalidateQueries({ queryKey: pageKeys.all, exact: false });
      queryClient.setQueryData(pageKeys.detail(updated.id), updated);
    },
  });

  const schedule = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SchedulePagePayload }) => schedulePage(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<CmsPage[]>(pageKeys.list(), (old) =>
        old?.map((p) => (p.id === updated.id ? updated : p)) ?? [],
      );
      queryClient.invalidateQueries({ queryKey: pageKeys.all, exact: false });
      queryClient.setQueryData(pageKeys.detail(updated.id), updated);
    },
  });

  const setHomepage = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SetPageHomepagePayload }) => setPageHomepage(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<CmsPage[]>(pageKeys.list(), (old) =>
        old?.map((p) => (p.id === updated.id ? { ...p, isHomepage: updated.isHomepage } : { ...p, isHomepage: false })) ?? [],
      );
      queryClient.invalidateQueries({ queryKey: pageKeys.all, exact: false });
      queryClient.setQueryData(pageKeys.detail(updated.id), updated);
    },
  });

  return {
    create: create.mutate,
    update: update.mutate,
    delete: deleteMutation.mutate,
    updateStatus: updateStatus.mutate,
    schedule: schedule.mutate,
    setHomepage: setHomepage.mutate,
  };
}
