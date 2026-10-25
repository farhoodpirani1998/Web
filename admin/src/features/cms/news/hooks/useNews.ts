import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import type { CmsNewsArticle, CmsNewsStatus } from "../types";
import {
  fetchNewsList, fetchNewsArticleById, createNewsArticle, updateNewsArticle, deleteNewsArticle, updateNewsArticleStatus,
} from "../api";
import type { ApiError } from "@/lib/apiError";
import type { UpdateNewsPayload, ScheduleNewsPayload } from "../schema";

export const newsKeys = {
  all: ["news"] as const,
  list: (status?: CmsNewsStatus) => [...newsKeys.all, "list", status ?? "all"] as const,
  detail: (id: string) => [...newsKeys.all, "detail", id] as const,
};

export function useNewsList(status?: CmsNewsStatus) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: newsKeys.list(status),
    queryFn: () => fetchNewsList(status),
    staleTime: 30_000,
  });
  const setData = (updater: CmsNewsArticle[] | ((old: CmsNewsArticle[] | undefined) => CmsNewsArticle[])) => {
    queryClient.setQueryData<CmsNewsArticle[]>(newsKeys.list(status), updater);
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

export function useNewsDetail(id: string) {
  return useQuery({
    queryKey: newsKeys.detail(id),
    queryFn: () => fetchNewsArticleById(id),
    enabled: !!id,
  });
}

export function useCreateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNewsArticle,
    onSuccess: () => qc.invalidateQueries({ queryKey: newsKeys.all }),
  });
}

export function useUpdateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateNewsPayload }) => updateNewsArticle(id, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: newsKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: newsKeys.all });
    },
  });
}

export function useDeleteNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteNewsArticle,
    onSuccess: () => qc.invalidateQueries({ queryKey: newsKeys.all }),
  });
}

export function useUpdateNewsStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CmsNewsStatus }) => updateNewsArticleStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: newsKeys.all });
      const previousLists = qc.getQueryCache().findAll({ queryKey: newsKeys.all });
      const snapshots = previousLists.map((q) => [q.queryKey, qc.getQueryData(q.queryKey)] as const);
      qc.setQueryData<CmsNewsArticle[]>(newsKeys.list(undefined), (old) => old?.map((t) => (t.id === id ? { ...t, status } : t)) ?? []);
      qc.setQueryData<CmsNewsArticle[]>(newsKeys.list(status), (old) => old?.map((t) => (t.id === id ? { ...t, status } : t)) ?? []);
      qc.setQueryData<CmsNewsArticle>(newsKeys.detail(id), (old) => old ? { ...old, status } : old);
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => { qc.invalidateQueries({ queryKey: newsKeys.all, exact: false }); },
  });
}

// Preserve legacy export name expected by index
export { useNewsList as useNews, type UseNewsResult } from "./useNews";
