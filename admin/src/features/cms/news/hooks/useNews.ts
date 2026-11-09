import { useMutation, useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import type { CmsNewsArticle, CmsNewsStatus } from "../types";
import {
  fetchNewsList, fetchNewsArticleById, createNewsArticle, updateNewsArticle, deleteNewsArticle, updateNewsArticleStatus,
} from "../api";
import type { ApiError } from "@/lib/apiError";
import type { UpdateNewsPayload } from "../schema";

export interface UseNewsListResult {
  data: CmsNewsArticle[] | undefined;
  articles: CmsNewsArticle[];
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: UseQueryResult<CmsNewsArticle[], Error>["refetch"];
  setData: (updater: CmsNewsArticle[] | ((old: CmsNewsArticle[] | undefined) => CmsNewsArticle[])) => void;
  setArticles: (updater: CmsNewsArticle[] | ((old: CmsNewsArticle[]) => CmsNewsArticle[])) => void;
}

export const newsKeys = {
  all: ["news"] as const,
  list: (status?: CmsNewsStatus) => [...newsKeys.all, "list", status ?? "all"] as const,
  detail: (id: string) => [...newsKeys.all, "detail", id] as const,
};

export function useNewsList(status?: CmsNewsStatus, category?: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: newsKeys.list(status),
    queryFn: () => fetchNewsList(status),
    staleTime: 30_000,
  });
  const setData = (updater: CmsNewsArticle[] | ((old: CmsNewsArticle[] | undefined) => CmsNewsArticle[])) => {
    queryClient.setQueryData<CmsNewsArticle[]>(newsKeys.list(status), updater);
  };
  const setArticles = (updater: CmsNewsArticle[] | ((old: CmsNewsArticle[]) => CmsNewsArticle[])) => {
    queryClient.setQueryData<CmsNewsArticle[]>(newsKeys.list(status), (old) => {
      const articles = old ?? [];
      return typeof updater === "function" ? updater(articles) : updater;
    });
  };
  return {
    data: query.data,
    articles: category ? (query.data ?? []).filter((article) => article.category === category) : query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as ApiError | null,
    refetch: query.refetch,
    setData,
    setArticles,
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

export function useNews(status?: CmsNewsStatus, category?: string): UseNewsListResult {
  return useNewsList(status, category);
}
